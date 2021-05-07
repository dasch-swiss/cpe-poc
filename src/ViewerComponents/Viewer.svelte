<script>
    import {onMount} from 'svelte';
    import {of} from 'rxjs';
    import {token, ww_json, lists, ontologies} from '../store';

    let properties = [];

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
        ontologies.set(json['@graph']);
        console.log($ontologies);
    }

    async function listRequest() {
        if ($token) {
            const res = await fetch(`https://api.0826-test-server.dasch.swiss/admin/lists?${new URLSearchParams({projectIri: 'http://rdfh.ch/projects/0826'})}`, {
                headers: new Headers({
                    'Authorization': `Bearer ${$token}`
                })
            });

            const json = await res.json();
            lists.set(json.lists);
            console.log($lists);
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
                properties = [];
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
                    data[element].forEach(prop => processProp(element, prop));
                } else {
                    console.log('found -> Not Array');
                    processProp(element, data[element]);
                }
            }
        });
    }

    async function processProp(element, property) {
        switch (property['@type']) {
            case 'knora-api:TextValue':
                console.log(property['knora-api:valueAsString']);
                // $ontologies.forEach(a => console.log(a['@id'], element));
                $ontologies.find(ontology => {
                    if (ontology['@id'] === element) {
                        // console.log("found", ontology['rdfs:label']);
                        properties = [...properties, { name: ontology['rdfs:label'], value: property['knora-api:valueAsString']}];
                    }
                })
                break;
            // case 'knora-api:DateValue':
            //     console.log(property['knora-api:valueAsString']);
            //     break;
            case 'knora-api:ListValue':
                const listObject = await listNodeRequest(property['knora-api:listValueAsListNode']['@id']);
                console.log(listObject, listObject['knora-api:hasRootNode']['@id']);
                $lists.find(list => {
                    if (list.id === listObject['knora-api:hasRootNode']['@id']) {
                        // console.log("found", list['labels'][0]['value']);
                        properties = [...properties, {name: list['labels'][0]['value'], value: listObject['rdfs:label']}];
                    }
                })
                console.log(listObject['rdfs:label']);
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
        await listRequest();
        await ontologyRequest();
    })
</script>

<main>
    <h1>Viewer Component</h1>
<!--    <button on:click={ontologyRequest}>Ontology</button>-->
<!--    <button on:click={listRequest}>List</button>-->
<!--    <button on:click={() => listNodeRequest('http://rdfh.ch/lists/0826/TxtGA2V6RQuMstb9YjxYtg')}>Node</button>-->
    <button on:click={resourceRequest}>Resource</button>

    {#if properties.length > 0}
    <section>
        <h1>Resource Info</h1>
        {#each properties as p}
            <div><span class="prop-name">{p.name}:</span> {@html p.value}</div>
        {/each}
    </section>
    {/if}
</main>

<style>
    .prop-name {
        font-weight: bold;
    }
</style>
