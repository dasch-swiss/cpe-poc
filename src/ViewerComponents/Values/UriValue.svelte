<!-- This component displays the value of type uri. -->
<script>
    export let displayValue;
</script>

{#if displayValue}
    <div class="url-container">
        <a href={displayValue} target='_blank'>{displayValue}</a>
    </div>
{/if}

<style>
    .url-container {
    }

    .url-container:hover {
        background-color: rgb(240, 240, 240);
    }
</style>
