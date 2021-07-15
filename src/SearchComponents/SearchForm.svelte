<script>
    /*
        This represents a search form. It contains SearchFields for the properties to filter for, as well as button to
        fire the search.
     */
    import {onMount} from 'svelte';
    import {getLabelForResource} from "../dsp-services";
    import {language} from "../store.js";
    import SearchField from './SearchField.svelte'
    import ResultsRepresentation from "../ViewerComponents/ResultsRepresentation.svelte";

    let searchFields = []; //Stores the SearchFields to access their functions.
    let requestInfos; //Contains the output for the viewer components

    export let jsonFile; //The json containing the information to build the SearchForm
    export let predefProp; //contains the property name if a property filter has been predefined (before reaching this component)
    export let predefVal; //contains the value of the predefined property filter
    export let ontology, server, shortCode, shortName;

    onMount(async () => {
        if (predefProp !== '' && predefVal !== '') {
            await setRequestInfos(); //if the form was reached in a way that already defines a filter, the query is sent directly.
        }
    });

    /*
        Sets the requestInfos to be exported to the viewer components
    */
    async function setRequestInfos() {
        //TODO: Maybe the url should be stored in a service, as it could change for upcoming versions of the dsp-api
        requestInfos = {
            url: `https://${server}/v2/searchextended`,
            gravsearch: await createQuery(),
            method: 'POST'
        };
    }

    /*
        A function to create the query considering the state of the nested SearchFields.
        @return: the gravsearch query
     */
    async function createQuery() {
        let toReturn = 'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>\n' +
            'PREFIX ' + shortName + ': <http://' + server + '/ontology/' + shortCode + '/' + ontology + '/v2#>\n' +
            'PREFIX knora-api-simple: <http://api.knora.org/ontology/knora-api/simple/v2#>\n' +
            'CONSTRUCT {\n' +
            '?mainres knora-api:isMainResource true .\n';
            /* Standard beginning of a gravsearchquery. Including knora-api
             as well as knora-api-simple for corner cases (such as filtering for dates).
             Maybe store this in a service as it is used in other places as well.
              */

        for (const prop of searchFields) {
            if (!prop.isEmpty()) { // exclude props that are not filtered for to avoid over-filtering.
                toReturn += prop.getString();
            }
        }

        toReturn += addStillImageFile(); // if the component calls an image viewer, we need to add the stillimage info.
        toReturn += '} WHERE {\n?mainres a knora-api:Resource .\n?mainres a ' + shortName + ':' + jsonFile['ResName'] + ' .\n' // Standard for every query. CONSTRUCT section is closed, WHERE section openend.

        for (const prop of searchFields) {
            if (!prop.isEmpty()) {
                toReturn += prop.getString();
            }
            toReturn += await prop.getFilter()
        }

        toReturn += addStillImageFile();
        toReturn += '}'
        return toReturn;
    }
    /*
    Checks if the component needs the stillimage information in its query.
    @return: the string to be added to the query.
     */
    function addStillImageFile() {
        let line = '';
        const representations = jsonFile["ResultsRepresentation"];

        for (const key in representations) {
            if (key === 'MultipleImages') {
                line += '?mainres knora-api:hasStillImageFileValue ?imgfile .\n';
                break; //ensure that the string gets only added once.
            }
        }

        return line;
    }

    let resourceLabelPromise = getLabelForResource(jsonFile['ResName']); //TODO: catch error if no jsonFile was provided.
</script>

<main>
    {#await resourceLabelPromise then resLabel}
        <h1>{$language === 'en' ? 'Search for' : 'Suchen nach'} {resLabel[$language]}</h1> <!-- TODO: catch if the label is not available in the chosen language -->
    {/await}
    {#each jsonFile['Props'] as prop} <!-- Create a SearchField for each prop in the json -->
        <SearchField bind:this={searchFields[searchFields.length]} prop={prop} {predefProp} {predefVal}
                     parent="?mainres"/>
    {/each}
    <button on:click={setRequestInfos}>{$language === 'en' ? "Search" : "Suchen"}</button> <!-- TODO: Support more languages? -->

    <ResultsRepresentation {requestInfos} jsonFile={jsonFile["ResultsRepresentation"]}/>
</main>
