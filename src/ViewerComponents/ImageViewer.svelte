<script>
    import {onMount} from 'svelte';
    import {getResByIri, login} from "../dsp-services";
    import {token} from "../store";
    import OpenSeadragon from 'openseadragon';

    export let resource, ontology, server, user, shortname, shortcode;
    let error = false;
    let container
    let viewer

    onMount(() => {
        container.id = Math.random().toString(36).substring(8);
        getData();
    })


    async function getData() {
        try {
            error = false;
            // Requests token and saves into the store
            const logResult = await login(user);
            token.set(logResult);
            // Requests the resource
            const resData = await getResByIri(resource['Id'], $token);

            if (resData["knora-api:hasStillImageFileValue"]) {

                if (resData["knora-api:hasStillImageFileValue"]["knora-api:fileValueAsUrl"]) {
                    viewer = new OpenSeadragon({
                        id: container.id,
                        prefixUrl: "images/",
                        tileSources: {
                            type: 'image',
                            url:  resData["knora-api:hasStillImageFileValue"]["knora-api:fileValueAsUrl"]["@value"]
                        }
                    });
                } else {
                    error = true;
                }

            } else {
                error = true;
            }
        } catch (e) {
            error = true;
            console.log(e);
        }
    }

    // function getImage() {
    //     opd = new OpenSeadragon({
    //         id: "openseadragon1",
    //         prefixUrl: "images/",
    //         tileSources: {
    //             type: 'image',
    //             url:  'img/duomo.jpg'
    //         }
    //     });
    // }

</script>

<main>
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

</main>

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
