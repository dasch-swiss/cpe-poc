<script>
    import {location} from 'svelte-spa-router'
    import * as j from '../test.json'
    import JSONContentParser from './JSONContentParser.svelte'
    export let params;
    for (const key in params) {
        params[key] = decodeURI(params[key]);
    }
    let json = {}
    let loc = $location.substring($location.indexOf('#') + 1, $location.indexOf('/', $location.indexOf('#') + 2))
    if (loc === ''){
        loc = $location;
    }
    for (const page of j['Page']){
        if  (page['URI'] === loc){ // assumes that every page has URI information (seems safe)
            json = page;
        }
    }
    if (Object.keys(json).length === 0){
        console.log('Didnt find matching page');
        //TODO: Throw error
    }
</script>
<JSONContentParser json={json['Content']} params={params} ontology={j['DSP']['Ontology']} server={j['DSP']['Server']} shortCode = {j['DSP']['ShortCode']}/>
