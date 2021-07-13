<svg id="svg"></svg>
<script>
    import {onMount} from 'svelte';
    import {push} from 'svelte-spa-router';

    export let areas, src;

    onMount(() => {
        let svg = document.getElementById('svg');
        let img = new Image();

        img.onload = function () {
            svg.style.height = this.height;
            svg.style.width = this.width;
            const svgns = "http://www.w3.org/2000/svg";
            let svgImg = document.createElementNS(svgns, "image");
            svgImg.setAttribute("href", src);
            svgImg.setAttribute("width", this.width);
            svgImg.setAttribute("height", this.height);
            svg.appendChild(svgImg);
            for (let rec of areas) {
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

    function handleClick(link) {
        push(link);
    }

    function handleMouseOver(e) {
        e.target.style.fill = "rgba(200, 0, 0, 0.6)";
        e.target.style.cursor = "pointer";
    }

    function handleMouseOut(e) {
        e.target.style.fill = "rgba(200, 0, 0, 0.3)";
    }
</script>
