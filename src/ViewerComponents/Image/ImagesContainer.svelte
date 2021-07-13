<script>
    import MultipleImages from './MultipleImages.svelte';
    import Loading from '../Loading.svelte';

    export let requestInfos, jsonFile;
    let promise_data, promise_amount;
    let current_offset = 0;
    const result_per_request = 25;

    $: requestInfos && initialize();

    /**
     * Initializes the process by setting offset and calls prepareRequest.
     */
    function initialize() {
        current_offset = 0;
        promise_amount = requestDataCount();
        prepareRequest(current_offset);
    }

    /**
     * Prepares the request and assigns to variable 'promise'.
     *
     * @param offset
     */
    function prepareRequest(offset) {
        promise_data = requestData(offset);
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
            return Promise.reject(
                new Error(`${res.status.toString()}: ${res.statusText}`)
            )
        }

        console.log(json);
        return json;
    }

    /**
     * Requests the data count with the parameter given from parent component and the offset 0.
     *
     * @returns {Promise<unknown>}
     */
    async function requestDataCount() {
        const res = await fetch(requestInfos['url'] + '/count', {
            method: requestInfos['method'],
            body: requestInfos['gravsearch'] + `\n OFFSET 0`
        })

        const json = await res.json();

        // Checks if request succeeded
        if (!res.ok) {
            console.error(json);
            return Promise.reject(
                new Error(`${res.status.toString()}: ${res.statusText}`)
            )
        }

        console.log(json);
        return json;
    }

    /**
     * Checks if data is an empty object.
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
        prepareRequest(current_offset += 1);
    }

    /**
     * Decreases the offset and starts a new request with the new offset.
     */
    function previous() {
        prepareRequest(current_offset -= 1);
    }

    /**
     * Prevents showing previous images if current offset is 0.
     *
     * @returns {boolean}
     */
    function preventPrevious() {
        return current_offset === 0;
    }

    /**
     * Prevents showing next results if data does not have flag for more result.
     *
     * @param data
     * @returns {boolean}
     */
    function preventNext(data) {
        return !(data.hasOwnProperty('knora-api:mayHaveMoreResults') && data['knora-api:mayHaveMoreResults']);
    }

    /**
     * Get range of the displayed results.
     *
     * @param data
     */
    function getAmountRange(data) {
        if (data.hasOwnProperty('@graph')) {
            return `${current_offset * result_per_request + 1}-${current_offset * result_per_request + data['@graph'].length}`;
        } else {
            return `${current_offset * result_per_request + 1}`;
        }
    }

    /**
     * Checks if the data has hasStillImageFileValue property, so the images passed to the child component and
     * can be displayed in the end.
     *
     * @param data
     * @returns {boolean}
     */
    function checkStillImage(data) {
        if (data.hasOwnProperty('@graph') && Array.isArray(data['@graph'])) {
            return data['@graph'].every(obj => obj['knora-api:hasStillImageFileValue']);
        } else {
            return data.hasOwnProperty('knora-api:hasStillImageFileValue');
        }
    }

    /**
     * Wraps the data in an array if there is one or no result.
     *
     * @param data
     */
    function wrapData(data) {
        if (data.hasOwnProperty('@graph')) {
            return data['@graph'];
        } else if (data['@id']) {
            return [data];
        } else {
            return [];
        }
    }
</script>

{#if requestInfos}
    <div class="container">
        {#await promise_data}
            <Loading loading_text="...searching"/>
        {:then data}
            {#if isEmpty(data)}
                {#if !jsonFile.hasOwnProperty("ShowNone") || jsonFile["ShowNone"]}
                    No images found
                {/if}
            {:else}
                <!-- Checks if data have image information -->
                {#if checkStillImage(data)}
                    {#if !jsonFile.hasOwnProperty("ShowPagination") || jsonFile["ShowPagination"]}
                        <!-- Pagination buttons -->
                        <button disabled={preventPrevious()} on:click={() => previous()}>&lt;</button>
                        <button disabled={preventNext(data)} on:click={() => next()}>&gt;</button>
                        <!-- Pagination range & amount -->
                        {getAmountRange(data)}
                        {#await promise_amount then data}
                            of {data['schema:numberOfItems']}
                        {/await}
                    {/if}

                    <MultipleImages results={wrapData(data)}/>
                {:else}
                    <div class="error">
                        <div class="error-header">Something went wrong</div>
                        <div class="error-text">Data are not images!</div>
                    </div>
                {/if}
            {/if}
        {:catch error}
            <div class="error">
                <div class="error-header">Something went wrong</div>
                <div class="error-text">Image data couldn't be loaded. Let's give it another shot!</div>
                <div class="error-btn-container">
                    <button on:click={() => prepareRequest(current_offset)}>Try again</button>
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
        margin-top: 0.5rem;
    }

    .error-text {
        margin: 0.5rem;
    }

    .error-btn-container > button {
        margin: 0.5rem;
        background-color: dodgerblue;
        color: white;
    }
</style>
