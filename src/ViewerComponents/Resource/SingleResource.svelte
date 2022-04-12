<!-- Displays a resource with the appropriate property type -->
<script>
    import {onMount} from 'svelte';
    import {login, getList, getOntology, getResByIri, getListNode} from '../../dsp-services';
    import {language, token, lists, ontologies} from '../../store';
    import TextValue from '../Values/TextValue.svelte';
    import IntValue from '../Values/IntValue.svelte';
    import DateValue from '../Values/DateValue.svelte';
    import ListValue from '../Values/ListValue.svelte';
    import LinkValue from '../Values/LinkValue.svelte';
    import UriValue from '../Values/UriValue.svelte';
    import DecimalValue from '../Values/DecimalValue.svelte';
    import BooleanValue from '../Values/BooleanValue.svelte';
    import ColorValue from '../Values/ColorValue.svelte';
    import TimeValue from '../Values/TimeValue.svelte';
    import GeomValue from '../Values/GeomValue.svelte';
    import GeonameValue from '../Values/GeonameValue.svelte';
    import IntervalValue from '../Values/IntervalValue.svelte';

    export let resource, ontology, server, user, shortname, shortcode;
    export let search_result;
    let properties = {}
    let error = false;

    /**
     * Checks if data comes from a search result or resource (= json file) and starts getting the data.
     */
    onMount(() => {
        getData(search_result);
    })

    /**
     * Gets the resource data after it fetched token, list, ontology.
     */
    async function getData(search = null) {
        try {
            error = false;
            // Requests token and saves into the store
            // TODO Check if token is not empty but invalid
            if (!$token) {
                const logResult = await login(user);
                token.set(logResult);
            }
            // Requests the list and saves into the store
            if (!$lists) {
                const listResult = await getList();
                lists.set(listResult);
            }
            // Requests the ontology and saves into the store
            if (!$ontologies) {
                const ontResult = await getOntology();
                ontologies.set(ontResult);
            }
            // Requests the resource
            const iri = search ? search['@id'] : resource['Id'];
            const resData = await getResByIri(iri, $token);

            // Adds important properties
            properties = {
                'knora-api:arkUrl': {
                    type: 'knora-api:UriValue',
                    labels: {'en': 'ARK Url', 'de': 'ARK Url'},
                    values: new Array(resData['knora-api:arkUrl']['@value'])
                },
                '@id': {
                    type: 'knora-api:TextValue',
                    labels: {'en': 'Resource ID', 'de': 'Resource ID'},
                    values: new Array(iri)
                }
            };

            defaultOrCustomProps(resData);

        } catch (e) {
            error = true;
            console.log(e);
        }
    }

    /**
     * Evaluates if resource from JSON has custom properties defined. If not all the properties will be displayed
     * (= default properties).
     *
     * @param resData resource data from the request
     */
    function defaultOrCustomProps(resData) {
        if (resource && resource.hasOwnProperty('Props')) {
            processCustomProp(resData, resource['Props']);
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
    async function processCustomProp(resData, customProps) {
        for (let customProp of customProps) {
            const customPropKey = `${ontology}:${customProp['propName']}`;
            const propName = resData.hasOwnProperty(`${customPropKey}Value`) ? `${customPropKey}Value` : customPropKey;

            if (resData[propName]) {
                if (Array.isArray(resData[propName])) {
                    for (let reqProperty of resData[propName]) {
                        await saveProp(null, reqProperty, customProp)
                    }
                } else {
                    await saveProp(null, resData[propName], customProp);
                }
            }
        }
    }

    /**
     * Processes all the properties, corrects their names and passes them to the next function.
     *
     * @param resData resource data from the request
     */
    async function processDefaultProp(resData) {
        for (const [key, value] of Object.entries(resData)) {
            if (key.includes(`${ontology}:`)) {
                const correctedKey = key.replace('Value', '');
                if (Array.isArray(value)) {
                    for (let val of value) {
                        await saveProp(correctedKey, val, null)
                    }
                } else {
                    await saveProp(correctedKey, value, null);
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
        const pName = customProp ? `${ontology}:${customProp['propName']}` : propName
        const cName = customProp && customProp['customName'] ? customProp['customName'] : null;

        switch (propValue['@type']) {
            case 'knora-api:DecimalValue':
                // ['knora-api:decimalValueAsDecimal']['@value'] = '1.5'
                $ontologies.forEach(onto => {
                    if (onto['@id'] === pName) {
                        if (properties[pName]) {
                            properties[pName]['values'].push(propValue['knora-api:decimalValueAsDecimal']['@value'])
                        } else {
                            properties[pName] = {
                                type: 'knora-api:DecimalValue',
                                values: new Array(propValue['knora-api:decimalValueAsDecimal']['@value']),
                                labels: changeLabels(onto['rdfs:label']),
                                customName: cName ? cName : null
                            }
                        }
                    }
                })
                break;
            case 'knora-api:BooleanValue':
                // ['knora-api:booleanValueAsBoolean'] = true
                $ontologies.forEach(onto => {
                    if (onto['@id'] === pName) {
                        if (properties[pName]) {
                            properties[pName]['values'].push(propValue['knora-api:booleanValueAsBoolean'])
                        } else {
                            properties[pName] = {
                                type: 'knora-api:BooleanValue',
                                values: new Array(propValue['knora-api:booleanValueAsBoolean']),
                                labels: changeLabels(onto['rdfs:label']),
                                customName: cName ? cName : null
                            }
                        }
                    }
                })
                break;
            case 'knora-api:ColorValue':
                // ['knora-api:colorValueAsColor'] = '#ff3333'
                $ontologies.forEach(onto => {
                    if (onto['@id'] === pName) {
                        if (properties[pName]) {
                            properties[pName]['values'].push(propValue['knora-api:colorValueAsColor'])
                        } else {
                            properties[pName] = {
                                type: 'knora-api:ColorValue',
                                values: new Array(propValue['knora-api:colorValueAsColor']),
                                labels: changeLabels(onto['rdfs:label']),
                                customName: cName ? cName : null
                            }
                        }
                    }
                })
                break;
            case 'knora-api:TimeValue':
                // ['knora-api:timeValueAsTimeStamp']['@value'] = '2019-08-30T10:45:20.173572Z'
                $ontologies.forEach(onto => {
                    if (onto['@id'] === pName) {
                        if (properties[pName]) {
                            properties[pName]['values'].push(propValue['knora-api:timeValueAsTimeStamp']['@value'])
                        } else {
                            properties[pName] = {
                                type: 'knora-api:TimeValue',
                                values: new Array(propValue['knora-api:timeValueAsTimeStamp']['@value']),
                                labels: changeLabels(onto['rdfs:label']),
                                customName: cName ? cName : null
                            }
                        }
                    }
                })
                break;
            case 'knora-api:UriValue':
                // ['knora-api:uriValueAsUri']['@value'] = 'http://www.google.ch'
                $ontologies.forEach(onto => {
                    if (onto['@id'] === pName) {
                        if (properties[pName]) {
                            properties[pName]['values'].push(propValue['knora-api:uriValueAsUri']['@value'])
                        } else {
                            properties[pName] = {
                                type: 'knora-api:UriValue',
                                values: new Array(propValue['knora-api:uriValueAsUri']['@value']),
                                labels: changeLabels(onto['rdfs:label']),
                                customName: cName ? cName : null
                            }
                        }
                    }
                })
                break;
            case 'knora-api:GeomValue':
                // ['knora-api:geometryValueAsGeometry'] = "{\"status\":\"active\",\"lineColor\":\"#ff3333\",\"lineWidth\":2,\"points\":[{\"x\":0.08098591549295775,\"y\":0.16741071428571427},{\"x\":0.7394366197183099,\"y\":0.7299107142857143}],\"type\":\"rectangle\",\"original_index\":0}"
                $ontologies.forEach(onto => {
                    if (onto['@id'] === pName) {
                        if (properties[pName]) {
                            properties[pName]['values'].push(propValue['knora-api:geometryValueAsGeometry'])
                        } else {
                            properties[pName] = {
                                type: 'knora-api:GeomValue',
                                values: new Array(propValue['knora-api:geometryValueAsGeometry']),
                                labels: changeLabels(onto['rdfs:label']),
                                customName: cName ? cName : null
                            }
                        }
                    }
                })
                break;
            case 'knora-api:GeonameValue':
                // ['knora-api:geonameValueAsGeonameCode'] = '2661604'
                $ontologies.forEach(onto => {
                    if (onto['@id'] === pName) {
                        if (properties[pName]) {
                            properties[pName]['values'].push(propValue['knora-api:geonameValueAsGeonameCode'])
                        } else {
                            properties[pName] = {
                                type: 'knora-api:GeonameValue',
                                values: new Array(propValue['knora-api:geonameValueAsGeonameCode']),
                                labels: changeLabels(onto['rdfs:label']),
                                customName: cName ? cName : null
                            }
                        }
                    }
                })
                break;
            case 'knora-api:IntervalValue':
                // ['knora-api:intervalValueHasStart']['@value'] = '0'
                // ['knora-api:intervalValueHasEnd']['@value'] = '216000'
                $ontologies.forEach(onto => {
                    if (onto['@id'] === pName) {
                        if (properties[pName]) {
                            properties[pName]['values'].push({
                                startVal: propValue['knora-api:intervalValueHasStart']['@value'],
                                endVal: propValue['knora-api:intervalValueHasEnd']['@value'],
                            })
                        } else {
                            properties[pName] = {
                                type: 'knora-api:IntervalValue',
                                values: new Array({
                                    startVal: propValue['knora-api:intervalValueHasStart']['@value'],
                                    endVal: propValue['knora-api:intervalValueHasEnd']['@value'],
                                }),
                                labels: changeLabels(onto['rdfs:label']),
                                customName: cName ? cName : null
                            }
                        }
                    }
                })
                break;
            case 'knora-api:TextValue':
                // Simple Text
                $ontologies.forEach(onto => {
                    if (onto['@id'] === pName) {
                        if (properties[pName]) {
                            properties[pName]['values'].push(propValue['knora-api:valueAsString'])
                        } else {
                            properties[pName] = {
                                type: 'knora-api:TextValue',
                                values: new Array(propValue['knora-api:valueAsString']),
                                labels: changeLabels(onto['rdfs:label']),
                                customName: cName ? cName : null
                            }
                        }
                    }
                })
                // Rich Text
                // TODO -> ['knora-api:textValueAsXml'] = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<text><p>test with <strong>markup</strong></p></text>"
                break;
            case 'knora-api:IntValue':
                $ontologies.forEach(onto => {
                    if (onto['@id'] === pName) {
                        if (properties[pName]) {
                            properties[pName]['values'].push(propValue['knora-api:intValueAsInt']);
                        } else {
                            properties[pName] = {
                                type: 'knora-api:IntValue',
                                values: [propValue['knora-api:intValueAsInt']],
                                labels: changeLabels(onto['rdfs:label']),
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

                $ontologies.forEach(onto => {
                    if (onto['@id'] === pName) {
                        if (properties[pName]) {
                            properties[pName]['values'].push({
                                valueAsString: propValue['knora-api:valueAsString'],
                                calendar: propValue['knora-api:dateValueHasCalendar'],
                                endDay: propValue['knora-api:dateValueHasEndDay'],
                                endEra: propValue['knora-api:dateValueHasEndEra'],
                                endMonth: propValue['knora-api:dateValueHasEndMonth'],
                                endYear: propValue['knora-api:dateValueHasEndYear'],
                                startDay: propValue['knora-api:dateValueHasStartDay'],
                                startEra: propValue['knora-api:dateValueHasStartEra'],
                                startMonth: propValue['knora-api:dateValueHasStartMonth'],
                                startYear: propValue['knora-api:dateValueHasStartYear']
                            });
                        } else {
                            properties[pName] = {
                                type: 'knora-api:DateValue',
                                values: new Array({
                                    valueAsString: propValue['knora-api:valueAsString'],
                                    calendar: propValue['knora-api:dateValueHasCalendar'],
                                    endDay: propValue['knora-api:dateValueHasEndDay'],
                                    endEra: propValue['knora-api:dateValueHasEndEra'],
                                    endMonth: propValue['knora-api:dateValueHasEndMonth'],
                                    endYear: propValue['knora-api:dateValueHasEndYear'],
                                    startDay: propValue['knora-api:dateValueHasStartDay'],
                                    startEra: propValue['knora-api:dateValueHasStartEra'],
                                    startMonth: propValue['knora-api:dateValueHasStartMonth'],
                                    startYear: propValue['knora-api:dateValueHasStartYear']
                                }),
                                labels: changeLabels(onto['rdfs:label']),
                                customName: cName ? cName : null
                            };
                        }
                    }
                })
                break;
            case 'knora-api:ListValue':
                // TODO try catch should be inserted
                const listObject = await getListNode(propValue['knora-api:listValueAsListNode']['@id'], $token);

                $lists.forEach(list => {
                    if (list.id === listObject['knora-api:hasRootNode']['@id']) {
                        if (properties[listObject['knora-api:hasRootNode']['@id']]) {
                            properties[listObject['knora-api:hasRootNode']['@id']]['values'].push(listObject['rdfs:label']);
                        } else {
                            properties[listObject['knora-api:hasRootNode']['@id']] = {
                                type: 'knora-api:ListValue',
                                values: new Array(listObject['rdfs:label']),
                                labels: changeLabels(list['labels']),
                                customName: cName ? cName : null
                            };
                        }
                    }
                })
                break;
            case 'knora-api:LinkValue':
                if (customProp) {
                    if (!customProp['linkedResource']) {
                        return;
                    }

                    // TODO try catch should be inserted
                    const reqLinkTarget = await getResByIri(propValue['knora-api:linkValueHasTarget']['@id'], $token);
                    await processCustomProp(reqLinkTarget, customProp['linkedResource']['Props']);

                } else {
                    $ontologies.forEach(onto => {
                        if (onto['@id'] === pName) {
                            if (properties[pName]) {
                                properties[pName]['values'].push(propValue['knora-api:linkValueHasTarget']['@id']);
                            } else {
                                properties[pName] = {
                                    type: 'knora-api:LinkValue',
                                    values: new Array(propValue['knora-api:linkValueHasTarget']['@id']),
                                    labels: changeLabels(onto['rdfs:label']),
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
    }

    /**
     * Change the labels from an array to an object with languages as keys.
     *
     * @param labels
     * @returns {{}|*}
     */
    function changeLabels(labels) {
        let result = {}
        if (labels.length > 0) {
            labels.map(label => {
                if (label['@language']) {
                    result[label['@language']] = label['@value'];
                } else if (label['language']) {
                    result[label['language']] = label['value'];
                }
            });
        } else {
            return labels;
        }

        return result;
    }
</script>

{#if error}
    <div class="error">
        Oops! Unable to fetch the resource.
        <div>
            <button on:click={() => getData()}>Try again</button>
        </div>
    </div>
{:else}
    <div>
        {#if Object.entries(properties).length > 0}
            <section>
                {#if resource && resource['customTitle']}
                    <div class="res-title">{resource['customTitle']}</div>
                {/if}
                {#each Object.entries(properties) as [key, value]}
                    <div class='prop-header'>{value.customName ? value.customName : value.labels[$language]}</div>
                    <div>
                        {#if value.type === 'knora-api:DecimalValue'}
                            {#each value.values as val}
                                <DecimalValue displayValue={val}/>
                            {/each}
                        {:else if value.type === 'knora-api:BooleanValue'}
                            {#each value.values as val}
                                <BooleanValue displayValue={val}/>
                            {/each}
                        {:else if value.type === 'knora-api:ColorValue'}
                            {#each value.values as val}
                                <ColorValue displayValue={val}/>
                            {/each}
                        {:else if value.type === 'knora-api:TimeValue'}
                            {#each value.values as val}
                                <TimeValue displayValue={val}/>
                            {/each}
                        {:else if value.type === 'knora-api:UriValue'}
                            {#each value.values as val}
                                <UriValue displayValue={val}/>
                            {/each}
                        {:else if value.type === 'knora-api:GeomValue'}
                            {#each value.values as val}
                                <GeomValue displayValue={val}/>
                            {/each}
                        {:else if value.type === 'knora-api:GeonameValue'}
                            {#each value.values as val}
                                <GeonameValue displayValue={val}/>
                            {/each}
                        {:else if value.type === 'knora-api:IntervalValue'}
                            {#each value.values as val}
                                <IntervalValue displayValue={val}/>
                            {/each}
                        {:else if value.type === 'knora-api:TextValue'}
                            {#each value.values as val}
                                <TextValue displayValue={val}/>
                            {/each}
                        {:else if value.type === 'knora-api:IntValue'}
                            {#each value.values as val}
                                <IntValue displayValue={val}/>
                            {/each}
                        {:else if value.type === 'knora-api:DateValue'}
                            {#each value.values as val}
                                <DateValue displayValue={val}/>
                            {/each}
                        {:else if value.type === 'knora-api:ListValue'}
                            {#each value.values as val}
                                <ListValue displayValue={val}/>
                            {/each}
                        {:else if value.type === 'knora-api:LinkValue'}
                            {#each value.values as val}
                                <LinkValue displayValue={val}/>
                            {/each}
                        {/if}
                    </div>
                {/each}
            </section>
        {/if}

    </div>
{/if}

<style>
    .error {
        color: darkred;
        border: 1px solid darkred;
        margin: 1rem 0;
        padding: 1.5rem;
    }

    button {
        margin: 0.5rem 0 0 0;
    }

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
