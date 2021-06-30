<script>
    import MultipleResources from './MultipleResources.svelte';
    import Loading from '../Loading.svelte';

    export let requestInfos, jsonFile;
    let promise;
    let current_offset = 0;

    $: requestInfos && initialize(0);

    /**
     * Initialize the request and assigns to variable 'promise'
     *
     * @param offset
     */
    function initialize(offset) {
        promise = requestData(offset);
    }

    /**
     * Requests the data with the parameter given from parent component.
     *
     * @param offset
     * @returns {Promise<unknown>}
     */
    async function requestData(offset) {
        const res = await fetch(requestInfos['url'], {
            method: requestInfos['method'],
            body: requestInfos['gravsearch'] + `\n OFFSET ${offset}`
        })

        const json = await res.json();

        // Checks if request succeeded
        if (!res.ok) {
            console.error(json);
            return new Promise(() => {
                throw new Error(`${res.status.toString()}: ${res.statusText}`);
            })
        }

        console.log(json);
        return json;
    }

    /**
     * Checks if data is an empty object
     *
     * @param data
     * @returns {boolean}
     */
    function isEmpty(data) {
        return Object.keys(data).length === 0;
    }

    /**
     * Increases the offset and starts a new request with the new offset.
     */
    function next() {
        initialize(current_offset += 1);
    }

    /**
     * Decreases the offset and starts a new request with the new offset.
     */
    function previous() {
        initialize(current_offset -= 1);
    }

    /**
     * Checks if current offset is 0.
     *
     * @returns {boolean}
     */
    function checkPrevious() {
        return current_offset === 0;
    }

    /**
     * Checks if data has more results by checking the flag.
     *
     * @param data
     * @returns {boolean}
     */
    function checkNext(data) {
        return !(data.hasOwnProperty('knora-api:mayHaveMoreResults') && data['knora-api:mayHaveMoreResults']);
    }
</script>

{#if requestInfos}
    <div class="container">
        {#await promise}
            <Loading/>
        {:then data}
            {#if isEmpty(data)}
                No data found
            {:else}
                <!-- Pagination Buttons -->
                <button disabled={checkPrevious()} on:click={() => previous()}>&lt;</button>
                <button disabled={checkNext(data)} on:click={() => next()}>&gt;</button>

                <MultipleResources results={data['@graph']} {jsonFile}/>
            {/if}
        {:catch error}
            <div class="error">
                <div class="error-header">Something went wrong</div>
                <div class="error-text">Resource data couldn't be loaded. Let's give it another shot!</div>
                <div class="error-btn-container">
                    <button on:click={() => initialize(current_offset)}>Try again</button>
                </div>
            </div>
        {/await}
    </div>
{/if}

<style>
    .container {
        margin-top: 1rem;
        border: 1px solid lightgray;
        padding: 1rem;
    }

    .error {
        text-align: center;
    }

    .error-header {
        font-size: larger;
    }

    .error-text {
        margin: 0.5rem;
    }

    .error-btn-container > button {
        background-color: dodgerblue;
        color: white;
    }
</style>
