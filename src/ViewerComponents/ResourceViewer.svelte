<script>
    import {onMount} from 'svelte';
    import {token, lists, ontologies} from '../store';

    export let resource, ontology, server, user, shortname, shortcode;
    let properties = {}
    let error = false;

    onMount(async () => {
        await login();
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

        await listRequest();
    }

    /**
     * Requests all the list of the specific project and saves it into the store.
     *
     * @returns {Promise<void>}
     */
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

        await ontologyRequest();
    }

    /**
     * Requests the ontology of the specific project and saves it into the store.
     *
     * @returns {Promise<void>}
     */
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

        await resourceRequest();
    }

    /**
     * Requests the resource, takes its the ark url and id and adds to the property object.
     *
     * @returns {Promise<void>}
     */
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

        const json = await res.json();
        console.log(json);

        // Adds important properties
        properties = {
            'knora-api:arkUrl': {
                label: 'ARK Url',
                values: new Array(`<a href=${json['knora-api:arkUrl']['@value']} target='_blank'>${json['knora-api:arkUrl']['@value']}</a>`)
            },
            '@id': {
                label: 'Resource ID',
                values: new Array(resource['Content']['ResourceViewer']['Id'])
            }
        };

        defaultOrCustomProps(json);
    }

    /**
     * Request the node of a specific list.
     *
     * @param id ID of the node list
     * @returns {Promise<any>} response of the request as JSON
     */
    async function listNodeRequest(id) {
        const res = await fetch(`https://${server}/v2/node/${encodeURIComponent(id)}`, {
            headers: new Headers({
                'Authorization': `Bearer ${$token}`
            })
        });

        return await res.json();
    }

    /**
     * Requests the linked resource.
     *
     * @param id ID of the resource
     * @returns {Promise<any>} response of the request as JSON
     */
    async function linkRequest(id) {
        const res = await fetch(`https://${server}/v2/resources/${encodeURIComponent(id)}`, {
            headers: new Headers({
                'Authorization': `Bearer ${$token}`
            })
        });

        return await res.json();
    }

    /**
     * Evaluates if resource from JSON has custom properties defined. If not all the properties will be displayed
     * (= default properties).
     *
     * @param resData resource data from the request
     */
    function defaultOrCustomProps(resData) {
        if (resource['Content']['ResourceViewer'].hasOwnProperty('Props')) {
            processCustomProp(resData, resource['Content']['ResourceViewer']['Props']);
        } else {
            processDefaultProp(resData);
        }
    }

    /**
     * Processes all the individual properties, corrects their names and passes them to the next function.
     *
     * @param resData resource data from the request
     * @param customProps properties from the JSON file
     */
    function processCustomProp(resData, customProps) {
        customProps.forEach(customProp => {
            const propName = resData.hasOwnProperty(`${customProp['propName']}Value`) ? `${customProp['propName']}Value` : customProp['propName'];

            if (resData[propName]) {
                if (Array.isArray(resData[propName])) {
                    resData[propName].forEach(reqProperty => saveProp(null, reqProperty, customProp));
                } else {
                    saveProp(null, resData[propName], customProp);
                }
            }
        })
    }

    /**
     * Processes all the properties, corrects their names and passes them to the next function.
     *
     * @param resData resource data from the request
     */
    function processDefaultProp(resData) {
        for (const [key, value] of Object.entries(resData)) {

            if (key.includes(`${ontology}:`)){
                const correctedKey = key.replace('Value', '');
                if (Array.isArray(value)) {
                    value.forEach(val => saveProp(correctedKey, val, null));
                } else {
                    saveProp(correctedKey, value, null);
                }
            }
        }
    }

    /**
     * Evaluates which type the property is and saves the value to the global 'properties' object.
     *
     * @param propName
     * @param propValue
     * @param customProp
     * @returns {Promise<void>}
     */
    async function saveProp(propName, propValue, customProp) {
        const pName = customProp ? customProp['propName'] : propName
        const cName = customProp && customProp['customName'] ? customProp['customName'] : null;

        switch (propValue['@type']) {
            case 'knora-api:DecimalValue':
                // TODO -> ['knora-api:decimalValueAsDecimal']['@value'] = '1.5'
                break;
            case 'knora-api:BooleanValue':
                // TODO -> ['knora-api:booleanValueAsBoolean'] = true
                break;
            case 'knora-api:ColorValue':
                // TODO -> ['knora-api:colorValueAsColor'] = '#ff3333'
                break;
            case 'knora-api:TimeValue':
                // TODO -> ['knora-api:timeValueAsTimeStamp']['@value'] = '2019-08-30T10:45:20.173572Z'
                break;
            case 'knora-api:UriValue':
                // TODO -> ['knora-api:uriValueAsUri']['@value'] = 'http://www.google.ch'
                break;
            case 'knora-api:GeomValue':
                // TODO -> ['knora-api:geometryValueAsGeometry'] = "{\"status\":\"active\",\"lineColor\":\"#ff3333\",\"lineWidth\":2,\"points\":[{\"x\":0.08098591549295775,\"y\":0.16741071428571427},{\"x\":0.7394366197183099,\"y\":0.7299107142857143}],\"type\":\"rectangle\",\"original_index\":0}"
                break;
            case 'knora-api:GeonameValue':
                // TODO -> ['knora-api:geonameValueAsGeonameCode'] = '2661604'
                break;
            case 'knora-api:IntervalValue':
                // TODO -> ['knora-api:intervalValueHasStart']['@value'] = '0'
                // TODO -> ['knora-api:intervalValueHasEnd']['@value'] = '216000'
                break;
            case 'knora-api:TextValue':
                // Simple Text
                $ontologies.forEach(ontology => {
                    if (ontology['@id'] === pName) {
                        if (properties[pName]) {
                            properties[pName]['values'].push(propValue['knora-api:valueAsString'])
                        } else {
                            properties[pName] = {
                                values: new Array(propValue['knora-api:valueAsString']),
                                label: ontology['rdfs:label'],
                                customName: cName ? cName : null
                            }
                        }
                    }
                })
                // Rich Text
                // TODO -> ['knora-api:textValueAsXml'] = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<text><p>test with <strong>markup</strong></p></text>"
                break;
            case 'knora-api:IntValue':
                $ontologies.forEach(ontology => {
                    if (ontology['@id'] === pName) {
                        if (properties[pName]) {
                            properties[pName]['values'].push(propValue['knora-api:intValueAsInt']);
                        } else {
                            properties[pName] = {
                                values: [propValue['knora-api:intValueAsInt']],
                                label: ontology['rdfs:label'],
                                customName: cName ? cName : null
                            }
                        }
                    }
                })
                break;
            case 'knora-api:DateValue':
                // In case the details will be needed
                // ['knora-api:dateValueHasCalendar'] = 'GREGORIAN'
                // ['knora-api:dateValueHasEndDay'] = 13;
                // ['knora-api:dateValueHasEndEra'] =  'CE';
                // ['knora-api:dateValueHasEndMonth'] = 5;
                // ['knora-api:dateValueHasEndYear'] = 2018;
                // ['knora-api:dateValueHasStartDay'] = 13;
                // ['knora-api:dateValueHasStartEra'] = 'CE';
                // ['knora-api:dateValueHasStartMonth'] = 5;
                // ['knora-api:dateValueHasStartYear'] = 2018;

                $ontologies.forEach(ontology => {
                    if (ontology['@id'] === pName) {
                        if (properties[pName]) {
                            properties[pName]['values'].push(propValue['knora-api:valueAsString']);
                        } else {
                            properties[pName] = {
                                values: new Array(propValue['knora-api:valueAsString']),
                                label: ontology['rdfs:label'],
                                customName: cName ? cName : null
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
                                customName: cName ? cName : null
                            };
                        }
                    }
                })
                break;
            case 'knora-api:LinkValue':
                if (customProp) {
                    if (!customProp['linkResource'] ) {
                        return;
                    }

                    const reqLinkTarget = await linkRequest(propValue['knora-api:linkValueHasTarget']['@id'])
                    processCustomProp(reqLinkTarget, customProp['linkResource']['Props']);

                } else {
                    $ontologies.forEach(ontology => {
                        if (ontology['@id'] === pName) {
                            if (properties[pName]) {
                                properties[pName]['values'].push(propValue['knora-api:linkValueHasTarget']['@id']);
                            } else {
                                properties[pName] = {
                                    values: new Array(propValue['knora-api:linkValueHasTarget']['@id']),
                                    label: ontology['rdfs:label'],
                                    customName: cName ? cName : null
                                };
                            }
                        }
                    })
                }
                break;
            default:
                break;
        }
        console.log(properties);
    }

</script>

<main>
    {#if error}
        <div>
            There was a error! The Resource data couldn't be loaded.
            <button on:click={() => login()}>Try again</button>
        </div>
    {:else}
        <div>
            {#if Object.entries(properties).length > 0}
                <section>
                    {#if resource['Content']['ResourceViewer']['customTitle']}
                        <div class='res-title'>{resource['Content']['ResourceViewer']['customTitle']}</div>
                    {/if}
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
        margin: 1rem 0;
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
