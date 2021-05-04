<script>
    import {push} from 'svelte-spa-router'
    import {language} from "../store";

    export let link;
    export let label;
</script>
<button on:click={push(link)}>{label[$language]}</button>