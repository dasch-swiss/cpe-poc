<!-- This component displays the value of type boolean. -->
<script>
    export let displayValue;
</script>

{#if displayValue}
    <div class="boolean-container">
        {displayValue}
    </div>
{/if}

<style>
    .boolean-container {
    }

    .boolean-container:hover {
        background-color: rgb(240, 240, 240);
    }
</style>
