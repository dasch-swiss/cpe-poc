<script>
    //TODO: Catch form errors like unchosen properties or operators
    import {language} from "../store";
    import {onMount} from 'svelte';
    import ExpertSearchPropHelper from "./ExpertSearchPropHelper.svelte";
    class Resource {
        constructor(id, label, props) {
            this.id = id;
            this.label = label;
            this.props = props;
        }

        addProp(prop) {
            this.props.push(prop);
        }
    }

    class Property {
        constructor(id, label, object, listIri) {
            this.id = id;
            this.label = label;
            this.object = object;
            this.listIri = listIri;
        }
    }

    export let ontology, server, shortCode;
    let resources = []
    let helpers = [];
    let query = "";
    let gravInput = "";
    let noOfProps = 0; //This number does not reflect how many properties are actually shown, as it accounts for deleted ones as well (See comment in ExpertSearchPropHelper)
    function translateLabels(labels) {
        const toReturn = {}
        for (const label of labels) {
            toReturn[label['@language']] = label['@value']
        }
        return toReturn;
    }

    async function getOntology() {
        const toReturn = [];
        let listIri = '';
        const res = await fetch('https://' + server + '/v2/ontologies/allentities/' + encodeURIComponent('http://' + server + '/ontology/' + ontology + '/v2') + '?allLanguages=true', {
            method: 'GET'
        })
        const json = await res.json();
        for (const o of json['@graph']) {
            if (o.hasOwnProperty('knora-api:isResourceClass') && o['knora-api:isResourceClass']) {
                toReturn.push(new Resource(o['@id'], translateLabels(o['rdfs:label']), []))
            }
            if (o.hasOwnProperty('knora-api:isResourceProperty') && o['knora-api:isResourceProperty']) {
                if (o['knora-api:objectType']['@id'] === 'knora-api:LinkValue'){
                    continue;
                }
                if (o['knora-api:objectType']['@id'] === 'knora-api:ListValue'){
                    listIri = o['salsah-gui:guiAttribute'].replace('hlist=', '').slice(1, -1);
                } else {
                    listIri = '';
                }
                for (const r of toReturn) {
                    if (o['knora-api:subjectType']['@id'] === r.id) {
                        r.addProp(new Property(o['@id'], translateLabels(o['rdfs:label']), o['knora-api:objectType']['@id'], listIri))
                    }
                }
            }
        }
        resources = toReturn;
    }
    function addProp(){
        noOfProps ++;
    }
    function getQuery(){
        let string = '';
        for (const helper of helpers){
            if (!helper.isDeleted()){
                string += helper.getString() + '\n';
            }
        }
        string = replaceOntoWithShortCode(string);
       query = string;
    }
    function replaceOntoWithShortCode(s){
        let onto  = ontology.substring(ontology.indexOf('/') + 1) + ':';
        let pre = shortCode + ':';
        return s.replaceAll(onto, pre);
    }
    async function getFinalQuery(){
       const enteredString = query + gravInput;
        let queryString = 'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>\nPREFIX ' + shortCode + ': <http://' + server + '/ontology/' + ontology + '/v2#>\n' + '\nCONSTRUCT {\n';
        if (enteredString === '') {
            queryString += '?mainres knora-api:isMainResource true .} WHERE {\n ?mainres a knora-api:Resource .\n?mainres a ' + selectedResource.id + ' .}';
        } else {
            const mainres = enteredString.substring(0, enteredString.indexOf(' '));
            const lines = enteredString.split('\n');
            queryString += mainres + ' knora-api:isMainResource true .';
            for (let line of lines) {
                if (line.startsWith('FILTER')) {
                    continue;
                }
                if (line.indexOf('knora-api:valueAsString') !== -1 || line.indexOf('knora-api:intValueAsInt') !== -1) {
                    continue;
                }
                const arr = line.split(' ');
                if (arr.length === 4) {
                    if (!(arr[2].startsWith('?'))) { // found listnode filter
                        continue;
                    }
                    if (arr[1].indexOf(':') === -1) { // prefix: missing
                        line = arr[0] + ' '  + shortCode + ':' + arr[1] + ' ' + arr[2] + ' ' + arr[3];
                    }
                }
                queryString += '\n' + line;
            }
            queryString += '} WHERE {\n' + mainres + ' a knora-api:Resource .\n' + mainres + ' a ' + selectedResource.id + ' .';
            for (let line of lines) {
                const arr = line.split(' ');
                if (arr.length === 4) {
                    if (arr[1].indexOf(':') === -1) { // prefix: missing
                        line = arr[0] + ' '  + shortCode + ':' + arr[1] + ' ' + arr[2] + ' ' + arr[3];
                    }
                }
                queryString += '\n' + line;
            }
            queryString += '}';
        }
        queryString = replaceOntoWithShortCode(queryString);
        console.log(queryString);
        const res = await fetch( 'https://' + server + '/v2/searchextended', {
            method: 'POST',
            body: queryString

        })
        const json = await res.json();
        console.log(json)
    }
    getOntology();
    let selectedResource;
</script>
<select bind:value={selectedResource} on:change={() => {for (const helper of helpers){helper.setDeleted();} noOfProps++; getQuery();}}>
    <option value="" disabled selected>{$language === 'en' ? 'Choose resource' : 'Resource wählen'}</option>
    {#each resources as resource}
        <option value={resource}>{resource.label[$language]}</option>
    {/each}
</select>
{#if selectedResource}
    {#each {length:noOfProps} as e, i}
        <ExpertSearchPropHelper on:message={getQuery} bind:this={helpers[i]} props={selectedResource.props} {resources} {server} {ontology} parentGravId="?mainres"/>
    {/each}
    <button on:click={() => addProp()}>{$language === 'en' ? 'Add Property' : 'Property hinzufügen'}</button>
{/if}
<textarea bind:value={query} readonly></textarea>
<textarea bind:value={gravInput}></textarea>
<button on:click={() => getFinalQuery()}>{$language === 'en' ? 'Search' : 'Suchen'}</button>
