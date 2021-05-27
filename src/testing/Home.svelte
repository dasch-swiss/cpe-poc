<script>
    import {link} from 'svelte-spa-router'
    import {language} from '../store.js';
</script>
{#if $language === 'de'}
    <p>WILLKOMMEN ZUHAUSE</p>
{/if}
{#if $language === 'en'}
    <p>WELCOME HOME</p>
{/if}
