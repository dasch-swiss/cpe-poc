
<script>

    import Playground from "./Playground.svelte"
    import Router from 'svelte-spa-router'
    import routes from './routes'
    let items = ['Study-Material-Nummer', 'Fundnummer']
    let dropDownVal = "";
    let searchVal = "";

</script>
<!--
<select bind:value={dropDownVal}>
    {#each items as item}
        <option value={item}>
            {item}
        </option>
    {/each}
</select>
<input bind:value={searchVal}>
<button href="#/playground/{dropDownVal}/{searchVal}">Search</button>
    -->
<Router {routes}/>

<style>
</style>
