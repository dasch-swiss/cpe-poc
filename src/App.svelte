<!-- Entry point for the application. Calls Header, Main and Footer -->
<script>
    import Router from 'svelte-spa-router'
    import routes from './routes'

    //import * as json from './mls.json' // imports the json file and directly loads it into the variable json.
    import JSONContentParser from "./SearchComponents/JSONContentParser.svelte"
    import {json, project_json} from './store.js'

    import ResourceViewer from "./ViewerComponents/ResourceViewer.svelte";
</script>

<JSONContentParser json={$json['Header']['Content']}/> <!-- Displays the Header content -->
<Router {routes}/> <!-- Displays the 'Main' as it loads the respective route -->
<JSONContentParser json={$json['Footer']['Content']}/> <!-- Displays the Footer content -->

{#each $project_json['Page'] as res}
    <ResourceViewer
            resource={res}
            server={$project_json['DSP']['Server']}
            ontology={$project_json['DSP']['Ontology']}
            user="{$project_json['DSP']['User']}"
            shortname="{$project_json['DSP']['ShortName']}"
            shortcode="{$project_json['DSP']['ShortCode']}"/>
{/each}

<style>
</style>
