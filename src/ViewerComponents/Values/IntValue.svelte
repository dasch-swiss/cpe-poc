<!-- This component displays the value of type integer. -->
<script>
    export let displayValue;
</script>

{#if displayValue}
    <div class="int-container">
        {displayValue}
    </div>
{/if}

<style>
    .int-container {
    }

    .int-container:hover {
        background-color: rgb(240, 240, 240);
    }
</style>
