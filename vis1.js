function init() {
    var w = 600, h = 300;
    var margin = { top: 20, right: 30, bottom: 40, left: 60 };

    d3.csv("ng.csv").then(data => {
        data = data.map(d => ({
            Country: d.Country,
            Year: +d.Year,  // Convert Year to number
            Number: +d.Number  // Convert Number to number
        }));

        // Extract unique countries
        var countries = [...new Set(data.map(d => d.Country))];

        // Populate dropdown
        var dropdown = d3.select("#countryDropdown");
        dropdown.selectAll("option")
            .data(countries)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d);

        var svg = d3.select("#chart").append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("viewBox", [0, 0, w, h]);

        var xScale = d3.scaleBand().range([margin.left, w - margin.right]).padding(0.1);
        var yScale = d3.scaleLinear().range([h - margin.bottom, margin.top]);

        var xAxis = svg.append("g")
            .attr("transform", `translate(0,${h - margin.bottom})`)
            .attr("class", "x-axis");

        var yAxis = svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .attr("class", "y-axis");

        var color = d3.scaleOrdinal(d3.schemeCategory10);
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background-color", "#fff")
            .style("border", "1px solid #ccc")
            .style("padding", "10px")
            .style("visibility", "hidden");

        function updateChart(country) {
            var filteredData = data.filter(d => d.Country === country);

            if (filteredData.length === 0) {
                console.error("No data found for the selected country:", country);
                return;
            }

            xScale.domain(filteredData.map(d => d.Year));
            yScale.domain([0, d3.max(filteredData, d => d.Number)]);

            var bars = svg.selectAll(".bar")
                .data(filteredData, d => d.Year);

            bars.exit().remove();

            bars.enter()
                .append("rect")
                .attr("class", "bar")
                .merge(bars)
                .attr("x", d => xScale(d.Year))
                .attr("y", d => yScale(d.Number))
                .attr("width", xScale.bandwidth())
                .attr("height", d => h - margin.bottom - yScale(d.Number))
                .attr("fill", d => color(country))
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("opacity", 0.7);
                    tooltip.style("visibility", "visible").html(`Year: ${d.Year}<br>Number: ${d.Number}`);
                })
                .on("mousemove", function(event) {
                    tooltip.style("top", (event.pageY - 10) + "px")
                           .style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", function() {
                    d3.select(this).attr("opacity", 1);
                    tooltip.style("visibility", "hidden");
                });

            xAxis.call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
            yAxis.call(d3.axisLeft(yScale));
        }

        // Initialize chart with the first country
        updateChart(countries[0]);

        // Update chart when dropdown selection changes
        dropdown.on("change", function() {
            var selectedCountry = d3.select(this).property("value");
            updateChart(selectedCountry);
        });
    });
}

window.onload = init;
