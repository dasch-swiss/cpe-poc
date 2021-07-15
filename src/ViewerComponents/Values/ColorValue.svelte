<script>
    export let displayValue;
</script>

{#if displayValue}
    <div class="color-container">
        {displayValue}
    </div>
{/if}

<style>
    .color-container {
    }

    .color-container:hover {
        background-color: rgb(240, 240, 240);
    }
</style>
