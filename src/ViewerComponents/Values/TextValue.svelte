<script>
    export let displayValue;
</script>

{#if displayValue}
    <div class="text-container">
        {displayValue}
    </div>
{/if}

<style>
    .text-container {
    }

    .text-container:hover {
        background-color: rgb(240, 240, 240);
    }
</style>
