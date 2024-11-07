// license.js
d3.csv("license.csv").then(data => {
    // Parse numbers from strings and sort data by year
    data.forEach(d => {
        d.TIME_PERIOD = +d.TIME_PERIOD;
        d.OBS_VALUE = +d.OBS_VALUE;
    });
    data.sort((a, b) => a.TIME_PERIOD - b.TIME_PERIOD);

    // Calculate cumulative values by country and year
    const cumulativeData = {};
    data.forEach(d => {
        if (!cumulativeData[d.Country]) {
            cumulativeData[d.Country] = { [d.TIME_PERIOD]: d.OBS_VALUE };
        } else {
            // Add current value to the previous year's cumulative value
            cumulativeData[d.Country][d.TIME_PERIOD] = 
                (cumulativeData[d.Country][d.TIME_PERIOD - 1] || 0) + d.OBS_VALUE;
        }
    });

    // Update the data array to include cumulative values for each year
    data = data.map(d => ({
        ...d,
        CUMULATIVE_OBS_VALUE: cumulativeData[d.Country][d.TIME_PERIOD]
    }));

    // Set dimensions and margins
    const margin = { top: 50, right: 120, bottom: 50, left: 150 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Extract unique years and ensure sorting from 2018 onward
    const years = Array.from(new Set(data.map(d => d.TIME_PERIOD))).sort();
    const startYear = 2018;
    const startYearIndex = years.indexOf(startYear);

    // Define scales
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().range([0, height]).padding(0.2);
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    // Axes
    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("class", "x-axis");

    const yAxis = svg.append("g")
        .attr("class", "y-axis");

    // Text label to display the year
    const yearLabel = svg.append("text")
        .attr("class", "year-label")
        .attr("x", width - 60)
        .attr("y", height - 15)
        .attr("text-anchor", "end")
        .style("font-size", "36px")
        .style("font-weight", "bold")
        .style("opacity", 0.7);

    // Function to update chart for a given year with cumulative values
    function update(year) {
        const yearData = data
            .filter(d => d.TIME_PERIOD === year)
            .map(d => ({ ...d, OBS_VALUE: d.CUMULATIVE_OBS_VALUE }))
            .sort((a, b) => b.OBS_VALUE - a.OBS_VALUE)
            .slice(0, 10);  // Show only top 10 entries
    
        // Create a set of current countries for easy lookup
        const currentCountries = new Set(yearData.map(d => d.Country)); // Show only top 10 entries
        yearLabel.text(year);

        x.domain([0, d3.max(yearData, d => d.OBS_VALUE)]);
        y.domain(yearData.map(d => d.Country));

     

        // Animate the axes first
        xAxis.transition().duration(1000).ease(d3.easeCubicInOut).call(d3.axisBottom(x).ticks(5));
        yAxis.transition().duration(1000).ease(d3.easeCubicInOut).call(d3.axisLeft(y));

        // Bind data to bars
        const bars = svg.selectAll(".bar")
            .data(yearData, d => d.Country);

        // Enter new bars
        const barsEnter = bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.Country))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", 0) // Start with width 0 for animation effect
        .attr("fill", d => color(d.Country));

        bars.merge(barsEnter)
        .transition()
        .delay(1000)  // Delay bars animation until after axes animation
        .duration(2000)
        .ease(d3.easeCubicInOut)
        .attr("width", d => (currentCountries.has(d.Country) ? x(d.OBS_VALUE) : 0))
        .attr("y", d => y(d.Country));

        // Exit old bars
        bars.exit().remove();

        // Add/update labels for values
        const labels = svg.selectAll(".label")
            .data(yearData, d => d.Country);

        
    labels.enter()
    .append("text")
    .attr("class", "label")
    .attr("y", d => y(d.Country) + y.bandwidth() / 2 + 5)
    .attr("x", 0) // Start with x at 0 for animation effect
    .text(d => d3.format(",")(d.OBS_VALUE))
    .merge(labels)
    .transition()
    .delay(1000)  // Delay label animation until after axes animation
    .duration(2000)
    .ease(d3.easeCubicInOut)
    .attr("x", d => (currentCountries.has(d.Country) ? x(d.OBS_VALUE) + 8 : 0))
    .attr("y", d => y(d.Country) + y.bandwidth() / 2 + 5)
    .text(d => d3.format(",")(d.OBS_VALUE));

        labels.exit().remove();
    }

    // Initialize the animation to start with the 2018 data
    let yearIndex = startYearIndex;
    let interval;

    // Function to start the animation
    function startAnimation() {
        interval = setInterval(() => {
            yearIndex = (yearIndex + 1) % years.length;
            update(years[yearIndex]);
        }, 3000);
    }

    // Function to stop the animation
    function stopAnimation() {
        clearInterval(interval);
    }

    // Add event listeners to buttons
    document.getElementById("playButton").addEventListener("click", () => {
        stopAnimation();
        startAnimation();
    });

    document.getElementById("pauseButton").addEventListener("click", stopAnimation);

    // Start the animation with the 2018 data and initialize the axes and year label first
    update(years[yearIndex]);
    setTimeout(startAnimation, 1000);  // Delay start to give time for initial display
});
