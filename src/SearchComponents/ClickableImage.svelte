<script>
    import {push} from 'svelte-spa-router'
    export let src;
    export let link;
</script>
<img {src} on:click={push(link)}/>