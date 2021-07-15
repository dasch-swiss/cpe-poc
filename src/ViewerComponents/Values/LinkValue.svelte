<script>
    export let displayValue;
</script>

{#if displayValue}
    <div class="link-container">
        {displayValue}
    </div>
{/if}

<style>
    .link-container {
    }

    .link-container:hover {
        background-color: rgb(240, 240, 240);
    }
</style>
