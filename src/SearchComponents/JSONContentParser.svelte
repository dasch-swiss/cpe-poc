<!-- This component takes a json as argument and parses it into the Components to display. -->
<script>
    import SinglePropertySearch from "./SinglePropertySearch.svelte";
    import ClickableImage from './ClickableImage.svelte';

    export let json;
    export let params; //if arguments need to be passed from the URI.
    export let server, ontology, shortCode, shortName, user;
    import SearchForm from './SearchForm.svelte'
    import LanguageSelector from './LanguageSelector.svelte'
    import LinkButton from "./LinkButton.svelte";
    import PdfViewer from 'svelte-pdf';
    import ExpertSearch from "./ExpertSearch.svelte";
    import GravsearchTemplate from "./GravsearchTemplate.svelte";
    import ResourceViewer from "../ViewerComponents/ResourceViewer.svelte";
    import ImageViewer from "../ViewerComponents/ImageViewer.svelte";
    import SimilarSearch from "./SimilarSearch.svelte";
</script>
{#if json} <!-- For Safety. This way this component can be called with falsy or undefined json -->
    {#each json['ClickableImage'] || [] as img}
        <ClickableImage src={img['src']} link={img['link']}/>
    {/each}
    {#each json['SearchForm'] || [] as form} <!-- Loops through the json-Searchform array or an empty array if undefined -->
        <!-- Creates the SearchForm and assigns the dict, passes parameters if the ID matches -->
        <SearchForm form="{form}" predefProp={params['slot1'] === form['Id']? params['slot2'] : ''} predefVal={params['slot1'] === form['Id'] ? params['slot3'] : ''} {server} {ontology} {shortCode} {shortName}/>
    {/each}
    <!-- Same as above for SinglePropertySearch, does not support params for URI yet (as they are not needed at this point) -->
    {#each json['SinglePropertySearch'] || [] as search}
        <SinglePropertySearch props={search['Props']} link={search['LinkedSearchForm']}/>
    {/each}
    {#each json['LinkButton'] || [] as button}
        <LinkButton link={button['link']} label={button['label']}/>
    {/each}
    {#each json['LanguageSelector'] || [] as selector}
        <LanguageSelector json={selector}/>
    {/each}
    {#each json['PDFDisplay'] || [] as pdf}
        <PdfViewer url={pdf['file']}/>
    {/each}
    {#each json['ExpertSearch'] || [] as expert}
        <ExpertSearch {ontology} {server} {shortCode} {shortName}/>
    {/each}
    {#each json['GravsearchTemplate'] || [] as temp}
        <GravsearchTemplate template={temp['Template']} parameters={temp['Params']}/>
    {/each}
    {#each json['SimilarSearch'] || [] as sim}
        <SimilarSearch iri={sim['Iri']} props={sim['Props']} {user} {ontology} {server} {shortCode} {shortName}/>
    {/each}
    {#each json['ResourceViewers'] || [] as res}
        <ResourceViewer
                resource={res}
                server={server}
                ontology={ontology}
                user={user}
                shortname={shortName}
                shortcode={shortCode}/>
    {/each}
    {#each json['ImageViewers'] || [] as res}
        <ImageViewer
                resource={res}
                server={server}
                ontology={ontology}
                user={user}
                shortname={shortName}
                shortcode={shortCode}/>
    {/each}
{/if}



