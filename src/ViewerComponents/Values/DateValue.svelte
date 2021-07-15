<script>
    export let displayValue;
</script>

{#if displayValue}
    <div class="date-container">
        {displayValue.valueAsString}
    </div>
{/if}

<style>
    .date-container {
    }

    .date-container:hover {
        background-color: rgb(240, 240, 240);
    }
</style>
