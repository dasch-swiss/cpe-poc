<script>
    export let displayValue;
</script>

{#if displayValue}
    <div class="decimal-container">
        {displayValue}
    </div>
{/if}

<style>
    .decimal-container {
    }

    .decimal-container:hover {
        background-color: rgb(240, 240, 240);
    }
</style>
