<script>
	import SearchForm from './SearchForm.svelte'
    import * as json from './test.json'
</script>

{#each json['SearchForm'] as form}
    <SearchForm form="{form}"/>
{/each}
<style>

</style>
