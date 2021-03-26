<script>
    /*
        This represents a search form. It contains SearchFields for the properties to filter for, as well as button to
        fire the search.
     */
    import SearchField from './SearchField.svelte'

    let props = []; //Stores the props to access their functions.
    export let form; //The json containing the information to build the SearchForm

    /*
        A function to create the query considering the state of the nested SearchFields.
        @return: the gravsearch query
     */
    function createQuery() {
        let toReturn = 'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>\n' +
            'PREFIX tdk: <http://api.0805-test-server.dasch.swiss/ontology/0805/tdk_onto/v2#>\n' +
            'PREFIX knora-api-simple: <http://api.knora.org/ontology/knora-api/simple/v2#>\n' +
            'CONSTRUCT {\n' +
            '?mainres knora-api:isMainResource true .\n'; // Standard beginning of a gravsearchquery. Including knora-api as well as knora-api-simple for corner cases (such as filtering for dates). TODO: prefix and api-url need to be passed as arguments
        for (const prop of props) {
            toReturn += prop.getPropString(); // add the prop string for every prop.
        }
        toReturn += '} WHERE {\n?mainres a knora-api:Resource .\n?mainres a ' + form['ResName'] + ' .\n' // Standard for every query. CONSTRUCT section is closed, WHERE section openend.
        for (const prop of props) {
            if (prop.isEmpty()) { //if the filterstring is empty for a prop, we need to put OPTIONAL, otherwise the query filters for its existence
                toReturn += 'OPTIONAL {\n';
                toReturn += prop.getPropString();
                toReturn += '}\n';
            } else { //if it is non-empty we add the filter text.
                toReturn += prop.getPropString();
                toReturn += prop.getFilter()
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
        const res = await fetch('https://api.0805-test-server.dasch.swiss/v2/searchextended', {
            method: 'POST',
            body: createQuery()

        })
        const json = await res.json()
        console.log(json)
    }


</script>

<main>
    <h1>Search for {form['ResLabel']}</h1>
    {#each form['TextProps'] as prop, i} <!-- Create a SearchField for each prop in the json -->
        <SearchField bind:this={props[i]} prop={prop}/>
    {/each}
    <button on:click={fireQuery}>Search</button>
</main>