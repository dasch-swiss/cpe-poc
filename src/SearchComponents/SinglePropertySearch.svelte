<script>
    import {push} from 'svelte-spa-router'
    export let props;
    export let link;
    let dropDownVal = props[0];
    let searchVal = "";
    import {language} from "../store";
    import {getLabelsForProperties} from "../dsp-services";

    function nav() {
        if (searchVal !== ''){
            push(link['URI'] + '/' + encodeURI(link['Id']) + '/' + encodeURI(dropDownVal['propName']) + '/' + encodeURI(searchVal));
        } else {
            push(link['URI']);
        }
    }
    let promise = getLabelsForProperties(props);
</script>
{#await promise}
{:then propsWithLabels}
    <select bind:value={dropDownVal}>
        {#each propsWithLabels as prop}
                <option value={prop}>
                    {prop['label'][$language]}
                </option>
        {/each}
    </select>
{/await}




<input bind:value={searchVal}>
<button on:click="{nav}">{$language === 'en' ? 'Search' : 'Suchen'}</button>
