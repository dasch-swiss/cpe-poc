<script>
    export let json;
    import {language} from "../store";
</script>
{#each json['languages'] as lang}
    <button on:click={language.set(lang['value'])}>{lang['label']}</button>
{/each}