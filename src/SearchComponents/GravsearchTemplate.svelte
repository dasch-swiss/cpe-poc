<!--This component takes a query template and some parameters as argument. It provides input fields where -->
<!--the parameters of the query can be adjusted before they are sent. TODO: This is still work in progress. -->
<script>
    import {language} from "../store.js";

    /** The template and the parameters given by the json */
    export let template, parameters;

    export let server;

     /** Stores the values and sets all the values to ''. */
    let params = {};

    for (const p of parameters){
        params[p] = '';
    }

    let search = '';

    /**
     * TODO: This function needs to be replaced with a function that hands the query to a viewer.
     */
    async function fireQuery() {
        const res = await fetch( 'https://' + server + '/v2/searchextended', {
            method: 'POST',
            body: compile()

        })
        const json = await res.json()
        console.log(json)
    }

    /**
     * Compiles the gravsearch from the template and puts the parameters as provided.
     */
    function compile() {
        const Status = { COPY: 0, INWATCH: 1, OUTWATCH: 2, INSIDE: 3 };
        for (const p of parameters){
            params[p] = document.getElementById("ipfield" + p).value; //as it can not be known what the parameters are called and how many they are, we have to use this hack.
        }
        let output = '';
        let status = Status.COPY;
        let token = '';
        let skip = false;
        for (const c of template) {
            if (status === Status.COPY) {
                if (c === '{') {
                    status = Status.INWATCH;
                } else {
                    if (!skip) { output += c; }
                }
            } else if (status === Status.INWATCH) {
                if (c === '{') {
                    status = Status.INSIDE;
                } else {
                    status = Status.COPY;
                    if (!skip) { output += '{' + c; }
                }
            } else if (status === Status.INSIDE) {
                if (c === '}') {
                    status = Status.OUTWATCH;
                } else {
                    token += c;
                }
            } else if (status === Status.OUTWATCH) {
                if (c === '}') {
                    status = Status.COPY;
                    token = token.trim();
                    // Process token here!!!!
                    if (token.charAt(0) === '#') {
                        const parts = token.split(/\s+/);
                        if (parts[0] === '#if') {
                            skip = !params.hasOwnProperty(parts[1]);
                        } else if (parts[0] === '#else') {
                            skip = !skip;
                        } else if (parts[0] === '#endif') {
                            skip = false;
                        } else {
                            // TODO: issue error
                        }
                    } else {
                        if (params.hasOwnProperty(token)) {
                            output += params[token];
                        }
                    }
                    token = '';
                } else {
                    token += '}' + c;
                }
            }
        }
        search = output;
        console.log(output);
    }
</script>

{#each parameters as p}
    <input id={"ipfield" + p} placeholder="{$language === 'en' ? 'Enter search value for ': 'Suchwert eingeben für ' }{p}"/>
{/each}
<button on:click={fireQuery}>Search</button>
