<script>
    import ResourcesContainer from "./Resource/ResourcesContainer.svelte";
    export let requestInfos, jsonFile;
</script>

{#if requestInfos && jsonFile}
    {#each jsonFile['MultipleResources'] as res}
        <ResourcesContainer {requestInfos} {jsonFile}/>
    {/each}

    {#each jsonFile['MultipleImages'] as img}
    <!--TODO ImagesContainer must be implemented-->
    {/each}
{/if}
