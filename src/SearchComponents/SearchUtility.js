import {getObjectTypeForProp} from "../dsp-services";
import {json} from '../store.js';
import {get} from 'svelte/store';

const jVal = get(json);
let ontology = jVal['DSP']['Ontology'];
let shortName = jVal['DSP']['ShortName'];

/**
 * Defines some functions that are useful for different search components
 */

/**
 * Forms the gravsearch string for a property.
 *
 * @param prop The property to get the string for, is a object with at least "propName" as key
 * @param parent The gravsearch id for the parent in the gravsearch, defaults to "?mainres"
 * @returns {string} The gravsearch string
 */
export function getPropString(prop, parent = "?mainres"){
    let toReturn = '';
    if ("linkedResource" in prop){
        if ("incoming" in prop["linkedResource"] && prop["linkedResource"]["incoming"]){
            toReturn += '?' + prop['propName'] +  ' ' + shortName + ':' + prop['propName'] + ' ' + parent + ' .\n'  ;
        } else {
            toReturn += parent + ' ' + shortName + ':' + prop['propName'] + ' ?' + prop['propName'] + ' .\n';
        }

    } else {
        toReturn += parent + ' ' + shortName + ':' + prop['propName'] + ' ?' + prop['propName'] + ' .\n';
    }

    return toReturn;
}

/**
 * Creates a gravsearch filter string given a property name, its value and its object.
 *
 * @param propName The name of the prop as string
 * @param value The value as string
 * @param obj The object type of the property
 * @param dateDepth Defines whether a date property isdefined on month or year level.
 * @returns {string} The filter string
 */
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

/**
 * If the object type is unknown, this function first queries the object type and then calls
 * getFilterByNameValAndObj. See above for parameters.
 *
 * @param propName
 * @param value
 * @param dateDepth
 * @returns {Promise<string>}
 */
export async function getFilterByNameAndVal(propName, value, dateDepth = ''){
    let obj = await getObjectTypeForProp(propName);
    return getFilterByNameValAndObj(propName, value, obj, dateDepth);
}

/**
 * Helper function for getFilterByNameValAndObj, do not use elsewhere.
 *
 * @param value
 * @param dateDepth
 * @returns {string[]}
 */
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
