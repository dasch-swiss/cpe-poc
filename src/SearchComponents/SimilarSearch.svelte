<script>
    /*
    A component that takes an iri and searches for other resources with the same values for some given properties.
    TODO: Support properties that are incoming links
    */


    import {getResByIri, login} from "../dsp-services";
    import {token} from "../store";
    import {getFilterByNameValAndObj, getPropString} from "./SearchUtility";
    import ResultsRepresentation from "../ViewerComponents/ResultsRepresentation.svelte";

    export let jsonFile; // contains the relevant part of the json.
    export let user, ontology, server, shortCode, shortName;
    let iri = jsonFile['Iri'];
    let props = jsonFile['Props'];
    let resType;
    let data; // contains the data available for the resource corresponding to the given iri.
    let searchInfo = []; // helper array that stores the information to create the queries.
    let requestInfos = []; // holds the output for the viewer components

    async function getData() {
        // Requests the resource
        data = await getResByIri(iri, $token);
        resType = data["@type"].replace(ontology + ':', '');
        for (const prop of props) {
            await prepareProp(prop, data);
        }
        getQueries();
    }

    /*
    Augment the prop with information about its type and value and store it in the searchInfo array. Gets called
    recursively for linked properties.
    @prop: the property as provided in the json
    @data: the information about the parent resource as received by the api
    @linkQueue: stores the path to reach this property if it is reached via linked properties.
     */
    async function prepareProp(prop, data, linkQueue = []) {
        if (prop.hasOwnProperty("linkedResource")) {
            for (const linkProp of prop["linkedResource"]["Props"]) {
                const linkedIri = data[ontology + ':' + prop["propName"] + 'Value']['knora-api:linkValueHasTarget']['@id'];
                const newData = await getResByIri(linkedIri, $token);
                await prepareProp(linkProp, newData, linkQueue.concat([prop["propName"]]));
            }
        } else {
            if (data.hasOwnProperty(ontology + ':' + prop['propName'])) { //reached the property that actually needs to be filtered for. TODO: Support all property types
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

    /*
    Returns the gravsearch query string for a property stored in searchInfo.
    @return: the string to be added to the gravsearch query.
     */
    function getStringForProp(prop) {
        let parent = '?mainres';
        let toReturn = '';
        if (prop.hasOwnProperty("linkQueue")) { //if the property to be filtered for was a linked property, we need to add the path to reach it to the query.
            let curr;
            const temp = [...prop["linkQueue"]];
            while (temp.length > 0) {
                curr = temp.shift();
                toReturn += parent + ' ' + shortName + ':' + curr + ' ?' + curr + ' .\n';
                parent = '?' + curr;
            }
        }
        toReturn += getPropString(prop, parent);
        return toReturn;
    }
    /*
    For each of the properties provided in the json, the query is created and stored in the requestInfos.
     */
    function getQueries() {
        for (const prop of searchInfo) {
            let query = 'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>\n' +
                'PREFIX ' + shortName + ': <http://' + server + '/ontology/' + shortCode + '/' + ontology + '/v2#>\n' +
                'PREFIX knora-api-simple: <http://api.knora.org/ontology/knora-api/simple/v2#>\n' +
                'CONSTRUCT {\n' +
                '?mainres knora-api:isMainResource true .\n'; //maybe add this default string to a server.
            query += getStringForProp(prop);
            query += addStillImageFile(); // if a image viewer is used, here we need to add the still image information
            query += '} WHERE {\n?mainres a knora-api:Resource .\n?mainres a ' + shortName + ':' + resType + ' .\n';
            query += getStringForProp(prop);
            query += getFilterByNameValAndObj(prop["propName"], prop["value"], prop["type"]);
            query += addStillImageFile();
            query += '}';
            requestInfos.push(
                {
                    url: 'https://' + server + '/v2/searchextended',
                    gravsearch: query,
                    method: 'POST'

                }
            )
        }
    }
    /*
    Checks whether an ImageViewer is used in conjunction with this component and adds the necessary string.
    @return: the string to be added.
     */
    function addStillImageFile() {
        let line = '';
        const representations = jsonFile["ResultsRepresentation"];

        for (const key in representations) {
            if (key === 'MultipleImages') {
                line += '?mainres knora-api:hasStillImageFileValue ?imgfile .\n';
            }
        }

        return line;
    }

    let queriesPromise = getData();
</script>
{#await queriesPromise then d}
    {#each requestInfos as requestInfo}
        <ResultsRepresentation requestInfos={requestInfo} jsonFile={jsonFile["ResultsRepresentation"]}/>
    {/each}
{/await}
