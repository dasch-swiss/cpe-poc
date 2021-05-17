<script>
    import {onMount} from 'svelte';
    import {token, lists, ontologies} from '../store';

    export let resource, ontology, server, user, shortname, shortcode;
    let properties = {}

    async function login() {
        const res = await fetch(`https://${server}/v2/authentication`,
            {
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                method: 'POST',
                body: JSON.stringify({'email': user['Email'], 'password': user['Pwd']})
            })

        if (res.status === 200) {
            const json = await res.json();
            token.set(json.token);
        } else {
            console.error('Login failed', res);
        }
    }

    async function ontologyRequest() {
        const res = await fetch(`https://${server}/ontology/${ontology}/simple/v2`);
        const json = await res.json();
        ontologies.set(json['@graph']);
        // console.log($ontologies);
    }

    async function listRequest() {
        if ($token) {
            const res = await fetch(`https://${server}/admin/lists?${new URLSearchParams({projectIri: 'http://rdfh.ch/projects/' + shortcode})}`, {
                headers: new Headers({
                    'Authorization': `Bearer ${$token}`
                })
            });

            const json = await res.json();
            lists.set(json.lists);
            // console.log($lists);
        } else {
            console.error('No token available for further requests', $token);
        }
    }

    async function listNodeRequest(iri) {
        if ($token) {
            const res = await fetch(`https://${server}/v2/node/${encodeURIComponent(iri)}`, {
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
            const res = await fetch(`https://${server}/v2/resources/${encodeURIComponent(resource['Content']['ResourceViewer']['Id'])}`, {
                headers: new Headers({
                    'Authorization': `Bearer ${$token}`
                })
            });

            if (res.ok) {
                properties = {};
                const json = await res.json();
                properties['ARK Url'] = new Array(`<a href=${json['knora-api:arkUrl']['@value']} target='_blank'>${json['knora-api:arkUrl']['@value']}</a>`)
                properties['Resource ID'] = new Array(resource['Content']['ResourceViewer']['Id']);
                console.log(json);
                convert(json);
            }
        } else {
            console.error('No token available for further requests', $token);
        }
    }

    function convert(data) {
        resource['Content']['ResourceViewer']['Props'].forEach(element => {
            // console.log(data, element);
            if (data[element['propName']]) {
                if (Array.isArray(data[element['propName']])) {
                    data[element['propName']].forEach(prop => processProp(element, prop));
                } else {
                    processProp(element, data[element['propName']]);
                }
            }
        });
    }

    async function processProp(element, property) {
        switch (property['@type']) {
            case 'knora-api:TextValue':
                $ontologies.find(ontology => {
                    if (ontology['@id'] === element['propName']) {
                        if (properties[ontology['rdfs:label']]) {
                            properties[ontology['rdfs:label']].push(property['knora-api:valueAsString']);
                        } else {
                            properties[ontology['rdfs:label']] = new Array(property['knora-api:valueAsString']);
                        }
                        console.log(properties);
                    }
                })
                break;
            case 'knora-api:IntValue':
                $ontologies.find(ontology => {
                    if (ontology['@id'] === element['propName']) {
                        if (properties[ontology['rdfs:label']]) {
                            properties[ontology['rdfs:label']].push(property['knora-api:intValueAsInt']);
                        } else {
                            properties[ontology['rdfs:label']] = [property['knora-api:intValueAsInt']];
                        }
                    }
                })
                break;
            case 'knora-api:DateValue':
                $ontologies.find(ontology => {
                    if (ontology['@id'] === element['propName']) {
                        if (properties[ontology['rdfs:label']]) {
                            properties[ontology['rdfs:label']].push(property['knora-api:valueAsString']);
                        } else {
                            properties[ontology['rdfs:label']] = new Array(property['knora-api:valueAsString']);
                        }
                        console.log(properties);
                    }
                })
                break;
            case 'knora-api:ListValue':
                const listObject = await listNodeRequest(property['knora-api:listValueAsListNode']['@id']);
                console.log(listObject);
                // console.log(listObject, listObject['knora-api:hasRootNode']['@id']);
                $lists.find(list => {
                    if (list.id === listObject['knora-api:hasRootNode']['@id']) {
                        if (properties[list['labels'][0]['value']]) {
                            properties[list['labels'][0]['value']].push(listObject['rdfs:label']);
                        } else {
                            properties[list['labels'][0]['value']] = new Array(listObject['rdfs:label']);
                        }
                        // console.log('found', list['labels'][0]['value']);
                        console.log(properties);
                    }
                })
                break;
            case 'knora-api:LinkValue':
                // console.log(property['knora-api:linkValueHasTarget']);
                const bla = await linkRequest(property['knora-api:linkValueHasTarget']['@id'])
                // console.log(bla, element['linkResource']['Props']);
                element['linkResource']['Props'].forEach(el => {
                    // console.log(bla[el['propName']], el, bla);
                    if (bla[el['propName']]) {
                        $ontologies.find(a => {
                            if (a['@id'] === el['propName']) {
                                let type = bla[el['propName']]['@type']
                                if (properties[a['rdfs:label']]) {
                                    properties[a['rdfs:label']].push(bla[el['propName']]['knora-api:valueAsString']);
                                } else {
                                    properties[a['rdfs:label']] = new Array(bla[el['propName']]['knora-api:valueAsString']);
                                }
                                console.log(properties);
                            }
                        })
                    }
                })
                break;
            default:
                break;
        }
    }

    async function linkRequest(id) {
        const res = await fetch(`https://${server}/v2/resources/${encodeURIComponent(id)}`, {
            headers: new Headers({
                'Authorization': `Bearer ${$token}`
            })
        });

        return await res.json();
    }

    onMount(async () => {
        await login();
        await listRequest();
        await ontologyRequest();
    })
</script>

<main>
    <h2>Resource Viewer</h2>
<!--    <button on:click={() => listNodeRequest('http://rdfh.ch/lists/0826/TxtGA2V6RQuMstb9YjxYtg')}>Node</button>-->
    <button on:click={resourceRequest}>Fetch data</button>

    {#if Object.entries(properties).length > 0}
        <section>
            <div class='res-title'>Resource Information</div>
            {#each Object.entries(properties) as [propName, propValue]}
                <div class='prop-header'>{propName}</div>
                <div>
                    {#each propValue as val}
                        <div>{@html val}</div>
                    {/each}
                </div>
            {/each}
        </section>
    {/if}
</main>

<style>
    .res-title {
        flex: 0 1 100%;
        grid-column: 1 / -1;
        font-size: x-large;
    }

    section {
        padding: 1.5rem;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1rem;
        border: 1px solid darkgray;
        font-size: smaller;
    }

    @media (max-width: 600px) {
        section {
            grid-template-columns: 1fr;
            gap: 0.5rem;
        }
    }

    .prop-header {
        font-weight: bold;
    }
</style>
