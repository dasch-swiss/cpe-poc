<script>
    export let displayValue;
</script>

{#if displayValue}
    <div class="list-container">
        {displayValue}
    </div>
{/if}

<style>
    .list-container {
    }

    .list-container:hover {
        background-color: rgb(240, 240, 240);
    }
</style>
