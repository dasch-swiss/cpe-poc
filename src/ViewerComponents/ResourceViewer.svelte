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
        const res = await fetch(`https://${server}/ontology/${shortcode}/${ontology}/simple/v2`);

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
        console.log(json);
        properties['knora-api:arkUrl'] = {
            values: new Array(`<a href=${json['knora-api:arkUrl']['@value']} target='_blank'>${json['knora-api:arkUrl']['@value']}</a>`),
            label: "ARK url"
        };
        properties['@id'] = {
            values: new Array(resource['Content']['ResourceViewer']['Id']),
            label: "Resource ID"
        };
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
        if (resource['Content']['ResourceViewer'].hasOwnProperty('Props')) {

            resource['Content']['ResourceViewer']['Props'].forEach(property => {
                if (reqData[property['propName']]) {
                    if (Array.isArray(reqData[property['propName']])) {
                        reqData[property['propName']].forEach(reqProperty => saveCustomProp(property, reqProperty));
                    } else {
                        saveCustomProp(property, reqData[property['propName']]);
                    }
                }
            });

        } else {
            for (const [key, value] of Object.entries(reqData)) {

                if (key.includes(`${ontology}:`)){
                    const correctedKey = key.replace('Value', '');
                    if (Array.isArray(value)) {
                        value.forEach(val => saveProp(correctedKey, val));
                    } else {
                        saveProp(correctedKey, value);
                    }
                }

            }
        }
    }

    async function saveProp(propName, propValue) {
        switch (propValue['@type']) {
            case 'knora-api:TextValue':
                // Simple Text
                $ontologies.forEach(ontology => {
                    if (ontology['@id'] === propName) {
                        if (properties[propName]) {
                            properties[propName]['values'].push(propValue['knora-api:valueAsString'])
                        } else {
                            properties[propName] = {
                                values: new Array(propValue['knora-api:valueAsString']),
                                label: ontology['rdfs:label'],
                                customName: null
                            }
                        }
                    }
                })
                break;
            case 'knora-api:IntValue':
                $ontologies.forEach(ontology => {
                    if (ontology['@id'] === propName) {
                        if (properties[propName]) {
                            properties[propName]['values'].push(propValue['knora-api:intValueAsInt'])
                        } else {
                            properties[propName] = {
                                values: new Array(propValue['knora-api:valueAsString']),
                                label: ontology['rdfs:label'],
                                customName: null
                            }
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

                $ontologies.forEach(ontology => {
                    if (ontology['@id'] === propName) {
                        if (properties[propName]) {
                            properties[propName]['values'].push(propValue['knora-api:valueAsString']);
                        } else {
                            properties[propName] = {
                                values: new Array(propValue['knora-api:valueAsString']),
                                label: ontology['rdfs:label'],
                                customName: null
                            };
                        }
                    }
                })
                break;
            case 'knora-api:ListValue':
                const listObject = await listNodeRequest(propValue['knora-api:listValueAsListNode']['@id']);
                // console.log(listObject, listObject['knora-api:hasRootNode']['@id']);
                $lists.forEach(list => {
                    if (list.id === listObject['knora-api:hasRootNode']['@id']) {
                        // TODO There are sometimes more than one label
                        if (properties[listObject['knora-api:hasRootNode']['@id']]) {
                            properties[listObject['knora-api:hasRootNode']['@id']]['values'].push(listObject['rdfs:label']);
                        } else {
                            properties[listObject['knora-api:hasRootNode']['@id']] = {
                                values: new Array(listObject['rdfs:label']),
                                label: list['labels'][0]['value'],
                                customName: null
                            };
                        }
                        console.log(properties);
                    }
                })
                break;
            case 'knora-api:LinkValue':
                $ontologies.forEach(ontology => {
                    if (ontology['@id'] === propName) {
                        if (properties[propName]) {
                            properties[propName]['values'].push(propValue['knora-api:linkValueHasTarget']['@id']);
                        } else {
                            properties[propName] = {
                                values: new Array(propValue['knora-api:linkValueHasTarget']['@id']),
                                label: ontology['rdfs:label'],
                                customName: null
                            };
                        }
                    }
                })

                break;
            default:
                break;
        }
    }

    async function saveCustomProp(property, reqProperty) {
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
                $ontologies.forEach(ontology => {
                    if (ontology['@id'] === property['propName']) {
                        if (properties[property['propName']]) {
                            properties[property['propName']]['values'].push(reqProperty['knora-api:valueAsString']);
                        } else {
                            properties[property['propName']] = {
                                values: new Array(reqProperty['knora-api:valueAsString']),
                                label: ontology['rdfs:label'],
                                customName: property['customName'] ? property['customName'] : null
                            };
                        }
                        // console.log(properties);
                    }
                })

                // Rich Text
                // TODO -> ['knora-api:textValueAsXml'] = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<text><p>test with <strong>markup</strong></p></text>"
                break;
            case 'knora-api:IntValue':
                $ontologies.forEach(ontology => {
                    if (ontology['@id'] === property['propName']) {
                        if (properties[property['propName']]) {
                            properties[property['propName']]['values'].push(reqProperty['knora-api:intValueAsInt']);
                        } else {
                            properties[property['propName']] = {
                                values: [reqProperty['knora-api:intValueAsInt']],
                                label: ontology['rdfs:label'],
                                customName: property['customName'] ? property['customName'] : null
                            };
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

                $ontologies.forEach(ontology => {
                    if (ontology['@id'] === property['propName']) {
                        if (properties[property['propName']]) {
                            properties[property['propName']]['values'].push(reqProperty['knora-api:valueAsString']);
                        } else {
                            properties[property['propName']] = {
                                values: new Array(reqProperty['knora-api:valueAsString']),
                                label: ontology['rdfs:label'],
                                customName: property['customName'] ? property['customName'] : null
                            };
                        }
                        // console.log(properties);
                    }
                })
                break;
            case 'knora-api:ListValue':
                const listObject = await listNodeRequest(reqProperty['knora-api:listValueAsListNode']['@id']);
                // console.log(listObject, listObject['knora-api:hasRootNode']['@id']);
                $lists.forEach(list => {
                    if (list.id === listObject['knora-api:hasRootNode']['@id']) {
                        // TODO There are sometimes more than one label
                        if (properties[listObject['knora-api:hasRootNode']['@id']]) {
                            properties[listObject['knora-api:hasRootNode']['@id']]['values'].push(listObject['rdfs:label']);
                        } else {
                            properties[listObject['knora-api:hasRootNode']['@id']] = {
                                values: new Array(listObject['rdfs:label']),
                                label: list['labels'][0]['value'],
                                customName: property['customName'] ? property['customName'] : null
                            };
                        }
                        console.log(properties);
                    }
                })
                break;
            case 'knora-api:LinkValue':
                // Checks if there is a linkResource property in the JSON structure
                if (!property['linkResource']) {
                    return;
                }

                const reqLinkTarget = await linkRequest(reqProperty['knora-api:linkValueHasTarget']['@id'])
                property['linkResource']['Props'].forEach(linkProperty => {
                    // console.log(reqLinkTarget[linkProperty['propName']], linkProperty, reqLinkTarget);
                    if (reqLinkTarget[linkProperty['propName']]) {
                        if (Array.isArray(reqLinkTarget[linkProperty['propName']])) {
                            reqLinkTarget[linkProperty['propName']].forEach(reqLinkProperty => saveCustomProp(linkProperty, reqLinkProperty));
                        } else {
                            saveCustomProp(linkProperty, reqLinkTarget[linkProperty['propName']]);
                        }
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
                    {#each Object.entries(properties) as [key, value]}
                        <div class='prop-header'>{value.customName ? value.customName : value.label}</div>
                        <div>
                            {#each value.values as val}
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
