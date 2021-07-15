<script>
    export let displayValue;
</script>

{#if displayValue}
    <div class="time-container">
        {displayValue}
    </div>
{/if}

<style>
    .time-container {
    }

    .time-container:hover {
        background-color: rgb(240, 240, 240);
    }
</style>
