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

    let props = []; //Stores the props to access their functions.
    let query;
    let requestInfos;

    export let form; //The json containing the information to build the SearchForm
    export let predefProp;
    export let predefVal;
    export let ontology, server, shortCode, shortName, user;

    onMount(async () => {
        if (predefProp !== '' && predefVal !== '') {
            await setRequestInfos();
        }
    });
    let promise = getLabelForResource(form['ResName']);

    async function setRequestInfos() {
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
            '?mainres knora-api:isMainResource true .\n'; // Standard beginning of a gravsearchquery. Including knora-api as well as knora-api-simple for corner cases (such as filtering for dates). TODO: prefix and api-url need to be passed as arguments
        for (const prop of props) {
            if (!prop.isEmpty()){
                toReturn += prop.getString();
            }
        }
        toReturn += addStillImageFile();
        toReturn += '} WHERE {\n?mainres a knora-api:Resource .\n?mainres a ' + shortName + ':' + form['ResName'] + ' .\n' // Standard for every query. CONSTRUCT section is closed, WHERE section openend.
        for (const prop of props) {
            if (!prop.isEmpty()){
                toReturn += prop.getString();
            }
            toReturn += await prop.getFilter()
        }
        toReturn += addStillImageFile();
        toReturn += '}'
        console.log(toReturn);
        query = toReturn;
        return toReturn;
    }

    function addStillImageFile() {
        let line = '';
        const representations = form["ResultsRepresentation"];

        for (const key in representations) {
            if (key === 'MultipleImages') {
                line += '?mainres knora-api:hasStillImageFileValue ?imgfile .\n';
            }
        }

        return line;
    }
/*
    function getResultRepresentationString(existingString, isOptional) {
        if (!form.hasOwnProperty("ResultsRepresentation")) {
            return "";
        }
        const representations = form["ResultsRepresentation"];
        let s = "";
        for (const key in representations) { //all entries in this dict are arrays
            if (key === 'MultipleImages') {
                s += '?mainres knora-api:hasStillImageFileValue ?imgfile .\n';
                break;
            }
            s += flattenAllPropNamesOfRep(representations[key], existingString, isOptional);
        }
        return s;
    }

    function flattenAllPropNamesOfRep(arr, existingString, isOptional) {
        let toReturn = "";
        for (const d of arr) {
            toReturn += flattenAllPropNamesOfRepHelper(d, "?mainres", existingString, isOptional);
        }
        return toReturn;
    }

    function flattenAllPropNamesOfRepHelper(d, parent, existingString, isOptional) {
        let toReturn = "";
        for (const prop of d["Props"]) {

            let s = parent + ' ' + shortName + ':' + prop["propName"] + ' ?' + prop["propName"] + ' .\n'
            if (existingString.indexOf(s) === -1) {
                if (isOptional) {
                    toReturn += "OPTIONAL {\n";
                }
                toReturn += s;
            }
            if (prop.hasOwnProperty("linkedResource")) {
                toReturn += flattenAllPropNamesOfRepHelper(prop["linkedResource"], "?" + prop["propName"], existingString, isOptional);
            }
            if (isOptional && existingString.indexOf(s) === -1) {
                toReturn += "}\n";
            }
        }
        return toReturn;
    }
*/
</script>

<main>
    {#await promise then resLabel}
        <h1>{$language === 'en' ? 'Search for' : 'Suchen nach'} {resLabel[$language]}</h1>
    {/await}
    {#each form['Props'] as prop} <!-- Create a SearchField for each prop in the json -->
        <SearchField bind:this={props[props.length]} prop={prop} {predefProp} {predefVal} parent="?mainres"/>
    {/each}
    <button on:click={setRequestInfos}>{$language === 'en' ? "Search" : "Suchen"}</button>

    <ResultsRepresentation {requestInfos} jsonFile={form["ResultsRepresentation"]}/>
</main>
