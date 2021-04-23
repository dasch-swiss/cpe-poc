<script>
    export let value;
    export let prop;
    import {language} from '../store.js'

    /*
        This function return the gravsearch string that references this value. It takes into account whether its a property of the main resource or if the main resource is linked.
        @return: the gravsearch string
    */
    export function getPropString() {
        let toReturn = '';
        if ("linkedVia" in prop) { // this means that this property is not a property of the main resource but rather linked in some way.
            if (prop['linkedVia'].indexOf('$INCOMING$') !== -1) { // if this key word is in found in the linkedvia string, we know that it is referenced via an incoming link to the main resource, therefore the order of arguments changes in the gravsearchstring.

                toReturn += '?' + prop["propName"].replace(':', '') + 'Link' + ' ' + prop['linkedVia'].replace('$INCOMING$', '') + ' ?mainres' + ' .\n' + //references the Linked resource.
                    '?' + prop["propName"].replace(':', '') + 'Link' + ' ' + prop['propName'] + ' ?' + prop['propName'].replace(':', '') + ' .\n'; //references the property
            } else {
                toReturn += '?mainres ' + prop['linkedVia'] + ' ?' + prop["propName"].replace(':', '') + 'Link' + ' .\n' +
                    '?' + prop["propName"].replace(':', '') + 'Link' + ' ' + prop['propName'] + ' ?' + prop['propName'].replace(':', '') + ' .\n';
            }
        } else {
            toReturn += '?mainres ' + prop['propName'] + ' ?' + prop['propName'].replace(':', '') + ' .\n';
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
        const tag = '?' + prop['propName'].replace(':', '');
        return tag + ' knora-api:valueAsString ' + tag + 'Str .\n' + 'FILTER regex(' + tag + 'Str, "' + value + '", "i") .\n';
    }

    export function isEmpty() {
        return value === "";
    }
</script>
<p>{$language === 'en' ? "Enter search value for" : "Suchwert eingeben für" } {prop['label'][$language]}</p>
<input bind:value={value}>