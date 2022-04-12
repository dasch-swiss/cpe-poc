<!-- Displays an image in the openseadragon-->
<script>
    import {onMount} from 'svelte';
    import {getResByIri, login} from '../../dsp-services.js';
    import {generateID} from '../ViewUtility';
    import {token} from '../../store';
    import OpenSeadragon from 'openseadragon';

    export let resource, ontology, server, user, shortname, shortcode;
    let error = false;
    let container
    let viewer

    /**
     * Assigns an unique ID to the container and starts getting the data.
     */
    onMount(() => {
        container.id = generateID();
        getData();
    })

    /**
     * Gets the image data after it fetched token.
     */
    async function getData() {
        try {
            // Requests token if it is empty or not empty but an error has occurred
            if(!$token || ($token && error)) {
                const logResult = await login(user);
                token.set(logResult);
            }
            // Requests the resource
            const resData = await getResByIri(resource['Id'], $token);

            if (checkResult(resData)) {
                error = false;
                viewer = new OpenSeadragon({
                    id: container.id,
                    prefixUrl: 'images/',
                    tileSources: {
                        type: 'image',
                        url:  resData['knora-api:hasStillImageFileValue']['knora-api:fileValueAsUrl']['@value']
                    }
                });
            } else {
                error = true;
            }
        } catch (e) {
            error = true;
            console.log(e);
        }
    }

    /**
     * Checks if the result has certain properties, so the image can be displayed in the container.
     *
     * @returns {boolean}
     */
    function checkResult(result) {
        return result && result['knora-api:hasStillImageFileValue'] && result['knora-api:hasStillImageFileValue']['knora-api:fileValueAsUrl'];
    }

    // function getImage() {
    //     opd = new OpenSeadragon({
    //         id: 'openseadragon1',
    //         prefixUrl: 'images/',
    //         tileSources: {
    //             type: 'image',
    //             url:  'img/duomo.jpg'
    //         }
    //     });
    // }
</script>

{#if error}
    <div class="error">
        Oops! Unable to fetch the image.
        <div>
            <button on:click={() => getData()}>Try again</button>
        </div>
    </div>
{:else}
    <section bind:this={container}></section>
{/if}

<style>
    .error {
        color: darkred;
        border: 1px solid darkred;
        margin: 1rem 0;
        padding: 1.5rem;
    }

    button {
        margin: 0.5rem 0 0 0;
    }

    section {
        width: 600px;
        height: 400px;
        padding: 1.5rem;
        margin: 1rem 0;
        border: 1px solid darkgray;
    }
</style>
