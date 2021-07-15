<script>
    /*
    Helper that represents the properties and the option to add filter for the ExpertSearch component
     */

    import {getListByPropName, getPropsWithObjAndLabelsForRes} from "../dsp-services";
    import {language} from "../store.js";
    import ExpertSearchPropHelper from "./ExpertSearchPropHelper.svelte";
    import {createEventDispatcher} from 'svelte';
    import {getFilterByNameValAndObj} from './SearchUtility';
    const dispatch = createEventDispatcher();
    export let props, ontology, parentGravId;
    let deleted = false; //TODO: This solution is a bit "hacky", even though it has its advantages.
    let chosenProp;
    let operator;
    let enteredValue;
    let dateDepth;
    let child;

    export function getPropName(){
        return chosenProp['propName'];
    }

    export function getPropGravId(){
        return '?' + chosenProp['propName'].replace(ontology + ':', '');
    }

    export function setDeleted() {
        deleted = true;
    }

    export function isDeleted(){
        return deleted;
    }

    /*
    Creates the string to create the query in the ExpertSearch component, including the property and the filter string
     */
    export function getString(){
        if (!chosenProp || !operator){
            return '';
        }
        if (isDeleted()){
            return '';
        }
        let toReturn = '';
        toReturn += parentGravId + ' ' + getPropName() + ' ' + getPropGravId() + ' .\n';
        if (hasChild() && child){
            toReturn += child.getString();
        } else if (operator === 'Equals' && enteredValue){
            toReturn += getFilterByNameValAndObj(chosenProp['propName'], enteredValue, chosenProp['object'], dateDepth);
        }
        return toReturn;
    }

    function hasChild() {
        return chosenProp && chosenProp['object'].search(ontology + ':') !== -1;
    }
    /*
    Notification method to let the ExpertSearch component know to update its query
     */
    function notify(){
        dispatch('message', {text: 'updated'});
    }
    /*
    Gets the properties a child could have for the dropdown menu
     */
    async function getChildProps() {
        if (!hasChild()) {
            return [];
        }
        return await getPropsWithObjAndLabelsForRes(chosenProp['object']);
    }

    let listPromise;
    $: if(chosenProp && chosenProp['object'] === 'knora-api:ListValue'){
        listPromise = getListByPropName(chosenProp['propName']);
    }
</script>
{#if (!deleted)}
    <select on:change="{() => {enteredValue = null; operator = ''; notify();}}" bind:value={chosenProp}>
        <option value="" disabled selected>{$language === 'en' ? 'Choose property' : 'Property wählen'}</option>
        {#each props as prop}
            <option value={prop}>{prop['label'][$language]}</option>
        {/each}
    </select>
    {#if chosenProp}
        <select bind:value={operator} on:change="{()=> {enteredValue = null; if (child) {child.setDeleted()}; notify();}}">
            <option value="" disabled selected>{$language === 'en' ? 'Choose filter option' : 'Filteroption wählen'}</option>
            <option value="Equals">{$language === 'en' ? 'Equals' : 'Ist gleich'}</option>
            <option value="Exists">{$language === 'en' ? 'Exists' : 'Existiert'}</option>
        </select>
    {/if}
    {#if operator && operator === 'Equals' && !hasChild()}
            {#if chosenProp['object'] === 'knora-api:DateValue'}
                <select bind:value={dateDepth} on:change={()=> {enteredValue = null; notify();}}>
                    <option value="" disabled selected>{$language === 'en' ? 'Choose date depth' : 'Genauigkeit des Datums wählen'}</option>
                    <option value="month">{$language === 'en' ? 'Month' : 'Monat'}</option>
                    <option value="year">{$language === 'en' ? 'Year' : 'Jahr'}</option>
                </select>
                {#if dateDepth === 'month'}
                    <input bind:value={enteredValue} on:change={() => notify()} type="month"/>
                {/if}
                {#if dateDepth === 'year'}
                    <input placeholder="{$language=== 'en' ? 'Enter year in format YYYY' : 'Jahr im Format YYYY eingeben'}" bind:value={enteredValue} on:change={() => notify()}/>
                {/if}
            {/if}
            {#if chosenProp['object'] === 'knora-api:ListValue'}
                {#await listPromise}
                {:then list}
                <select bind:value={enteredValue} on:change={() => notify()}>
                    <option value="" disabled selected>{$language === 'en' ? 'Choose value to filter for' : 'Filterwert wählen'}</option>

                    {#each list as item}
                        <option value={item.id}>{item.label}</option> <!-- Currently these labels arent returned with multiple languages, which is why this isn't used here -->
                    {/each}
                </select>
                {/await}
            {/if}
            {#if chosenProp['object'] === 'knora-api:TextValue' || chosenProp['object'] === 'knora-api:IntValue'}
                <input placeholder="{$language === 'en' ? 'Enter search value' : 'Suchwert eingeben'}" bind:value={enteredValue} on:change={() => notify()}/>
            {/if}
            <!-- TODO: Support all types -->
        {/if}

    {#if operator && operator === 'Equals' && hasChild()}
        {#await getChildProps()}
            {:then cp}
            <ExpertSearchPropHelper on:message={notify} bind:this={child} props={cp} parentGravId={getPropGravId()} {ontology}/>
            {/await}
    {/if}
    {#if parentGravId === '?mainres'}
    <button on:click={() => {setDeleted();notify();}}>X</button>
    {/if}
{/if}
