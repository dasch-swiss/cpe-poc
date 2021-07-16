<!-- This component displays the value of type date. -->
<script>
    /**
     * @param {Object} displayValue Date object containing all the details
     * @param {string} displayValue.valueAsString date as string
     * @param {string} displayValue.calendar 'GREGORIAN' || 'JULIAN'
     * @param {number} displayValue.endDay
     * @param {string} displayValue.endEra
     * @param {number} displayValue.endMonth
     * @param {number} displayValue.endYear
     * @param {number} displayValue.startDay
     * @param {string} displayValue.startEra
     * @param {number} displayValue.startMonth
     * @param {number} displayValue.startYear
     */
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
