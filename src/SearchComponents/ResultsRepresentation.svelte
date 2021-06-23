<script>
    import ResourceViewer from "../ViewerComponents/ResourceViewer.svelte";
    export let query, results, json;
</script>
{#if json}
    {#each json['ResourceViewers'] as res}
        <ResourceViewer {query} {results}/>
    {/each}
{/if}
