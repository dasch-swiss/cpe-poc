<script>
    /*
    This component is used on SearchComponents to link them to their ViewerComponent
     */
    import ResourcesContainer from './Resource/ResourcesContainer.svelte';
    import ImagesContainer from './Image/ImagesContainer.svelte';

    export let requestInfos, jsonFile;
</script>

{#if requestInfos && jsonFile}
    <!-- Checking property -->
    {#if jsonFile.hasOwnProperty('MultipleResources')}
        {#each jsonFile['MultipleResources'] as res}
            <ResourcesContainer {requestInfos} jsonFile={res}/>
        {/each}
    {/if}

    <!-- Checking property -->
    {#if jsonFile.hasOwnProperty('MultipleImages')}
        {#each jsonFile['MultipleImages'] as img}
            <ImagesContainer {requestInfos} jsonFile={img}/>
        {/each}
    {/if}
{/if}
