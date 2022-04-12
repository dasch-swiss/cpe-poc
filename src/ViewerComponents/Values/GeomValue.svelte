<!-- This component displays the value of type geom. -->
<script>
    export let displayValue;
</script>

{#if displayValue}
    <div class="geom-container">
        {displayValue}
    </div>
{/if}

<style>
    .geom-container {
    }

    .geom-container:hover {
        background-color: rgb(240, 240, 240);
    }
</style>
