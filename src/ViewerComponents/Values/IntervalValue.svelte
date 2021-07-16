<!-- This component displays the value of type interval. -->
<script>
    export let displayValue;
</script>

{#if displayValue}
    <div class="interval-container">
        {displayValue.startVal}-{displayValue.endVal}
    </div>
{/if}

<style>
    .interval-container {
    }

    .interval-container:hover {
        background-color: rgb(240, 240, 240);
    }
</style>
