import {json} from "./store.js";
import {language} from './store';
import {get} from 'svelte/store'
const j = get(json);
const ontologyIri = j['DSP']['Ontology'];
const server = j['DSP']['Server'];
const shortCode = j['DSP']['ShortCode'];
let ontology;
export class ListNode {
    constructor(label, id) {
        this.label = label;
        this.id = id;
    }
}
/*
TODO: Need to implement a general getter for Prop and Res, where one can pass what to return via argument
 */
export async function getOntology(){
    const res = await fetch('https://' + server + '/v2/ontologies/allentities/' + encodeURIComponent('http://' + server + '/ontology/' + shortCode + '/' + ontologyIri + '/v2') + '?allLanguages=true', {
        method: 'GET'
    })
    const json = await res.json();
    return json['@graph'];
}
export async function getLabelForProp(propName){
    const temp = await getPropByName(propName);
    const toReturn = {};
    for (const lang of temp['rdfs:label']){
        toReturn[lang['@language']] = lang['@value'];
    }
    return toReturn;
}

export async function getObjectTypeForProp(propName){
    const temp = await getPropByName(propName);
    return temp['knora-api:objectType']['@id'];
}
export async function getLabelForResource(resName){
    const temp = await getResByName(resName);
    const toReturn = {};
    for (const lang of temp['rdfs:label']){
        toReturn[lang['@language']] = lang['@value'];
    }
    return toReturn;
}
export async function getPropNamesForResourceByName(resName){
    if (!ontology){
        ontology = await getOntology();
    }
    let toReturn = [];
    if (resName.indexOf(ontologyIri) === -1){
        resName = ontologyIri + ':' + resName;
    }
    for (const o of ontology) {
        if (o.hasOwnProperty('knora-api:isResourceProperty') && o['knora-api:isResourceProperty']  && o['knora-api:subjectType']['@id'] === resName) {
            if (o['knora-api:objectType']['@id'] === 'knora-api:LinkValue'){
                continue;
            }
            toReturn.push(o['@id']);
        }
    }
    return toReturn;
}
export async function getPropsWithObjAndLabelsForRes(resName){
    let toReturn = [];
    const props = await getPropNamesForResourceByName(resName);
    for (const prop of props){
        let toAdd = {"propName" : prop};
        toAdd['label'] = await getLabelForProp(prop);
        toAdd['object'] = await getObjectTypeForProp(prop);
        toReturn.push(toAdd);
     }
    return toReturn;
}
export async function getLabelsForProperties(props){
    for (const prop of props){
        prop['label'] = {};
        const temp = await getPropByName(prop['propName']);
        for (const lang of temp['rdfs:label']){
            prop['label'][lang['@language']] = lang['@value'];
        }
    }
    return props;
}
/*
Array of resnames (strings)
 */
export async function getLabelsForResources(resources){
    let toReturn = [];
    for (const res of resources){
        let toAdd = {'ResName': res};
        toAdd['label'] = {};
        const temp = await getResByName(res);
        for (const lang of temp['rdfs:label']){
            toAdd['label'][lang['@language']] = lang['@value'];
        }
        toReturn.push(toAdd);
    }
    console.log(toReturn);
    return toReturn;
}
export async function getAllResourcesWithLabels(){
    let resources = await getAllResourceNames();
    return await getLabelsForResources(resources);
}
export async function getAllResourceNames(){
    if (!ontology){
        ontology = await getOntology();
    }
    let toReturn = [];
    for (const o of ontology){
        if (o.hasOwnProperty('knora-api:isResourceClass') && o['knora-api:isResourceClass']){
            toReturn.push(o['@id']);
        }
    }
    return toReturn;
}
export async function getPropByName(name){
    if (!ontology){
        ontology = await getOntology();
    }
    if (name.indexOf(ontologyIri) === -1){
        name = ontologyIri + ':' + name;
    }
    for (const o of ontology) {
        if (o.hasOwnProperty('knora-api:isResourceProperty') && o['knora-api:isResourceProperty']) {
            if (o['@id'] === name){
                return o;
            }
        }
    }
    console.log('Didnt find property with name ---' + name + '---');
    return null;
}
export async function getResByName(name){
    if (!ontology){
        ontology = await getOntology();
    }
    if (name.indexOf(ontologyIri) === -1){
        name = ontologyIri + ':' + name;
    }
    for (const o of ontology){
        if (o.hasOwnProperty('knora-api:isResourceClass') && o['knora-api:isResourceClass']){
            if (o['@id'] === name){
                return o;
            }
        }
    }
    console.log('Didnt find resource with name ---' + name + '---');
    return null;
}
export async function getListByIri(iri){
    let toReturn = [];
    const res = await fetch('https://' + server + '/v2/lists/' + encodeURIComponent(iri) + '?allLanguages=true' , {
        method: 'GET'
    })
    const json = await res.json();
    for (const node of json['knora-api:hasSubListNode']){
        toReturn.push(new ListNode(node['rdfs:label'], node['@id']));
    }
    return toReturn;
}
export async function getListIriByPropName(name){
    const prop = await getPropByName(name);
    return prop['salsah-gui:guiAttribute'].replace('hlist=', '').slice(1, -1); //TODO: This might be unsafe for other projects!
}
export async function getListByPropName(name){
  const iri = await getListIriByPropName(name);
  return await getListByIri(iri);
}
