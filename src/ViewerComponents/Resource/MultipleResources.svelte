<script>
    import {onMount} from 'svelte';

    export let results, jsonFile;
    export let ontology, server, user, shortname, shortcode;
    let error = false;
    let allResources = [];

    /**
     * Checks if result have certain properties and saves the resources.
     */
    onMount(() => {
        if (checkResult(results)) {
            allResources = addResources(results);
        } else {
            error = true;
        }
    })

    /**
     * Checks if the results have certain property, so the resource can be displayed.
     *
     * @param results
     * @returns {boolean}
     */
    function checkResult(results) {
        return results && Array.isArray(results);
    }

    /**
     * Converts every element from the results into a resource object and is added to an array.
     *
     * @param resources
     * @returns {any[]}
     */
    function addResources(resources) {
        return [...resources.map(resource => convertResourceObj(resource))];
    }

    /**
     * TODO: Converts a object from result into an resource object.
     *
     * @param res
     * @returns {*}
     */
    function convertResourceObj(res) {
        return res;
    }
</script>
{#each allResources as res}
    <!-- TODO Show the appropriate properties-->
    <section>
        <div>{res['@id']}</div>
        <div>{res['rdfs:label']}</div>
    </section>
{/each}

<style>
    section {
        margin: 0.5rem 0;
        padding: 1.5rem;
        border: 1px solid darkgray;
        /*display: grid;*/
        /*grid-template-columns: auto 1fr;*/
        /*gap: 1rem;*/
        /*font-size: smaller;*/
    }
</style>
