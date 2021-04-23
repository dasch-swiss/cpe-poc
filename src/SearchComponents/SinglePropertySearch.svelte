<script>
    import {push} from 'svelte-spa-router'
    export let props;
    export let link;
    let dropDownVal = props[0];
    let searchVal = "";
    import {language} from "../store";

    function nav() {
        if (searchVal !== ''){
            push(link['URI'] + '/' + encodeURI(link['Id']) + '/' + encodeURI(dropDownVal['propName']) + '/' + encodeURI(searchVal));
        } else {
            push(link['URI']);
        }
    }
</script>
<select bind:value={dropDownVal}>
    {#each props as prop}
        <option value={prop}>
            {prop['label'][$language]}
        </option>
    {/each}
</select>
<input bind:value={searchVal}>
<button on:click="{nav}">{$language === 'en' ? 'Search' : 'Suchen'}</button>