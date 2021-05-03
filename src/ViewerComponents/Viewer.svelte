<script>
    import {onMount} from 'svelte'
    import {token} from "./token_store";
    import * as json_file from './read_data.json'

    async function login() {
        const res = await fetch("https://api.0826-test-server.dasch.swiss/v2/authentication",
            {
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                method: "POST",
                body: JSON.stringify({"email":"root@example.com", "password":"test"})
            })

        if (res.status === 200) {
            const json = await res.json();
            token.set(json.token);
        } else {
            console.error("Login failed", res);
        }
    }

    async function ontologyRequest() {
        const res = await fetch("https://api.0826-test-server.dasch.swiss/ontology/0826/teimww/simple/v2");
        const json = await res.json();
        console.log(json);
    }

    async function listRequest() {
        token.subscribe(async value => {
            if (value) {
                const res = await fetch(`https://api.0826-test-server.dasch.swiss/admin/lists?${new URLSearchParams({projectIri: 'http://rdfh.ch/projects/0826'})}`, {
                    headers: new Headers({
                        'Authorization': `Bearer ${value}`
                    })
                });

                const json = await res.json();
                console.log(json);

            } else {
                console.error("No token available for further requests", value);
            }
        });
    }

    async function resourceRequest() {
        token.subscribe(async value => {
            if (value) {
                const res = await fetch(`https://api.0826-test-server.dasch.swiss/v2/resources/${encodeURIComponent(json_file["URL"])}`, {
                    headers: new Headers({
                        'Authorization': `Bearer ${value}`
                    })
                });

                const json = await res.json();
                console.log(json);

            } else {
                console.error("No token available for further requests", value);
            }
        });
    }

    onMount(async () => {
        await login();
    })
</script>

<main>
    <h1>Viewer Component</h1>
    <button on:click={ontologyRequest}>Ontology</button>
    <button on:click={listRequest}>List</button>
    <button on:click={resourceRequest}>Resource</button>
</main>
