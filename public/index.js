const inpFile = document.getElementById("inpFile");
const inpBtn = document.getElementById("inpBtn");
const freqTextarea = document.getElementById("freq");

// Assuming you have a variable 'g' for the SVG container
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var simulation = d3.forceSimulation()
    .force("collide", d3.forceCollide(25).iterations(5));

// Create a tooltip
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

inpBtn.addEventListener("click", () => {
    const formData = new FormData();
    formData.append("pdfFile", inpFile.files[0]);

    // Show loading indicator
    svg.append("text")
        .attr("class", "loading-text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .text("Processing...");

    fetch("/extract-text", {
        method: "post",
        body: formData
    }).then(response => {
        return response.json(); // Assuming the server returns JSON
    }).then(extText => {
        // Remove loading indicator
        svg.select(".loading-text").remove();

        console.log(extText);

        // Sort the words based on frequency in descending order
        const sortedWords = extText.words.sort((a, b) => b.freq - a.freq);

        // Take only the top 50 words
        const top50Words = sortedWords.slice(0, 100);
        console.log(top50Words);
        // Normalize bubble sizes using a linear scale
        var sizeScale = d3.scaleLinear()
            .domain([0, d3.max(top50Words, d => d.freq)])
            .range([5, 30]); // Adjust the range as needed

        // Initialize bubbles
        var bubbles = svg.selectAll(".bubble")
            .data(top50Words)
            .enter().append("circle")
            .attr("class", "bubble")
            .attr("r", d => sizeScale(d.freq))
            .attr("fill", d => d.color)
            .on("mouseover", (event, d) => handleBubbleClick(d));

        simulation.nodes(top50Words)
            .on("tick", ticked);

        function ticked() {
            bubbles.attr("cx", d => width / 2 + d.x)
                .attr("cy", d => height / 2 + d.y);
        }

        // Use forceRadial to spread bubbles radially
        var radialScale = d3.scaleLinear()
            .domain([0, top50Words.length])
            .range([0, Math.min(width, height) / 2]);

        simulation.force("radial", d3.forceRadial(d => radialScale(d.index)));

        simulation.alpha(1).restart(); // Restart simulation

        // function handleBubbleClick(d) {
        //     console.log("Clicked bubble:", d);

        //     const tooltipWidth = tooltip.node().offsetWidth;
        //     const tooltipHeight = tooltip.node().offsetHeight;

        //     const offsetX = 300; // Adjust this value to move the tooltip more to the right

        //     tooltip.transition()
        //         .duration(200)
        //         .style("opacity", 0.9);

        //     tooltip.html(`${d.source} (Freq: ${d.freq})`)
        //         .style("left", (width / 2 + d.x + offsetX - tooltipWidth / 2) + "px")  // Adjusting left position
        //         .style("top", (height / 2 + d.y - tooltipHeight / 2) + "px");  // Keeping the top position unchanged
        // }

        function handleBubbleClick(d) {
            console.log("Clicked bubble:", d);
        
            const tooltipWidth = tooltip.node().offsetWidth;
            const tooltipHeight = tooltip.node().offsetHeight;
        
            const offsetX = 40; // Adjust this value to fine-tune the tooltip's horizontal position
            const offsetY = 0; // Adjust this value to fine-tune the tooltip's vertical position
        
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
        
            tooltip.html(`${d.source} (Freq: ${d.freq})`)
                .style("transform", `translate(${width / 2 + d.x + offsetX}px, ${height / 2 + d.y + offsetY}px)`)
                .style("left", 0) // Reset the left property
                .style("top", 0); // Reset the top property
        }
        

    }).catch(error => {
        console.error('Error fetching data:', error);
        // Remove loading indicator in case of an error
        svg.select(".loading-text").remove();
    });
});
