<script>
    console.log("viewer");

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
