<script>
    import {onMount} from 'svelte';
    import {token} from "../store";
    import OpenSeadragon from 'openseadragon';

    export let resource, ontology, server, user, shortname, shortcode;
    let error = false;
    let viewer
    let opd

    onMount(() => {
        viewer.id = Math.random().toString(36).substring(8);
    })

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
        // console.log($token);
        await resourceRequest();
    }

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
        console.log("image", json);

        if (json["knora-api:hasStillImageFileValue"]) {

            if (json["knora-api:hasStillImageFileValue"]["knora-api:fileValueAsUrl"]) {
                opd = new OpenSeadragon({
                    id: viewer.id,
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

    function getImage() {
        opd = new OpenSeadragon({
            id: "openseadragon1",
            prefixUrl: "images/",
            tileSources: {
                type: 'image',
                url:  'img/duomo.jpg'
            }
        });
    }

</script>

<main>
    <h2>Image Viewer</h2>
    {#if error}
        <div>
            There was a error! The Image couldn't be loaded.
            <button on:click={() => login()}>Try again</button>
        </div>
    {:else}
        <button on:click={() => login()}>Get Image</button>
        <section bind:this={viewer}></section>
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
