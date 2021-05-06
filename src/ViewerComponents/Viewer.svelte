<script>
    import {onMount} from 'svelte';
    import {of} from 'rxjs';
    import {token, ww_json} from '../store';

    async function login() {
        const res = await fetch('https://api.0826-test-server.dasch.swiss/v2/authentication',
            {
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                method: 'POST',
                body: JSON.stringify({'email':'root@example.com', 'password':'test'})
            })

        if (res.status === 200) {
            const json = await res.json();
            token.set(json.token);
        } else {
            console.error('Login failed', res);
        }
    }

    async function ontologyRequest() {
        const res = await fetch('https://api.0826-test-server.dasch.swiss/ontology/0826/teimww/simple/v2');
        const json = await res.json();
        console.log(json);
    }

    async function listRequest() {
        if ($token) {
            const res = await fetch(`https://api.0826-test-server.dasch.swiss/admin/lists?${new URLSearchParams({projectIri: 'http://rdfh.ch/projects/0826'})}`, {
                headers: new Headers({
                    'Authorization': `Bearer ${$token}`
                })
            });

            const json = await res.json();
            console.log(json);
        } else {
            console.error('No token available for further requests', $token);
        }
    }

    async function listNodeRequest(iri) {
        if ($token) {
            const res = await fetch(`https://api.0826-test-server.dasch.swiss/v2/node/${encodeURIComponent(iri)}`, {
                headers: new Headers({
                    'Authorization': `Bearer ${$token}`
                })
            });

            return await res.json();
        } else {
            console.error('No token available for further requests', $token);
        }
    }

    async function resourceRequest() {
        if ($token) {
            const res = await fetch(`https://api.0826-test-server.dasch.swiss/v2/resources/${encodeURIComponent($ww_json['Page']['Content']['Viewer']['Url'])}`, {
                headers: new Headers({
                    'Authorization': `Bearer ${$token}`
                })
            });

            if (res.ok) {
                const json = await res.json();
                console.log(json);
                convert(json);
            }
        } else {
            console.error('No token available for further requests', $token);
        }
    }

    function convert(data) {
        $ww_json['Page']['Content']['Viewer']['Properties'].forEach(element => {
            console.log(element);
            if (data[element]) {
                if (Array.isArray(data[element])) {
                    console.log('found -> Array');
                    data[element].forEach(prop => processProp(prop));
                } else {
                    console.log('found -> Not Array');
                    processProp(data[element]);
                }
            }
        });
    }

    async function processProp(property) {
        switch (property['@type']) {
            case 'knora-api:TextValue':
                console.log(property['knora-api:valueAsString']);
                break;
            case 'knora-api:DateValue':
                console.log(property['knora-api:valueAsString']);
                break;
            case 'knora-api:ListValue':
                const listObject = await listNodeRequest(property['knora-api:listValueAsListNode']['@id']);
                console.log(listObject, listObject['knora-api:hasRootNode']['@id']);
                // console.log(listObject['rdfs:label']);
                break;
            // case 'knora-api:LinkValue':
            //     console.log(property['knora-api:linkValueHasTarget']);
            //     '@id';
            //     break;
            default:
                break;
        }
    }

    onMount(async () => {
        await login();
    })
</script>

<main>
    <h1>Viewer Component</h1>
    <button on:click={ontologyRequest}>Ontology</button>
    <button on:click={listRequest}>List</button>
<!--    <button on:click={() => listNodeRequest('http://rdfh.ch/lists/0826/TxtGA2V6RQuMstb9YjxYtg')}>Node</button>-->
    <button on:click={resourceRequest}>Resource</button>
    <section>
        <h1>Resource 1</h1>
        <div>Bla</div>
    </section>
</main>
