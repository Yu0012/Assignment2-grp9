// Load the CSV data
d3.csv("practice.csv").then(function(data) {
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

    // Define scales with increased Y-axis range
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.TIME_PERIOD))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.OBS_VALUE) * 1.0])  // Increase Y max by 70%
        .range([height, 0]);

    // Define color scale for countries
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(countries);

    // Group the data by country
    const countryData = countries.map(country => {
        return {
            name: country,
            values: data.filter(d => d.Country === country).map(d => ({
                TIME_PERIOD: +d.TIME_PERIOD,
                OBS_VALUE: +d.OBS_VALUE
            }))
        };
    });

    // Define the line generator
    const line = d3.line()
        .x(d => xScale(d.TIME_PERIOD))
        .y(d => yScale(d.OBS_VALUE))
        .curve(d3.curveMonotoneX);  // For smooth curves

    // Add the lines for each country
    svg.selectAll(".line")
        .data(countryData)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", d => line(d.values))
        .attr("fill", "none")
        .attr("stroke", d => colorScale(d.name))
        .attr("stroke-width", 2);

    // Add dots to mark the points on the lines, now positioned exactly at the line points
    svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.TIME_PERIOD))
        .attr("cy", d => yScale(+d.OBS_VALUE))  // No more random offset; match line exactly
        .attr("r", 5)  // Dot size
        .attr("fill", d => colorScale(d.Country))
        .on("mouseover", function(event, d) {
            d3.select(this).transition().duration(200).attr("r", 7);

            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Country: ${d.Country}<br>Year: ${d.TIME_PERIOD}<br>Value: ${d.OBS_VALUE}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).transition().duration(200).attr("r", 5);
            tooltip.transition().duration(200).style("opacity", 0);
        });

    // Create a tooltip element
    const tooltip = d3.select("#tooltip");

    // Add x-axis with Year ticks
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(5));

    // Add y-axis
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(10));
});
