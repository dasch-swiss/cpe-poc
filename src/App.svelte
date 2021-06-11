<!-- Entry point for the application. Calls Header, Main and Footer -->
<script>
    import Router from 'svelte-spa-router'
    import routes from './routes'

    //import * as json from './mls.json' // imports the json file and directly loads it into the variable json.
    import JSONContentParser from "./SearchComponents/JSONContentParser.svelte"
    import {json} from './store.js'


</script>

<JSONContentParser json={$json['Header']['Content']}/> <!-- Displays the Header content -->
<Router {routes}/> <!-- Displays the 'Main' as it loads the respective route -->
<JSONContentParser json={$json['Footer']['Content']}/> <!-- Displays the Footer content -->

<style>
</style>
