<!-- This component takes a json as argument and parses it into the Components to display. -->
<script>
    import SinglePropertySearch from "./SinglePropertySearch.svelte";
    import ClickableImage from './ClickableImage.svelte';
    export let json;
    export let params; //if arguments need to be passed from the URI.
    export let server, ontology, shortCode;
    import SearchForm from './SearchForm.svelte'
    import LanguageSelector from './LanguageSelector.svelte'
</script>
{#if json} <!-- For Safety. This way this component can be called with falsy or undefined json -->
    {#each json['ClickableImage'] || [] as img}
        <ClickableImage src={img['src']} link={img['link']}/>
    {/each}
    {#each json['SearchForm'] || [] as form} <!-- Loops through the json-Searchform array or an empty array if undefined -->
        <!-- Creates the SearchForm and assigns the dict, passes parameters if the ID matches -->
        <SearchForm form="{form}" predefProp={params['predefForm'] === form['Id']? params['predefinedProp'] : ''} predefVal={params['predefForm'] === form['Id'] ? params['predefinedVal'] : ''} {server} {ontology} {shortCode}/>
    {/each}
    <!-- Same as above for SinglePropertySearch, does not support params for URI yet (as they are not needed at this point) -->
    {#each json['SinglePropertySearch'] || [] as search}
        <SinglePropertySearch props={search['Props']} link={search['LinkedSearchForm']}/>
    {/each}
    {#each json['LanguageSelector'] || [] as selector}
        <LanguageSelector json={selector}/>
    {/each}
{/if}



