<script>
    class ListNode {
        constructor(label, id) {
            this.label = label;
            this.id = id;
        }
    }
    import {language} from "../store";
    import ExpertSearchPropHelper from "./ExpertSearchPropHelper.svelte";
    import {createEventDispatcher} from 'svelte';
    const dispatch = createEventDispatcher();
    export let props, resources, server, ontology, parentGravId;
    let deleted = false; //TODO: This solution is a bit "hacky", even though it has its advantages.
    let chosenProp;
    let operator;
    let enteredValue;
    let dateDepth;
    let list;
    let child;

    export function getPropName(){
        return chosenProp.id;
    }
    export function getPropGravId(){
        return '?' + chosenProp.id.replace(ontology.substring(ontology.search('/') + 1) + ':', '');
    }
    export function setDeleted() {
        deleted = true;
    }
    export function isDeleted(){
        return deleted;
    }
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
        }else if (operator === 'Equals' && enteredValue){
            toReturn += getFilterString();
        }
        return toReturn;
    }
    function hasChild() {
        return chosenProp && chosenProp.object.search(ontology.substring(ontology.search('/') + 1) + ':') !== -1
    }
    function notify(){
        dispatch('message', {text: 'updated'});
    }
    async function getList(iri){
        let toReturn = [];
        const res = await fetch('https://' + server + '/v2/lists/' + encodeURIComponent(iri) + '?allLanguages=true' , {
            method: 'GET'
        })
        const json = await res.json();
        for (const node of json['knora-api:hasSubListNode']){
            toReturn.push(new ListNode(node['rdfs:label'], node['@id']));
        }
        list =  toReturn;
    }
    function getFilterString(){
        switch(chosenProp.object){
            case 'knora-api:DateValue':
                const dates = getDatesFromValue();
                return 'FILTER (knora-api:toSimpleDate(' + getPropGravId() + ') <= "' + dates[1] + '"^^knora-api-simple:Date && knora-api:toSimpleDate(' + getPropGravId() + ') > "' + dates[0] + '"^^knora-api-simple:Date) .\n';
            case 'knora-api:ListValue':
                return getPropGravId() + ' knora-api:listValueAsListNode <' + enteredValue + '> .';
            case 'knora-api:TextValue':
                return getPropGravId() + ' knora-api:valueAsString ' + getPropGravId() + 'Str .\nFILTER regex(' + getPropGravId() + 'Str, "' + enteredValue + '", "i") .\n';
            case 'knora-api:IntValue':
                return getPropGravId() + 'knora-api:intValueAsInt' + getPropGravId() + 'Int .\nFILTER(' + getPropGravId() + 'Int  == ' + enteredValue + ') .\n;' //TODO: might be bugged, test
        }
    }
    function getDatesFromValue(){
        let dateAfter = '';
        let dateBefore = '';
        if (dateDepth === 'year'){
            dateAfter = 'GREGORIAN:' + enteredValue + '-12-31';
            dateBefore = 'GREGORIAN:' + (parseInt(enteredValue) - 1).toString() + '-12-31';
        } else if (dateDepth === 'month'){
            const dateConst = new Date(enteredValue);
            const dateBeforeAsDate = new Date(dateConst.getTime());
            dateBeforeAsDate.setDate(dateConst.getDate() - 1);
            dateBefore = 'GREGORIAN:' + dateBeforeAsDate.getFullYear().toString() + '-' + (dateBeforeAsDate.getMonth() + 1).toString() + '-' + dateBeforeAsDate.getDate().toString();
            const dateAfterAsDate = new Date(dateConst.getFullYear(), dateConst.getMonth() + 1, 0); //set to last day of month
            dateAfter = 'GREGORIAN:' + (dateAfterAsDate.getFullYear()).toString() + '-' + (dateAfterAsDate.getMonth() + 1).toString() + '-' + dateAfterAsDate.getDate().toString();
        }
        return [dateBefore, dateAfter];
    }
    function getChildProps() {
        if (!hasChild()) {
            return [];
        }
        for (const r of resources) {
            if (chosenProp.object === r.id) {
                return r.props;
            }
        }
        console.log('Resource not found');
        return [];
    }

    $: if(chosenProp && chosenProp.listIri !== ''){
        getList(chosenProp.listIri)
    }
</script>
{#if (!deleted)}
    <select on:change="{() => {enteredValue = null; operator = ''; notify();}}" bind:value={chosenProp}>
        <option value="" disabled selected>{$language === 'en' ? 'Choose property' : 'Property wählen'}</option>
        {#each props as prop}
            <option value={prop}>{prop.label[$language]}</option>
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
            {#if chosenProp.object === 'knora-api:DateValue'}
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
            {#if chosenProp.object === 'knora-api:ListValue'}

                <select bind:value={enteredValue} on:change={() => notify()}>
                    <option value="" disabled selected>{$language === 'en' ? 'Choose value to filter for' : 'Filterwert wählen'}</option>
                    {#each list as item}
                        <option value={item.id}>{item.label}</option> <!-- Currently these labels arent returned with multiple languages, which is why this isn't used here -->
                    {/each}
                </select>
            {/if}
            {#if chosenProp.object === 'knora-api:TextValue' || chosenProp.object === 'knora-api:IntValue'}
                <input placeholder="{$language === 'en' ? 'Enter search value' : 'Suchwert eingeben'}" bind:value={enteredValue} on:change={() => notify()}/>
            {/if}
            <!-- TODO: Support more types -->
        {/if}

    {#if operator && operator === 'Equals' && hasChild()}
        <ExpertSearchPropHelper on:message={notify} bind:this={child} props={getChildProps()} {resources} {ontology} {server} parentGravId={getPropGravId()}/>
    {/if}
    {#if parentGravId === '?mainres'}
    <button on:click={() => {setDeleted();notify();}}>X</button>
    {/if}
{/if}
