// Load the CSV data
d3.csv("license.csv").then(function(data) {
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

    // Create the dropdown for country selection
    const dropdown = d3.select("#country-select")
        .on("change", updateChart);

    dropdown.selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    // Define scales
    const xScale = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.4);

    const yScale = d3.scaleLinear()
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create a tooltip element
    const tooltip = d3.select("#tooltip");

    // Initial chart update for the first country
    updateChart();

    function updateChart() {
        const selectedCountry = dropdown.property("value");

        // Filter data for the selected country
        const countryData = data.filter(d => d.Country == selectedCountry);

        // Format data for stacking
        const yearData = years.map(year => {
            const yearMeasures = countryData.filter(d => d.TIME_PERIOD === year);
            const formattedData = { Year: year };
            yearMeasures.forEach(measure => {
                formattedData["OBS_VALUE"] = measure.OBS_VALUE || 0;
            });
            return formattedData;
        });

        const stack = d3.stack()
            .keys(["OBS_VALUE"])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        // Stack data for the selected country
        const series = stack(yearData);

        // Update yScale domain
        yScale.domain([0, d3.max(series, s => d3.max(s, d => d[1]))]);

        // Bind data and draw bars
        svg.selectAll(".layer").remove();

        const bars = svg.selectAll(".layer")
            .data(series);

        bars.enter().append("g")
            .attr("class", "layer")
            .attr("fill", d => colorScale(d.key))
            .selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.data.Year))
            .attr("y", d => yScale(d[1]))
            .attr("height", d => yScale(d[0]) - yScale(d[1]))
            .attr("width", xScale.bandwidth())
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 0.7);

                tooltip.transition().duration(200).style("opacity", 1);
                const value = d[1] - d[0];
                tooltip.html(`Year: ${d.data.Year}<br>Value: ${value}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1);

                tooltip.transition().duration(200).style("opacity", 0);
            });

        // Add axes
        svg.selectAll(".x-axis").remove();
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).tickSize(0));

        svg.selectAll(".y-axis").remove();
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale).ticks(10));
    }
});
