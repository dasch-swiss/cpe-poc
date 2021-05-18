<script>
    import {getLabelForProp} from "../dsp-services";

    export let value;
    export let prop;
    export let shortName;
    import {language} from '../store.js'

    /*
        This function return the gravsearch string that references this value. It takes into account whether its a property of the main resource or if the main resource is linked.
        @return: the gravsearch string
    */
    export function getPropString() {
        let toReturn = '';
        if ("linkedVia" in prop) { // this means that this property is not a property of the main resource but rather linked in some way.
            if (prop['linkedVia'].indexOf('$INCOMING$') !== -1) { // if this key word is in found in the linkedvia string, we know that it is referenced via an incoming link to the main resource, therefore the order of arguments changes in the gravsearchstring.

                toReturn += '?' + prop["propName"] + 'Link' + ' ' + shortName + ':' + prop['linkedVia'].replace('$INCOMING$', '') + ' ?mainres' + ' .\n' + //references the Linked resource.
                    '?' + prop["propName"] + 'Link' + ' ' + shortName + ':' + prop['propName'] + ' ?' + prop['propName'] + ' .\n'; //references the property
            } else {
                toReturn += '?mainres ' + shortName + ':' + prop['linkedVia'] + ' ?' + prop["propName"] + 'Link' + ' .\n' +
                    '?' + prop["propName"] + 'Link' + ' ' + shortName + ':' + prop['propName'] + ' ?' + prop['propName'] + ' .\n';
            }
        } else {
            toReturn += '?mainres ' + shortName + ':' + prop['propName'] + ' ?' + prop['propName'] + ' .\n';
        }
        return toReturn;
    }

    /*
       A helper function to create the query when the search needs to be fired. Returns the filter string. Currently only
       supports text properties.


       @propName: the name of the property to create the filter form
       @return: returns the filter string
    */
    export function getFilter() {
        const tag = '?' + prop['propName'];
        return tag + ' knora-api:valueAsString ' + tag + 'Str .\n' + 'FILTER regex(' + tag + 'Str, "' + value + '", "i") .\n';
    }

    export function isEmpty() {
        return value === "";
    }
    let promise = getLabelForProp(prop['propName']);
</script>
{#await promise}
    {:then propLabel}
    <p>{$language === 'en' ? "Enter search value for" : "Suchwert eingeben für" } {propLabel[$language]}</p>
{/await}
<input bind:value={value}>
