<script>
    import * as json_file from './read_data.json'

    console.log("viewer", json_file);

    async function request() {
        const res = await fetch("https://api.0826-test-server.dasch.swiss/ontology/0826/teimww/simple/v2");

        const json = await res.json();
        console.log(json);
    }
</script>

<main>
    <h1>Viewer Component</h1>
    <button on:click={request}>Request</button>
</main>
