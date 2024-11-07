// Load the CSV data
d3.csv("professional.csv").then(function(data) {
    // Set up chart dimensions
    const width = 900;
    const height = 400;
    const margin = { top: 50, right: 30, bottom: 50, left: 100 };

    // Create the SVG container
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add title
    svg.append("text")
        .attr("x", width / 2) // Center the title
        .attr("y", -20) // Position above the chart
        .attr("text-anchor", "middle") // Center align the text
        .style("font-size", "24px") // Set font size
        .style("font-weight", "bold") // Make the text bold
        .text("Professional Nursing Heatmap 2018-2022");

    // Draw a white background rectangle
    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .style("fill", "white") // Set fill color to white
        .style("stroke", "black") // Optional: Add a black border
        .style("stroke-width", 2); // Optional: Set border width

    // Extract unique years and countries
    const years = Array.from(new Set(data.map(d => d.TIME_PERIOD)))
        .sort((a, b) => d3.ascending(+a, +b));  // Sort years in ascending order
    const countries = Array.from(new Set(data.map(d => d.Country)));

    // Define scales
    const xScale = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.05);

    const yScale = d3.scaleBand()
        .domain(countries)
        .range([0, height])
        .padding(0.05);

    // Function to generate random colors
    function randomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Create a color scale for each country
    const colorScale = d3.scaleOrdinal()
        .domain(countries)
        .range(countries.map(() => randomColor()));

    // Create a tooltip element
    const tooltip = d3.select("#tooltip");

    // Draw the heatmap rectangles with initial opacity
    svg.selectAll(".heatmap-rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "heatmap-rect")
        .attr("x", d => xScale(d.TIME_PERIOD))
        .attr("y", d => yScale(d.Country))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.Country)) // Use country-specific color
        .style("opacity", 0) // Start with opacity 0 for animation
        .transition() // Add transition for opacity
        .duration(1000) // Duration of 1 second
        .style("opacity", 1); // Fade in to full opacity

    // Mouseover event for interaction
    svg.selectAll(".heatmap-rect")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition() // Animate fill color change
                .duration(200)
                .attr("fill", "orange") // Change to orange on hover
        
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Country: ${d.Country}<br>Year: ${d.TIME_PERIOD}<br>Value: ${+d.OBS_VALUE}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        
            // Update the info box with the current year, country, and value
            d3.select("#year-name").text(`Year: ${d.TIME_PERIOD}`);
            d3.select("#country-name").text(`Country: ${d.Country}`);
            d3.select("#value-name").text(`Value: ${+d.OBS_VALUE}`); // Add this line
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition() // Reset fill color
                .duration(200)
                .attr("fill", d => colorScale(d.Country)); // Reset to original color
        
            tooltip.transition().duration(200).style("opacity", 0);
        });

    // Add x-axis (TIME_PERIOD)
    const xAxis = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    // Style x-axis text
    xAxis.selectAll("text")
        .style("font-size", "14px") // Set font size for years
        .style("fill", "black") // Set text color to black for visibility
        .style("font-weight", "bold"); // Make the text bold

    // Add y-axis (Country)
    const yAxis = svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));

    // Style y-axis text
    yAxis.selectAll("text")
        .style("font-size", "14px") // Set font size for country names
        .style("fill", "black") // Set text color to black for visibility
        .style("font-weight", "bold"); // Make the text bold
});
