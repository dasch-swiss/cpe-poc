<script>
    import {onMount} from 'svelte';

    export let results;
    export let ontology, server, user, shortname, shortcode;
    let error = false;
    let allResources = [];

    /**
     * Checks if result have certain properties and saves the resources.
     */
    onMount(() => {
        if (checkResult(results)) {
            console.log(results);
            allResources = addResources(results['@graph']);
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
        return results && results.hasOwnProperty('@graph') && Array.isArray(results['@graph']);
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
        console.log(res);
        return res;
    }
</script>

<main>
    <section>
        Multiple Resources
    </section>
</main>

<style>
    section {
        margin: 1rem 0;
        padding: 1.5rem;
        /*display: grid;*/
        /*grid-template-columns: auto 1fr;*/
        /*gap: 1rem;*/
        border: 1px solid darkgray;
        /*font-size: smaller;*/
    }
</style>
