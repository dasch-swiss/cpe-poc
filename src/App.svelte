<!-- Entry point for the application. Calls Header, Main and Footer -->
<script>
    import {onMount} from 'svelte';
    import Router from 'svelte-spa-router';
    import routes from './routes';

    import JSONContentParser from "./SearchComponents/JSONContentParser.svelte";
    import {json, lists, ontologies, token} from './store.js';
    import {getList, getOntology, login} from "./dsp-services";

    /**
     * Tries to fetch login, list and ontology at entry point.
     */
    onMount(async () => {
        try {
            const logResult = await login($json['DSP']['User']);
            token.set(logResult);

            const listResult = await getList();
            lists.set(listResult);

            const ontResult = await getOntology();
            ontologies.set(ontResult);
        } catch (e) {
        //    TODO What to do if the requests all fail. Blocking app? Retry button?
        }
    })
</script>

<JSONContentParser json={$json['Header']['Content']}/> <!-- Displays the Header content -->
<Router {routes}/> <!-- Displays the 'Main' as it loads the respective route -->
<JSONContentParser json={$json['Footer']['Content']}/> <!-- Displays the Footer content -->
