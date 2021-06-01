<script>
    /*
        This represents a search form. It contains SearchFields for the properties to filter for, as well as button to
        fire the search.
     */
    import SearchField from './SearchField.svelte'
    import {onMount} from 'svelte';
    import {getLabelForResource} from "../dsp-services";

    let props = []; //Stores the props to access their functions.
    export let form; //The json containing the information to build the SearchForm
    export let predefProp;
    export let predefVal;
    export let ontology, server, shortCode, shortName;
    import {language} from "../store.js";

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
            toReturn += prop.getPropString(); // add the prop string for every prop.
        }
        toReturn += '} WHERE {\n?mainres a knora-api:Resource .\n?mainres a ' + shortName + ':' + form['ResName'] + ' .\n' // Standard for every query. CONSTRUCT section is closed, WHERE section openend.
        for (const prop of props) {
            if (prop.isEmpty()) { //if the filterstring is empty for a prop, we need to put OPTIONAL, otherwise the query filters for its existence
                toReturn += 'OPTIONAL {\n';
                toReturn += prop.getPropString();
                toReturn += '}\n';
            } else { //if it is non-empty we add the filter text.
                toReturn += prop.getPropString();
                toReturn += await prop.getFilter()
            }
        }
        toReturn += '}'
        console.log(toReturn);
        return toReturn;
    }
    /*
        Fires the query.
     */
    async function fireQuery() {
        const res = await fetch( 'https://' + server + '/v2/searchextended', {
            method: 'POST',
            body: await createQuery()

        })
        const json = await res.json()
        console.log(json)
    }
    onMount(async () => {
       if (predefProp !== '' && predefVal !== '') {
           await fireQuery();
       }
    });
    let promise = getLabelForResource(form['ResName']);
</script>

<main>
    {#await promise}
        {:then resLabel}
        <h1>{$language === 'en' ? 'Search for' : 'Suchen nach'} {resLabel[$language]}</h1>
    {/await}
    {#each form['Props'] as prop, i} <!-- Create a SearchField for each prop in the json -->
        <SearchField bind:this={props[i]} prop={prop} {shortName} value={predefProp === prop['propName']? predefVal : ''}/>
    {/each}
    <button on:click={fireQuery}>{$language === 'en' ? "Search" : "Suchen"}</button>
</main>
