<script>
    // TODO: Support properties that are incoming links
    import {getResByIri, login} from "../dsp-services";
    import {token} from "../store";
    import {getFilterByNameValAndObj, getPropString} from "./SearchUtility";

    export let iri;
    export let props;
    export let user, ontology, server, shortCode, shortName;
    let resType;
    let data;
    let searchInfo = [];
    async function getData(){
        const logResult = await login(user);  // TODO: Login should happen at app start and only be checked in dsp-services, not in components
        token.set(logResult);
        // Requests the resource
        data = await getResByIri(iri, $token);
        let linkedIri = '';
        resType = data["@type"].replace(ontology + ':', '');
        for (const prop of props){
            let linkedRes = data;
            let linkStack = [];
            let curr = prop["linkedVia"];
            while(curr){
                linkStack.push(curr['propName']);
                curr = curr['linkedVia'];
            }
            linkedRes = data;
            while (linkStack.length > 0){
                curr = linkStack.pop();
                linkedIri = linkedRes[ontology + ':' + curr + 'Value']['knora-api:linkValueHasTarget']['@id'];
                linkedRes = await getResByIri(linkedIri, $token);
            }
            if(linkedRes.hasOwnProperty(ontology + ':' + prop['propName'])){
                // TODO: Support all property types
                switch(linkedRes[ontology + ':' + prop['propName']]["@type"]){
                    case "knora-api:TextValue":
                        prop["value"] = linkedRes[ontology + ':' + prop['propName']]["knora-api:valueAsString"];
                        break;
                    case "knora-api:IntValue":
                        prop["value"] = linkedRes[ontology + ':' + prop['propName']]["knora-api:intValueAsInt"].toString();
                        break;
                    default:
                        // TODO: Throw error
                        console.log("No suitable type found");
                        break;
                }
                prop["type"] = linkedRes[ontology + ':' + prop['propName']]["@type"];
                searchInfo.push(prop);
            }

        }
        await search();
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
            query += getPropString(prop);
            query += '} WHERE {\n?mainres a knora-api:Resource .\n?mainres a ' + shortName + ':' + resType + ' .\n';
            query += getPropString(prop);
            query += getFilterByNameValAndObj(prop["propName"], prop["value"], prop["type"]);
            query += '}';
            console.log(query);
            const res = await fetch( 'https://' + server + '/v2/searchextended', {
                method: 'POST',
                body: query

            })
            const json = await res.json()
            searchResults = searchResults.concat(json["@graph"]);
        }
        searchResults = searchResults.slice(0, 25);
        console.log(searchResults);
    }
    let dataPromise = getData();
</script>

