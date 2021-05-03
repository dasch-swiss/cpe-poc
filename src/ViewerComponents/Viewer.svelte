<script>
    import * as json_file from './read_data.json'

    console.log("viewer", json_file);

    async function ontologyRequest() {
        const res = await fetch("https://api.0826-test-server.dasch.swiss/ontology/0826/teimww/simple/v2");

        const json = await res.json();
        console.log(json);
    }

    async function resourceRequest() {
        // const res = await fetch(json_file["URL"], {mode: 'no-cors'});
        const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJLbm9yYSIsInN1YiI6Imh0dHA6Ly9yZGZoLmNoL3VzZXJzL3Jvb3QiLCJhdWQiOlsiS25vcmEiLCJTaXBpIl0sImV4cCI6MTYyMjM4NDMxMywiaWF0IjoxNjE5NzkyMzEzLCJqdGkiOiJnQUtDdzV5eVN2dXhrZm84alFMTzlBIn0.19v739FpqeCS5ybGhOPMZIGxHpWxh0EbiTRHCmXBjaA";
        const res = await fetch(`https://api.0826-test-server.dasch.swiss/v2/resources/${encodeURIComponent(json_file["URL"])}`, {
            headers: new Headers({
                'Authorization': `Bearer ${token}`
                // 'Content-Type': 'application/x-www-form-urlencoded'
            })
        });

        const json = await res.json();
        console.log(json);
    }
</script>

<main>
    <h1>Viewer Component</h1>
    <button on:click={ontologyRequest}>Ontology</button>
    <button on:click={resourceRequest}>Resource</button>
</main>
