<!--Provides a button that links to a url. Only urls on this app are supported.-->
<script>
    import {push} from 'svelte-spa-router'
    import {language} from "../store.js";

    export let link;
    export let label;
</script>

<button on:click={push(link)}>{label[$language]}</button>
