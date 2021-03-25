<script>
import SearchField from './SearchField.svelte'
export let vals = {};
export let form;
function prepValArray() {
    for (const prop of form['TextProps']){
        vals[prop['propName']] = ""
    }
}
function getFilter(propName) {
    const val = vals[propName];
    const tag = '?' + propName.replace(':', '');
    return tag + ' knora-api:valueAsString ' + tag + 'Str .\n' + 'FILTER regex(' + tag + 'Str, "' + val + '", "i") .\n';
}
function getPropString(prop) {
    let toReturn = '';
    if ("linkedVia" in prop) {
        if (prop['linkedVia'].indexOf('$INCOMING$') === -1){
            toReturn += '?mainres ' + prop['linkedVia'] + ' ?' + prop["propName"].replace(':', '') + 'Link' + ' .\n' +
                '?' + prop["propName"].replace(':', '') + 'Link' +  ' ' + prop['propName'] + ' ?' + prop['propName'].replace(':', '') + ' .\n';
        }
        else {
            toReturn += '?' + prop["propName"].replace(':', '') + 'Link' + ' ' +  prop['linkedVia'].replace('$INCOMING$', '') + ' ?mainres' + ' .\n' +
                '?' + prop["propName"].replace(':', '') + 'Link' + ' ' + prop['propName'] + ' ?' + prop['propName'].replace(':', '') + ' .\n';
        }
    }
    else {
        toReturn += '?mainres ' + prop['propName'] + ' ?' + prop['propName'].replace(':', '') + ' .\n';
    }
    return toReturn;
}
function createQuery() {
    let toReturn = 'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>\n' +
        'PREFIX tdk: <http://api.0805-test-server.dasch.swiss/ontology/0805/tdk_onto/v2#>\n' +
        'PREFIX knora-api-simple: <http://api.knora.org/ontology/knora-api/simple/v2#>\n' +
        'CONSTRUCT {\n' +
        '?mainres knora-api:isMainResource true .\n';
    for (const prop of form['TextProps']){
        toReturn += getPropString(prop);
    }
    toReturn += '} WHERE {\n?mainres a knora-api:Resource .\n?mainres a ' + form['ResName'] + ' .\n'
    for (const prop of form['TextProps']){
        if (vals[prop["propName"]] === '') {
            toReturn += 'OPTIONAL {\n';
            toReturn += getPropString(prop);
            toReturn += '}\n';
        }
        else {
            toReturn += getPropString(prop);
            toReturn += getFilter(prop['propName'], prop['label'])
        }

    }
    toReturn += '}'
    console.log(toReturn);
    return toReturn;
}
async function fireQuery(){
    console.log('Fired')
    const res = await fetch('https://api.0805-test-server.dasch.swiss/v2/searchextended', {
    method: 'POST',
    body: createQuery()

})
    const json = await res.json()
    console.log(json)
}
async function search(){
    await fireQuery(createQuery());
}
prepValArray()
</script>

<main>
    <h1>Search for {form['ResLabel']}</h1>
    {#each form['TextProps'] as prop}
        <SearchField bind:value={vals[prop['propName']]} label="{prop['label']} "/>
    {/each}
    <button on:click={search}>Search</button>
</main>