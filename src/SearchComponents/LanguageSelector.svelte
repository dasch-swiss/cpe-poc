<!-- This component provides buttons to choose the current language and sets the chosen value in the store.js variable -->
<script>
    import {language} from "../store.js";

    export let json;
</script>

{#each json['languages'] as lang}
    <button on:click={language.set(lang['value'])}>{lang['label']}</button>
{/each}
