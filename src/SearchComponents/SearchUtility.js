import {getObjectTypeForProp} from "../dsp-services";
import {json} from '../store.js';
import {get} from 'svelte/store';
const jVal = get(json);
let ontology = jVal['DSP']['Ontology'];
let shortName = jVal['DSP']['ShortName'];
export function getPropString(prop){
    let toReturn = '';
    let curr = prop;

    let linkStack = [];
    while(curr){
        linkStack.push(curr);
        curr = curr['linkedVia'];
    }
    let parent = '?mainres';
    let currProp;
    while (linkStack.length > 0){
        currProp = linkStack.pop();
        if ("incoming" in currProp && currProp["incoming"] === "true"){
            toReturn += '?' + currProp['propName'] +  ' ' + shortName + ':' + currProp['propName'] + ' ' + parent + ' .\n'  ;
        } else {
            toReturn += parent + ' ' + shortName + ':' + currProp['propName'] + ' ?' + currProp['propName'] + ' .\n';
        }
        parent = '?' + currProp['propName'];
    }
    return toReturn;
}
export function getFilterByNameValAndObj(propName, value, obj, dateDepth=''){
    const propGravId = '?' + propName.replace(ontology + ':', '');
    switch(obj){
        case 'knora-api:DateValue':
            const dates = getDatesFromValue(value, dateDepth);
            return 'FILTER (knora-api:toSimpleDate(' + propGravId + ') <= "' + dates[1] + '"^^knora-api-simple:Date && knora-api:toSimpleDate(' + propGravId + ') > "' + dates[0] + '"^^knora-api-simple:Date) .\n';
        case 'knora-api:ListValue':
            return propGravId + ' knora-api:listValueAsListNode <' + value + '> .';
        case 'knora-api:TextValue':
            return propGravId + ' knora-api:valueAsString ' + propGravId + 'Str .\nFILTER regex(' + propGravId + 'Str, "' + value + '", "i") .\n';
        case 'knora-api:IntValue':
            return propGravId + ' knora-api:intValueAsInt ' + propGravId + 'Int .\nFILTER(' + propGravId + 'Int  = ' + value + ') .\n'; //TODO: might be bugged, test
    }
}
export async function getFilterByNameAndVal(propName, value, dateDepth = ''){
    let obj = await getObjectTypeForProp(propName);
    return getFilterByNameValAndObj(propName, value, obj, dateDepth);
}

function getDatesFromValue(value, dateDepth){
    let dateAfter = '';
    let dateBefore = '';
    if (dateDepth === 'year'){
        dateAfter = 'GREGORIAN:' + value + '-12-31';
        dateBefore = 'GREGORIAN:' + (parseInt(value) - 1).toString() + '-12-31';
    } else if (dateDepth === 'month'){
        const dateConst = new Date(value);
        const dateBeforeAsDate = new Date(dateConst.getTime());
        dateBeforeAsDate.setDate(dateConst.getDate() - 1);
        dateBefore = 'GREGORIAN:' + dateBeforeAsDate.getFullYear().toString() + '-' + (dateBeforeAsDate.getMonth() + 1).toString() + '-' + dateBeforeAsDate.getDate().toString();
        const dateAfterAsDate = new Date(dateConst.getFullYear(), dateConst.getMonth() + 1, 0); //set to last day of month
        dateAfter = 'GREGORIAN:' + (dateAfterAsDate.getFullYear()).toString() + '-' + (dateAfterAsDate.getMonth() + 1).toString() + '-' + dateAfterAsDate.getDate().toString();
    }
    return [dateBefore, dateAfter];
}
