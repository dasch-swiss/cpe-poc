<script>
    /*
       This is the playground for the App. It takes the json file and creates a SearchForm for each SearchForm entry
     */
    import SearchForm from './SearchForm.svelte'
    import * as json from './test.json' // Imports the test.json file directly into the json variable.
</script>

{#each json['SearchForm'] as form} <!-- Loops through the json-Searchform array -->
    <SearchForm form="{form}"/> <!-- Creates the SearchForm and assigns the dict -->
{/each}
<style>

</style>