import {json, language} from "./store";
import {get} from 'svelte/store'
const j = get(json);
const ontology = j['DSP']['Ontology']
const server = j['DSP']['Server']
const shortCode = j['DSP']['ShortCode']
export async function getOntology(){
    const res = await fetch('https://' + server + '/v2/ontologies/allentities/' + encodeURIComponent('http://' + server + '/ontology/' + shortCode + '/' + ontology + '/v2') + '?allLanguages=true', {
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
export async function getLabelForResource(resName){
    const temp = await getResByName(resName);
    const toReturn = {};
    for (const lang of temp['rdfs:label']){
        toReturn[lang['@language']] = lang['@value'];
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
export async function getLabelsForResources(resources){
    for (const res of resources){
        res['label'] = {};
        const temp = await getResByName(res['ResName']);
        for (const lang of temp['rdfs:label']){
            res['label'][lang['@language']] = lang['@value'];
        }
    }
    return resources;
}
export async function getPropByName(name){
    const onto = await getOntology();
    for (const o of onto) {
        if (o.hasOwnProperty('knora-api:isResourceProperty') && o['knora-api:isResourceProperty']) {
            if (o['@id'] === ontology + ':' + name){
                return o;
            }
        }
    }
    console.log('Didnt find property with name ' + name);
    return null;
}
export async function getResByName(name){
    const onto = await getOntology();
    for (const o of onto){
        if (o.hasOwnProperty('knora-api:isResourceClass') && o['knora-api:isResourceClass']){
            if (o['@id'] === ontology + ':' + name){
                return o;
            }
        }
    }
    console.log('Didnt find resource with name ' + name);
    return null;
}
