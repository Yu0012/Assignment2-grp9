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

    // Extract unique years and countries
    const years = Array.from(new Set(data.map(d => d.TIME_PERIOD)));
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

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(data, d => +d.OBS_VALUE)]);

    // Create a tooltip element
    const tooltip = d3.select("#tooltip");

    // Draw the heatmap rectangles
    svg.selectAll(".heatmap-rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "heatmap-rect")
        .attr("x", d => xScale(d.TIME_PERIOD))
        .attr("y", d => yScale(d.Country))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(+d.OBS_VALUE))
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", d3.interpolateBlues(0.7));

            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Country: ${d.Country}<br>Year: ${d.TIME_PERIOD}<br>Value: ${+d.OBS_VALUE}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", d => colorScale(+d.OBS_VALUE));

            tooltip.transition().duration(200).style("opacity", 0);
        });

    // Add x-axis (TIME_PERIOD)
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis (Country)
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));
});
