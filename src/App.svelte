<!-- Entry point for the application. Calls Header, Main and Footer -->
<script>
    import {onMount} from 'svelte';
    import Router from 'svelte-spa-router';
    import routes from './routes';

    //import * as json from './mls.json' // imports the json file and directly loads it into the variable json.
    import JSONContentParser from "./SearchComponents/JSONContentParser.svelte";
    import {json, lists, ontologies, token} from './store.js';
    import {getList, getOntology, login} from "./dsp-services";

    onMount(async () => {
        try {
            const logResult = await login($json['DSP']['User']);
            token.set(logResult);

            const listResult = await getList();
            lists.set(listResult);

            const ontResult = await getOntology();
            ontologies.set(ontResult);
        } catch (e) {

        }
    })
</script>

<JSONContentParser json={$json['Header']['Content']}/> <!-- Displays the Header content -->
<Router {routes}/> <!-- Displays the 'Main' as it loads the respective route -->
<JSONContentParser json={$json['Footer']['Content']}/> <!-- Displays the Footer content -->

<style>
</style>
