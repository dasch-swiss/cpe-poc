<!-- Entry point for the application. Calls Header, Main and Footer -->
<script>
    import Router from 'svelte-spa-router'
    import routes from './routes'

    //import * as json from './mls.json' // imports the json file and directly loads it into the variable json.
    import JSONContentParser from "./SearchComponents/JSONContentParser.svelte"
    import {json, ww_json} from './store.js'

    import ResourceViewer from "./ViewerComponents/ResourceViewer.svelte";
</script>

<JSONContentParser json={$json['Header']['Content']}/> <!-- Displays the Header content -->
<Router {routes}/> <!-- Displays the 'Main' as it loads the respective route -->
<JSONContentParser json={$json['Footer']['Content']}/> <!-- Displays the Footer content -->

{#each $ww_json['Page'] as res}
    <ResourceViewer resource={res} server={$ww_json['DSP']['Server']} ontology={$ww_json['DSP']['Ontology']}/>
{/each}

<style>
</style>
