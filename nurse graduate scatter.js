// Load the CSV data
d3.csv("ng.csv").then(function(data) {
    // Set up chart dimensions
    const width = 900;
    const height = 400;
    const margin = { top: 50, right: 30, bottom: 50, left: 60 };

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
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.TIME_PERIOD))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.OBS_VALUE)])
        .range([height, 0]);

    // Define color scale for countries
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(countries);

    // Create a tooltip element
    const tooltip = d3.select("#tooltip");

    // Bind data and draw dots
    svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.TIME_PERIOD))
        .attr("cy", d => yScale(+d.OBS_VALUE))
        .attr("r", 6)
        .attr("fill", d => colorScale(d.Country));  // Color by country

    // Create an invisible hit area to prevent shaking/flickering
    svg.selectAll(".hitbox")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "hitbox")
        .attr("cx", d => xScale(d.TIME_PERIOD))
        .attr("cy", d => yScale(+d.OBS_VALUE))
        .attr("r", 12)  // Larger invisible circle for better hover behavior
        .style("fill", "transparent")
        .on("mouseover", function(event, d) {
            // Show tooltip with Year, Value, and Country
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Year: ${d.TIME_PERIOD}<br>Value: ${+d.OBS_VALUE}<br>Country: ${d.Country}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            // Hide tooltip
            tooltip.transition().duration(200).style("opacity", 0);
        });

    // Add x-axis with Year ticks (same as before)
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(years.length));

    // Add y-axis (same as before)
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(10));
});
