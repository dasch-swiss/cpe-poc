<script>
    // provides a search field for the search form, recursively in case of linked properties
    import {getLabelForProp, getListByPropName, getObjectTypeForProp} from "../dsp-services";
    import {getFilterByNameAndVal, getPropString} from './SearchUtility';
    import {language} from '../store.js'
    import SearchField from "./SearchField.svelte";

    export let parent; //holds the parent gravsearch identifier for creating the gravsearch string
    export let prop, predefProp, predefVal;
    let dateDepth; //for date properties, this tells us whether the date was given with month or year precision
    let children = []; //in case of linked resources
    let value = ""; //stores the value to filter for
    let name = prop["propName"]; // helper to avoid refreshing on await command in html.


    /*
        This function return the gravsearch string that references this value. It takes into account whether its a property of the main resource or if the main resource is linked.
        @return: the gravsearch string
    */
    export function getString() {
        let toReturn = getPropString(prop, parent);
        for (const child of children) {
            if (!child.isEmpty()) { //empty children are not added to the string
                toReturn += child.getString();
            }
        }
        return toReturn;
    }

    /*
       A helper function to create the query when the search needs to be fired. Returns the filter string.

       @return: returns the filter string
    */
    export async function getFilter() {
        if (isEmpty()) {
            return '';
        }
        if (children.length > 0) { // if the prop has children, this is not the property with the filter but rather its children
            let toReturn = "";
            for (const child of children) {
                toReturn += await child.getFilter();
            }
            return toReturn;
        }
        return await getFilterByNameAndVal(prop['propName'], value, dateDepth);
    }

    /*
    Checks whether this property is empty, meaning it itself as well as all its children do not have a value to filter for
    @return: the boolean
     */
    export function isEmpty() {
        if (prop.hasOwnProperty("linkedResource")) {
            for (const child of children) {
                if (!child.isEmpty()) {
                    return false;
                }
            }
            return true;
        }
        return value === "";
    }

    value = predefProp === prop['propName'] ? predefVal : ''; //the value might be predefined by another component
    let labelPromise = getLabelForProp(prop['propName']);
    let objectPromise = getObjectTypeForProp(prop['propName']);
</script>

{#if !prop.hasOwnProperty("linkedResource")} <!-- Since if there are children, we don't need to display anything for this prop itself -->
    {#await labelPromise}
    {:then propLabel}
        <p>{$language === 'en' ? "Enter search value for" : "Suchwert eingeben für" } {propLabel[$language]}</p>
    {/await}
    {#await objectPromise}
    {:then obj}
        {#if obj === 'knora-api:DateValue'}
            <select bind:value={dateDepth} on:change={()=> {value = null;}}>
                <option value="" disabled
                        selected>{$language === 'en' ? 'Choose date depth' : 'Genauigkeit des Datums wählen'}</option>
                <option value="month">{$language === 'en' ? 'Month' : 'Monat'}</option>
                <option value="year">{$language === 'en' ? 'Year' : 'Jahr'}</option>
            </select>
            {#if dateDepth === 'month'}
                <input bind:value={value} type="month"/>
            {/if}
            {#if dateDepth === 'year'}
                <input placeholder="{$language=== 'en' ? 'Enter year in format YYYY' : 'Jahr im Format YYYY eingeben'}"
                       bind:value={value}/>
            {/if}
        {/if}
        {#if obj === 'knora-api:ListValue'}
            {#await getListByPropName(name)}
            {:then list}
                <select bind:value={value}>
                    <option value="" disabled
                            selected>{$language === 'en' ? 'Choose value to filter for' : 'Filterwert wählen'}</option>


                    {#each list as item}
                        <option value={item.id}>{item.label}</option>
                        <!-- Currently these labels arent returned with multiple languages, which is why this isn't used here -->
                    {/each}
                </select>
            {/await}
        {/if}
        {#if obj === 'knora-api:TextValue' || obj === 'knora-api:IntValue'}
            <input placeholder="{$language === 'en' ? 'Enter search value' : 'Suchwert eingeben'}" bind:value={value}/>
        {/if}
    {/await}
    <!-- TODO: Support more property types -->
{:else}
    {#each prop["linkedResource"]["Props"] as link}
        <SearchField bind:this={children[children.length]} prop={link} {predefProp} {predefVal}
                     parent={'?' + prop['propName']}/>
    {/each}
{/if}
