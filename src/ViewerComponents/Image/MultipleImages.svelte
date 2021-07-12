<script>
    import {onMount} from 'svelte';
    import {Image} from '../model';

    export let results;
    const square_size = 150;
    const image_size = 700;
    let error = false;
    let allImages = [];
    let openedImageID;

    /**
     * Checks if result have certain properties and saves the images.
     */
    onMount(() => {
        if (checkResult(results)) {
            console.log(results);
            allImages = addImages(results);
        } else {
            error = true;
        }
    })

    /**
     * Checks if the results have certain properties, so the images can be displayed.
     *
     * @param results
     * @returns {boolean}
     */
    function checkResult(results) {
        if (results && Array.isArray(results)) {
            return results.every(obj => obj['knora-api:hasStillImageFileValue']);
        } else {
            return false;
        }
    }

    /**
     * Converts every element from the results into a image object and is added to an array.
     *
     * @param images
     * @returns {Image[]}
     */
    function addImages(images) {
        return [...images.map(image => convertImageObj(image))];
    }

    /**
     * Converts a object from result into an image object.
     *
     * @param image
     * @returns {Image}
     */
    function convertImageObj(image) {
        const url = `${image['knora-api:hasStillImageFileValue']['knora-api:stillImageFileValueHasIIIFBaseUrl']['@value']}/${image['knora-api:hasStillImageFileValue']['knora-api:fileValueHasFilename']}`;

        return new Image(
            image['@id'],
            url,
            image['knora-api:hasStillImageFileValue']['knora-api:stillImageFileValueHasDimX'],
            image['knora-api:hasStillImageFileValue']['knora-api:stillImageFileValueHasDimY']);
    }

    /**
     * Builds the iiif url with square image and a custom size.
     *
     * @param url
     * @param size
     * @returns {string}
     */
    function getIIIfSquareURL(url, size) {
        return `${url}/square/${size},/0/default.jpg`;
    }

    /**
     * Builds the iiif url with full image and a custom size.
     *
     * @param url
     * @param size
     * @returns {string}
     */
    function getIIIfFullURL(url, size) {
        return `${url}/full/${size},/0/default.jpg`;
    }

    /**
     * Lays an overlay where the image is shown in bigger resolution.
     *
     * @param img
     */
    function openImageOverlay(img) {
        console.log('Clicked on image', getIIIfFullURL(img['url'], image_size));
        const clicked = document.getElementById('overlay-container');
        const imgDisplay = document.getElementById('full-image');
        imgDisplay.src = getIIIfFullURL(img['url'], image_size);
        clicked.style.display = 'block';
        openedImageID = img['id'];
    }

    /**
     * Closes the overlay with the image.
     */
    function closeImageOverlay() {
        const clicked = document.getElementById('overlay-container');
        clicked.style.display = 'none';
        openedImageID = null;
    }

    /**
     * TODO Opens/redirect to the image to a seperate page/window where image and its property is shown
     */
    function openFullImage() {
        console.log('Open single image', openedImageID);
    }
</script>

<section>
    {#if allImages.length > 0}
        <div class="images-container" style="--size: {square_size}px">
            {#each allImages as img, i}
                <img on:click={() => openImageOverlay(img)}
                     class="small-image"
                     src="{getIIIfSquareURL(img['url'], square_size)}"
                     alt="result image number {i + 1}">
            {/each}
        </div>
        <div id="overlay-container">
            <div class="full-image-container" style="--full-size: {image_size}px">
                <div class="close" on:click={closeImageOverlay}>&times;</div>
                <img id="full-image"on:click={() => openFullImage()} alt="detail of clicked image">
                <div class="detail-text">Click for details</div>
            </div>
        </div>
    {:else }
        <div>No Results</div>
    {/if}
</section>


<style>
    section {
        margin: 1rem 0;
    }

    .images-container {
        margin-top: 1rem;
        margin-bottom: 1rem;
        display: grid;
        justify-content: center;
        /*grid-template-columns: repeat(auto-fill, minmax(150px, 150px));*/
        grid-template-columns: repeat(auto-fill, minmax(var(--size), var(--size)));
        gap: 1rem;
    }

    .small-image {
        opacity: 1;
        -webkit-transition: .3s ease-in-out;
        transition: .3s ease-in-out;
    }

    .small-image:hover {
        opacity: .5;
        cursor: pointer;
    }

    #overlay-container {
        display: none;
        position: fixed;
        z-index: 1;
        /*padding: 5%;*/
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        /*overflow: auto;*/
        background-color: rgba(0, 0, 0, 0.8);
    }

    .full-image-container {
        width: 80%;
        margin: auto;
        max-width: var(--full-size);
    }

    .close {
        color: #f1f1f1;
        font-size: 30px;
        font-weight: bold;
        text-align: right;
    }

    .close:hover, .close:focus, .detail-text:hover, .detail-text:focus {
        color: #bbb;
        text-decoration: none;
        cursor: pointer
    }

    #full-image {
        display: block;
        width: 100%;
        height: auto;
    }

    .detail-text {
        color: #f1f1f1;
        margin: 0.5rem;
        text-align: center;
    }
</style>
