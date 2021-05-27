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
            if (json["knora-api:hasStillImageFileValue"]["knora-api:fileValueAsUrl"])
            console.log(json["knora-api:hasStillImageFileValue"]["knora-api:fileValueAsUrl"]["@value"]);

            opd = new OpenSeadragon({
                id: viewer.id,
                prefixUrl: "images/",
                tileSources: {
                    type: 'image',
                    url:  json["knora-api:hasStillImageFileValue"]["knora-api:fileValueAsUrl"]["@value"]
                }
            });
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
    <h2>Openseadragon</h2>
    {#if !opd}
        <button on:click={() => login()}>Get Image</button>
    {/if}
    <div bind:this={viewer} style="width: 600px; height: 400px;"></div>
</main>
