<script>
    // TODO: Support properties that are incoming links
    import {getResByIri, login} from "../dsp-services";
    import {token} from "../store";
    import {getFilterByNameValAndObj, getPropString, getPropStringHelper} from "./SearchUtility";

    export let iri;
    export let props;
    export let user, ontology, server, shortCode, shortName;
    let resType;
    let data;
    let searchInfo = [];
    
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
        await search();
    }

    async function getPropValue(prop, data, linkQueue = []){
        if (prop.hasOwnProperty("linkedResource")){
            for (const linkProp of prop["linkedResource"]["Props"]){
                const linkedIri = data[ontology + ':' + prop["propName"] + 'Value']['knora-api:linkValueHasTarget']['@id'];
                const newData = await getResByIri(linkedIri, $token);
                await getPropValue(linkProp, newData, linkQueue.concat([prop["propName"]]));
            }
        } else {
            if(data.hasOwnProperty(ontology + ':' + prop['propName'])){
                // TODO: Support all property types
                switch(data[ontology + ':' + prop['propName']]["@type"]){
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
                console.log(searchInfo);
            }
        }
    }

    function getStringForProp(prop){
        let parent = '?mainres';
        let toReturn = '';
        if (prop.hasOwnProperty("linkQueue")){
            let curr;
            const temp = [...prop["linkQueue"]];
            while (temp.length > 0){
                curr = temp.shift();
                toReturn += parent + ' ' + shortName + ':' + curr + ' ?' + curr + ' .\n';
                parent = '?' + curr;
            }
        }
        toReturn += getPropStringHelper(prop, parent);
        console.log(prop);
        return toReturn;
    }

    async function search(){
        let searchResults = [];
        for (const prop of searchInfo){
            if (searchResults.length >= 25){
                break;
            }
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
            console.log(query);
            const res = await fetch( 'https://' + server + '/v2/searchextended', {
                method: 'POST',
                body: query

            })
            const json = await res.json();
            console.log(json);
            searchResults = searchResults.concat(json["@graph"]);
        }
        searchResults = searchResults.slice(0, 25);
        console.log(searchResults);
    }
    let dataPromise = getData();
</script>

