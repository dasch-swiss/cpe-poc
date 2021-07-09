<script>
    // TODO: Support properties that are incoming links
    import {getResByIri, login} from "../dsp-services";
    import {token} from "../store";
    import {getFilterByNameValAndObj, getPropString, getPropStringHelper} from "./SearchUtility";
    import ResultsRepresentation from "../ViewerComponents/ResultsRepresentation.svelte";

    export let jsonFile;
    let iri = jsonFile['Iri'];
    let props = jsonFile['Props'];
    export let user, ontology, server, shortCode, shortName;
    let resType;
    let data;
    let searchInfo = [];
    let requestInfos = [];

    async function getData() {
        const logResult = await login(user);  // TODO: Login should happen at app start and only be checked in dsp-services, not in components
        token.set(logResult);
        // Requests the resource
        data = await getResByIri(iri, $token);
        let linkedIri = '';
        resType = data["@type"].replace(ontology + ':', '');
        for (const prop of props) {
            await getPropValue(prop, data);
        }
        getQueries();
    }

    async function getPropValue(prop, data, linkQueue = []) {
        if (prop.hasOwnProperty("linkedResource")) {
            for (const linkProp of prop["linkedResource"]["Props"]) {
                const linkedIri = data[ontology + ':' + prop["propName"] + 'Value']['knora-api:linkValueHasTarget']['@id'];
                const newData = await getResByIri(linkedIri, $token);
                await getPropValue(linkProp, newData, linkQueue.concat([prop["propName"]]));
            }
        } else {
            if (data.hasOwnProperty(ontology + ':' + prop['propName'])) {
                // TODO: Support all property types
                switch (data[ontology + ':' + prop['propName']]["@type"]) {
                    case "knora-api:TextValue":
                        prop["value"] = data[ontology + ':' + prop['propName']]["knora-api:valueAsString"];
                        break;
                    case "knora-api:IntValue":
                        prop["value"] = data[ontology + ':' + prop['propName']]["knora-api:intValueAsInt"].toString();
                        break;
                    default:
                        // TODO: Throw error
                        console.log("No suitable type found");
                        break;
                }
                prop["type"] = data[ontology + ':' + prop['propName']]["@type"];
                if (linkQueue.length > 0) {
                    prop["linkQueue"] = linkQueue;
                }
                searchInfo.push(prop);
            }
        }
    }

    function getStringForProp(prop) {
        let parent = '?mainres';
        let toReturn = '';
        if (prop.hasOwnProperty("linkQueue")) {
            let curr;
            const temp = [...prop["linkQueue"]];
            while (temp.length > 0) {
                curr = temp.shift();
                toReturn += parent + ' ' + shortName + ':' + curr + ' ?' + curr + ' .\n';
                parent = '?' + curr;
            }
        }
        toReturn += getPropStringHelper(prop, parent);
        return toReturn;
    }

    function getQueries() {
        for (const prop of searchInfo) {
            let query = 'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>\n' +
                'PREFIX ' + shortName + ': <http://' + server + '/ontology/' + shortCode + '/' + ontology + '/v2#>\n' +
                'PREFIX knora-api-simple: <http://api.knora.org/ontology/knora-api/simple/v2#>\n' +
                'CONSTRUCT {\n' +
                '?mainres knora-api:isMainResource true .\n';
            query += getStringForProp(prop);
            query += '} WHERE {\n?mainres a knora-api:Resource .\n?mainres a ' + shortName + ':' + resType + ' .\n';
            query += getStringForProp(prop);
            query += getFilterByNameValAndObj(prop["propName"], prop["value"], prop["type"]);
            query += '}';
            requestInfos.push(
                {
                    url: 'https://' + server + '/v2/searchextended',
                    gravsearch: query,
                    method: 'POST'

                }
            )
        }
        console.log(requestInfos);
    }

    let dataPromise = getData();
</script>
{#await dataPromise then d}
    {#each requestInfos as requestInfo}
        <ResultsRepresentation requestInfos={requestInfo} jsonFile={jsonFile["ResultsRepresentation"]}/>
    {/each}
{/await}
