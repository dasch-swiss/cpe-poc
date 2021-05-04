<script>
    import {language} from "../store";
    import {onMount} from 'svelte';
    class Resource {
        constructor(id, label, props) {
            this.id = id;
            this.label = label;
            this.props = props;
        }
        addProp(prop){
            this.props.push(prop);
        }
    }
    class Property {
        constructor(label, object) {
            this.label = label;
            this.object = object;
        }
    }
    export let ontology, server;
    let resources = []
    function translateLabels(labels){
        const toReturn = {}
        for (const label of labels){
            toReturn[label['@language']] = label['@value']
        }
        return toReturn;
    }
    async function getOntology(){
        const toReturn = [];
        const res = await fetch('https://' + server + '/v2/ontologies/allentities/' + encodeURIComponent('http://' + server + '/ontology/' + ontology + '/v2') + '?allLanguages=true', {
            method: 'GET'
        })
        const json = await res.json();
        for (const o of json['@graph']){
            if (o.hasOwnProperty('knora-api:isResourceClass') && o['knora-api:isResourceClass']) {
                toReturn.push(new Resource(o['@id'], translateLabels(o['rdfs:label']), []))
            }
            if (o.hasOwnProperty('knora-api:isResourceProperty') && o['knora-api:isResourceProperty']) {
                for (const r of toReturn){
                    if (o['knora-api:subjectType']['@id'] === r.id){
                        r.addProp(new Property(translateLabels(o['rdfs:label']), o['knora-api:objectType']['@id']))
                    }
                }
            }
        }
        resources = toReturn;
    }
    getOntology();
    let selectedResource;
</script>
<select bind:value={selectedResource}>
    <option value="" disabled selected>{$language === 'en' ? 'Choose resource' : 'Resource wählen'}</option>
    {#each resources as resource}
        <option value={resource}>{resource.label[$language]}</option>
    {/each}
</select>