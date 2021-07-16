<!--This component provides a image with clickable areas, where the different areas link to different urls (only urls on-->
<!--this app are supported)-->

<svg id="svg"></svg>

<script>
    import {onMount} from 'svelte';
    import {push} from 'svelte-spa-router';

    /** The areas and the image source provided by the json */
    export let areas, src;

    onMount(() => {
        let svg = document.getElementById('svg');
        let img = new Image();

        img.onload = function () { //need to use this function the get access to the precise height and width of the image
            svg.style.height = this.height;
            svg.style.width = this.width;
            const svgns = "http://www.w3.org/2000/svg";
            let svgImg = document.createElementNS(svgns, "image"); //creates the image
            svgImg.setAttribute("href", src);
            svgImg.setAttribute("width", this.width);
            svgImg.setAttribute("height", this.height);
            svg.appendChild(svgImg); //adds the image to the svg

            for (let rec of areas) { //for each area, adds a rectangle that is clickable and gets less opaque on hover
                let svgRec = document.createElementNS(svgns, "rect");
                svgRec.setAttribute("x", rec["left"]);
                svgRec.setAttribute("y", rec["top"]);
                svgRec.setAttribute("width", (rec["right"] - rec["left"]).toString());
                svgRec.setAttribute("height", (rec["bottom"] - rec["top"]).toString());
                svgRec.setAttribute("fill", "rgba(200, 0, 0, 0.3)");
                svgRec.addEventListener("mouseover", function (e) {
                    handleMouseOver(e);
                });
                svgRec.addEventListener("mouseout",
                    function (e) {
                        handleMouseOut(e);
                    });
                svgRec.addEventListener("click", function () {
                    handleClick(rec["link"]);
                });

                svg.appendChild(svgRec);
            }

        }

        img.src = src;
    });

    /**
     * TODO ???
     *
     * @param link
     */
    function handleClick(link) {
        push(link);
    }

    /**
     * Handles the mouse over over a rectangle
     *
     * @param e
     */
    function handleMouseOver(e) {
        e.target.style.fill = "rgba(200, 0, 0, 0.6)";
        e.target.style.cursor = "pointer";
    }

    /**
     * Handles the mouse out of of a rectangle
     *
     * @param e
     */
    function handleMouseOut(e) {
        e.target.style.fill = "rgba(200, 0, 0, 0.3)";
    }
</script>
