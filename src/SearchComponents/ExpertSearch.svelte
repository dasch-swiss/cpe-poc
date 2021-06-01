<script>
    //TODO: Catch form errors like unchosen properties or operators
    import {language} from "../store.js";
    import ExpertSearchPropHelper from "./ExpertSearchPropHelper.svelte";
    import {
        getAllResourcesWithLabels,
        getPropsWithObjAndLabelsForRes
    } from "../dsp-services";


    export let ontology, server, shortName, shortCode;
    let helpers = [];
    let query = "";
    let gravInput = "";
    let noOfProps = 1; //This number does not reflect how many properties are actually shown, as it accounts for deleted ones as well (See comment in ExpertSearchPropHelper)
    let selectedResource;

    function addProp() {
        noOfProps++;
    }

    function getQuery() {
        let string = '';
        for (const helper of helpers) {
            if (!helper.isDeleted()) {
                string += helper.getString() + '\n';
            }
        }
        string = replaceOntoWithShortName(string);
        query = string;
    }

    function replaceOntoWithShortName(s) {
        let onto = ontology + ':';
        let pre = shortName + ':';
        return s.replaceAll(onto, pre);
    }

    async function getFinalQuery() {
        const enteredString = query + gravInput;
        let queryString = 'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>\nPREFIX ' + shortName + ': <http://' + server + '/ontology/' + shortCode + '/' + ontology + '/v2#>\n' + '\nCONSTRUCT {\n';
        if (enteredString === '') {
            queryString += '?mainres knora-api:isMainResource true .} WHERE {\n ?mainres a knora-api:Resource .\n?mainres a ' + selectedResource + ' .}';
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
                        line = arr[0] + ' ' + shortName + ':' + arr[1] + ' ' + arr[2] + ' ' + arr[3];
                    }
                }
                queryString += '\n' + line;
            }
            queryString += '} WHERE {\n' + mainres + ' a knora-api:Resource .\n' + mainres + ' a ' + selectedResource + ' .';
            for (let line of lines) {
                const arr = line.split(' ');
                if (arr.length === 4) {
                    if (arr[1].indexOf(':') === -1) { // prefix: missing
                        line = arr[0] + ' ' + shortName + ':' + arr[1] + ' ' + arr[2] + ' ' + arr[3];
                    }
                }
                queryString += '\n' + line;
            }
            queryString += '}';
        }
        queryString = replaceOntoWithShortName(queryString);
        const res = await fetch('https://' + server + '/v2/searchextended', {
            method: 'POST',
            body: queryString

        })
        const json = await res.json();
        console.log(json)
    }

    function setAllToDeleted(){
        for (const helper of helpers){
            helper.setDeleted();
        }
        getQuery();
    }

    let resourceProm = getAllResourcesWithLabels();

</script>
<select bind:value={selectedResource}
        on:change={setAllToDeleted}>
    <option value="" disabled selected>{$language === 'en' ? 'Choose resource' : 'Resource wählen'}</option>
    {#await resourceProm}
    {:then resources}
        {#each resources as resource}
            <option value={resource['ResName']}>{resource['label'][$language]}</option>
        {/each}
    {/await}
</select>
{#if selectedResource}
    {#each {length: noOfProps} as e, i}
        {#await getPropsWithObjAndLabelsForRes(selectedResource)}
        {:then properties}
            <ExpertSearchPropHelper on:message={getQuery} bind:this={helpers[i]} props={properties}
                                    {ontology} parentGravId="?mainres"/>
        {/await}
    {/each}
    <button on:click={() => addProp()}>{$language === 'en' ? 'Add Property' : 'Property hinzufügen'}</button>
{/if}
<textarea bind:value={query} readonly></textarea>
<textarea bind:value={gravInput}></textarea>
<button on:click={() => getFinalQuery()}>{$language === 'en' ? 'Search' : 'Suchen'}</button>
