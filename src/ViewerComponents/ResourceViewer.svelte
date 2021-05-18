<script>
    import {onMount} from 'svelte';
    import {token, lists, ontologies} from '../store';

    export let resource, ontology, server, user, shortname, shortcode;
    let properties = {}
    let error = false;

    onMount(async () => {
        // await login();
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
        await listRequest();
    }

    async function listRequest() {
        const res = await fetch(`https://${server}/admin/lists?${new URLSearchParams({projectIri: 'http://rdfh.ch/projects/' + shortcode})}`, {
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
        lists.set(json.lists);
        // console.log($lists);
        await ontologyRequest();
    }

    async function ontologyRequest() {
        const res = await fetch(`https://${server}/ontology/${ontology}/simple/v2`);

        // Checks if request succeeded
        if (!res.ok) {
            error = true;
            console.error(res);
            return;
        }

        const json = await res.json();
        ontologies.set(json['@graph']);
        // console.log($ontologies);
        await resourceRequest();
    }

    async function resourceRequest() {
        const res = await fetch(`https://${server}/v2/resources/${encodeURIComponent(resource['Content']['ResourceViewer']['Id'])}`, {
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

        properties = {};
        const json = await res.json();
        // console.log(json);
        properties['ARK Url'] = new Array(`<a href=${json['knora-api:arkUrl']['@value']} target='_blank'>${json['knora-api:arkUrl']['@value']}</a>`)
        properties['Resource ID'] = new Array(resource['Content']['ResourceViewer']['Id']);
        convertProperties(json);
    }

    async function listNodeRequest(iri) {
        const res = await fetch(`https://${server}/v2/node/${encodeURIComponent(iri)}`, {
            headers: new Headers({
                'Authorization': `Bearer ${$token}`
            })
        });

        return await res.json();
    }

    function convertProperties(reqData) {
        resource['Content']['ResourceViewer']['Props'].forEach(property => {

            if (reqData[property['propName']]) {
                if (Array.isArray(reqData[property['propName']])) {
                    reqData[property['propName']].forEach(reqProperty => processProp(property, reqProperty));
                } else {
                    processProp(property, reqData[property['propName']]);
                }
            }
        });
    }

    async function processProp(property, reqProperty) {
        switch (reqProperty['@type']) {
            case 'knora-api:DecimalValue':
                // TODO -> ['knora-api:decimalValueAsDecimal']['@value'] = "1.5"
                break;
            case 'knora-api:BooleanValue':
                // TODO -> ['knora-api:booleanValueAsBoolean'] = true
                break;
            case 'knora-api:ColorValue':
                // TODO -> ['knora-api:colorValueAsColor'] = "#ff3333"
                break;
            case 'knora-api:TimeValue':
                // TODO -> ['knora-api:timeValueAsTimeStamp']['@value'] = "2019-08-30T10:45:20.173572Z"
                break;
            case 'knora-api:UriValue':
                // TODO -> ['knora-api:uriValueAsUri']['@value'] = "http://www.google.ch"
                break;
            case 'knora-api:GeomValue':
                // TODO -> ['knora-api:geometryValueAsGeometry'] = "{\"status\":\"active\",\"lineColor\":\"#ff3333\",\"lineWidth\":2,\"points\":[{\"x\":0.08098591549295775,\"y\":0.16741071428571427},{\"x\":0.7394366197183099,\"y\":0.7299107142857143}],\"type\":\"rectangle\",\"original_index\":0}"
                break;
            case 'knora-api:GeonameValue':
                // TODO -> ['knora-api:geonameValueAsGeonameCode'] = "2661604"
                break;
            case 'knora-api:IntervalValue':
                // TODO -> ['knora-api:intervalValueHasStart']['@value'] = "0"
                // TODO -> ['knora-api:intervalValueHasEnd']['@value'] = "216000"
                break;
            case 'knora-api:TextValue':
                // Simple Text
                $ontologies.find(ontology => {
                    if (ontology['@id'] === property['propName']) {
                        if (properties[ontology['rdfs:label']]) {
                            properties[ontology['rdfs:label']].push(reqProperty['knora-api:valueAsString']);
                        } else {
                            properties[ontology['rdfs:label']] = new Array(reqProperty['knora-api:valueAsString']);
                        }
                        // console.log(properties);
                    }
                })

                // Rich Text
                // TODO -> ['knora-api:textValueAsXml'] = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<text><p>test with <strong>markup</strong></p></text>"
                break;
            case 'knora-api:IntValue':
                $ontologies.find(ontology => {
                    if (ontology['@id'] === property['propName']) {
                        if (properties[ontology['rdfs:label']]) {
                            properties[ontology['rdfs:label']].push(reqProperty['knora-api:intValueAsInt']);
                        } else {
                            properties[ontology['rdfs:label']] = [reqProperty['knora-api:intValueAsInt']];
                        }
                    }
                })
                break;
            case 'knora-api:DateValue':
                // In case the details will be needed
                // ['knora-api:dateValueHasCalendar'] = "GREGORIAN"
                // ['knora-api:dateValueHasEndDay'] = 13;
                // ['knora-api:dateValueHasEndEra'] =  "CE";
                // ['knora-api:dateValueHasEndMonth'] = 5;
                // ['knora-api:dateValueHasEndYear'] = 2018;
                // ['knora-api:dateValueHasStartDay'] = 13;
                // ['knora-api:dateValueHasStartEra'] = "CE";
                // ['knora-api:dateValueHasStartMonth'] = 5;
                // ['knora-api:dateValueHasStartYear'] = 2018;

                $ontologies.find(ontology => {
                    if (ontology['@id'] === property['propName']) {
                        if (properties[ontology['rdfs:label']]) {
                            properties[ontology['rdfs:label']].push(reqProperty['knora-api:valueAsString']);
                        } else {
                            properties[ontology['rdfs:label']] = new Array(reqProperty['knora-api:valueAsString']);
                        }
                        // console.log(properties);
                    }
                })
                break;
            case 'knora-api:ListValue':
                const listObject = await listNodeRequest(reqProperty['knora-api:listValueAsListNode']['@id']);
                // console.log(listObject, listObject['knora-api:hasRootNode']['@id']);
                $lists.find(list => {
                    if (list.id === listObject['knora-api:hasRootNode']['@id']) {
                        // TODO There are sometimes more than one label
                        if (properties[list['labels'][0]['value']]) {
                            properties[list['labels'][0]['value']].push(listObject['rdfs:label']);
                        } else {
                            properties[list['labels'][0]['value']] = new Array(listObject['rdfs:label']);
                        }
                        // console.log('found', list['labels'][0]['value']);
                        // console.log(properties);
                    }
                })
                break;
            case 'knora-api:LinkValue':
                // console.log(reqProperty['knora-api:linkValueHasTarget']);
                const reqLinkTarget = await linkRequest(reqProperty['knora-api:linkValueHasTarget']['@id'])
                // console.log(reqLinkTarget, property['linkResource']['Props']);
                property['linkResource']['Props'].forEach(linkProperty => {
                    // console.log(reqLinkTarget[linkProperty['propName']], linkProperty, reqLinkTarget);
                    if (reqLinkTarget[linkProperty['propName']]) {
                        $ontologies.find(ontology => {
                            if (ontology['@id'] === linkProperty['propName']) {
                                let type = reqLinkTarget[linkProperty['propName']]['@type']
                                if (properties[ontology['rdfs:label']]) {
                                    properties[ontology['rdfs:label']].push(reqLinkTarget[linkProperty['propName']]['knora-api:valueAsString']);
                                } else {
                                    properties[ontology['rdfs:label']] = new Array(reqLinkTarget[linkProperty['propName']]['knora-api:valueAsString']);
                                }
                                // console.log(properties);
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
</script>

<main>
    <h2>Resource Viewer</h2>
    {#if error}
        <div>
            There was a error! The Resource data couldn't be loaded.
            <button on:click={() => login()}>Try again</button>
        </div>
    {:else}
        <div>
            <!--    <button on:click={() => listNodeRequest('http://rdfh.ch/lists/0826/TxtGA2V6RQuMstb9YjxYtg')}>Node</button>-->
            <button on:click={() => login()}>Get Data</button>

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
        </div>
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
