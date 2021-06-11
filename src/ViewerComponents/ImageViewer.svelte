<script>
    import {onMount} from 'svelte';
    import {token} from "../store";
    import OpenSeadragon from 'openseadragon';

    export let resource, ontology, server, user, shortname, shortcode;
    let error = false;
    let container
    let viewer

    onMount(() => {
        container.id = Math.random().toString(36).substring(8);
        login();
    })

    /**
     * Logs in to the provided server and saves the token into the store.
     *
     * @returns {Promise<void>}
     */
    async function login() {
        error = false;

        const res = await fetch(`https://${server}/v2/authentication`,
            {
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                method: 'POST',
                body: JSON.stringify({'email': user['Email'], 'password': user['Pwd']})
            })

        // Checks if request succeeded
        if (!res.ok) {
            error = true;
            console.error(res);
            return;
        }

        const json = await res.json();
        token.set(json.token);

        await resourceRequest();
    }

    /**
     * Requests the resource and adds the file url to the open sea dragon instance.
     *
     * @returns {Promise<void>}
     */
    async function resourceRequest() {
        const res = await fetch(`https://${server}/v2/resources/${encodeURIComponent(resource['Content']['ImageViewer']['Id'])}`, {
            headers: new Headers({
                'Authorization': `Bearer ${$token}`
            })
        });

        // Checks if request succeeded
        if (!res.ok) {
            error = true;
            console.error(res);
            return;
        }

        const json = await res.json();

        if (json["knora-api:hasStillImageFileValue"]) {

            if (json["knora-api:hasStillImageFileValue"]["knora-api:fileValueAsUrl"]) {
                viewer = new OpenSeadragon({
                    id: container.id,
                    prefixUrl: "images/",
                    tileSources: {
                        type: 'image',
                        url:  json["knora-api:hasStillImageFileValue"]["knora-api:fileValueAsUrl"]["@value"]
                    }
                });
            } else {
                error = true;
            }

        } else {
            error = true;
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
        <div>
            There was a error! The Image couldn't be loaded.
            <button on:click={() => login()}>Try again</button>
        </div>
    {:else}
        <section bind:this={container}></section>
    {/if}

</main>

<style>
    section {
        width: 600px;
        height: 400px;
        padding: 1.5rem;
        border: 1px solid darkgray;
    }
</style>
