<script>
    /* Assumes text property */
    import {getLabelForProp, getListByPropName, getObjectTypeForProp} from "../dsp-services";
    import {getFilterByNameAndVal, getPropString} from './SearchUtility';
    export let value;
    export let prop;
    export let shortName;
    let dateDepth;
    let name = prop["propName"]; // helper to avoid refreshing on await command in html.
    import {language} from '../store.js'

    /*
        This function return the gravsearch string that references this value. It takes into account whether its a property of the main resource or if the main resource is linked.
        @return: the gravsearch string
    */
    export function getString() {

        return getPropString(prop);
    }

    /*
       A helper function to create the query when the search needs to be fired. Returns the filter string. Currently only
       supports text properties.


       @propName: the name of the property to create the filter form
       @return: returns the filter string
    */
    export async function getFilter() {
        return await getFilterByNameAndVal(prop['propName'], value, dateDepth);

    }

    export function isEmpty() {
        return value === "";
    }
    let promise = getLabelForProp(prop['propName']);
    let secondPromise = getObjectTypeForProp(prop['propName']);
</script>
{#await promise}
    {:then propLabel}
    <p>{$language === 'en' ? "Enter search value for" : "Suchwert eingeben für" } {propLabel[$language]}</p>
{/await}
{#await secondPromise}
    {:then obj}
    {#if obj === 'knora-api:DateValue'}
        <select bind:value={dateDepth} on:change={()=> {value = null;}}>
            <option value="" disabled selected>{$language === 'en' ? 'Choose date depth' : 'Genauigkeit des Datums wählen'}</option>
            <option value="month">{$language === 'en' ? 'Month' : 'Monat'}</option>
            <option value="year">{$language === 'en' ? 'Year' : 'Jahr'}</option>
        </select>
        {#if dateDepth === 'month'}
            <input bind:value={value} type="month"/>
        {/if}
        {#if dateDepth === 'year'}
            <input placeholder="{$language=== 'en' ? 'Enter year in format YYYY' : 'Jahr im Format YYYY eingeben'}" bind:value={value} />
        {/if}
    {/if}
    {#if obj === 'knora-api:ListValue'}
        {#await getListByPropName(name)}
        {:then list}
        <select bind:value={value}>
            <option value="" disabled selected>{$language === 'en' ? 'Choose value to filter for' : 'Filterwert wählen'}</option>


                {#each list as item}
                    <option value={item.id}>{item.label}</option><!-- Currently these labels arent returned with multiple languages, which is why this isn't used here -->
                {/each}
        </select>
        {/await}
    {/if}
    {#if obj === 'knora-api:TextValue' || obj === 'knora-api:IntValue'}
        <input placeholder="{$language === 'en' ? 'Enter search value' : 'Suchwert eingeben'}" bind:value={value}/>
    {/if}
{/await}

