<script>
    export let displayValue;
</script>

{#if displayValue}
    <div class="geoname-container">
        {displayValue}
    </div>
{/if}

<style>
    .geoname-container {
    }

    .geoname-container:hover {
        background-color: rgb(240, 240, 240);
    }
</style>
