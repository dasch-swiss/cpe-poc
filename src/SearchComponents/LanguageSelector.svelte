<script>
    /*
    This component provides buttons to choose the current language and sets the chosen value in the store.js variable
     */
    export let json;
    import {language} from "../store.js";
</script>
{#each json['languages'] as lang}
    <button on:click={language.set(lang['value'])}>{lang['label']}</button>
{/each}
