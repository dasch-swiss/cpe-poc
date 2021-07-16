<!--This component provides the entry point for each page in the json, finds its json part via its uri and -->
<!--calls the jsoncontentparser-->
<script>
    import {location} from 'svelte-spa-router'
    import {json} from '../store.js'
    import JSONContentParser from './JSONContentParser.svelte'

    export let params;
    for (const key in params) {
        params[key] = decodeURI(params[key]);
    }
    let j = {}
    let loc = $location.substring($location.indexOf('#') + 1, $location.indexOf('/', $location.indexOf('#') + 2)) //string manipulation to get the same uri as defined in the json
    if (loc === ''){
        loc = $location;
    }

    for (const page of $json['Page']){
        if  (page['URI'] === loc){ // assumes that every page has URI information (seems safe)
            j = page;
        }
    }

    if (Object.keys(j).length === 0){
        console.log('Didnt find matching page');
        //TODO: Throw error
    }
</script>

<JSONContentParser
        json={j['Content']}
        params={params}
        ontology={$json['DSP']['Ontology']}
        server={$json['DSP']['Server']}
        shortCode = {$json['DSP']['ShortCode']}
        shortName = {$json['DSP']['ShortName']}
        user = {$json['DSP']['User']}
/>
