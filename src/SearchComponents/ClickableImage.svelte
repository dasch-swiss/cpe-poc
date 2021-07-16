<!-- This component receives the source of the image and the link to navigate after click from the json parser. -->
<script>
    import {push} from 'svelte-spa-router'

    /** Source of the image, for local image files, put it in the public/img folder and link it with img/filename */
    export let src;

    /** Url to the new page, only support urls of this app, no external links */
    export let link;
</script>

<img {src} on:click={push(link)}/>
