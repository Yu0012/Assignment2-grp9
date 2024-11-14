d3.csv("license.csv").then(data => {
    // Parse numbers from strings and sort data by year
    data.forEach(d => {
        d.TIME_PERIOD = +d.TIME_PERIOD;
        d.OBS_VALUE = +d.OBS_VALUE;
    });
    data.sort((a, b) => a.TIME_PERIOD - b.TIME_PERIOD);

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

    const years = Array.from(new Set(data.map(d => d.TIME_PERIOD))).sort();
    const startYear = 2018;
    const startYearIndex = years.indexOf(startYear);

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().range([0, height]).padding(0.2);
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("class", "x-axis");

    const yAxis = svg.append("g")
        .attr("class", "y-axis");

    const yearLabel = svg.append("text")
        .attr("class", "year-label")
        .attr("x", width - 60)
        .attr("y", height - 15)
        .attr("text-anchor", "end")
        .style("font-size", "36px")
        .style("font-weight", "bold")
        .style("opacity", 0.7);

    // Calculate cumulative data up to each year
    function getCumulativeData(upToYear) {
        const cumulativeData = {};
        data.forEach(d => {
            if (d.TIME_PERIOD <= upToYear) {
                cumulativeData[d.Country] = (cumulativeData[d.Country] || 0) + d.OBS_VALUE;
            }
        });
        return Object.entries(cumulativeData).map(([Country, OBS_VALUE]) => ({ Country, OBS_VALUE }))
               .sort((a, b) => b.OBS_VALUE - a.OBS_VALUE);
    }

    // Calculate total cumulative data from 2018-2022
    function getTotalCumulativeData() {
        return d3.rollups(
            data,
            v => d3.sum(v, d => d.OBS_VALUE),
            d => d.Country
        ).map(([Country, OBS_VALUE]) => ({ Country, OBS_VALUE }))
         .sort((a, b) => b.OBS_VALUE - a.OBS_VALUE);
    }

    // Function to get non-cumulative data for individual years
    function getYearData(year) {
        return data
            .filter(d => d.TIME_PERIOD === year)
            .sort((a, b) => b.OBS_VALUE - a.OBS_VALUE)
            .slice(0, 10); // Limit to top 10 entries
    }

    // Function to update chart for a given year or cumulative data
    function update(year, cumulative = false) {
        let yearData;
        if (year === "Total") {
            // Use total cumulative data across all years when "Total" is selected
            yearData = getTotalCumulativeData();
            yearLabel.text("Total (2018-2022)");
        } else if (cumulative) {
            // Cumulative data up to a specific year for animations
            yearData = getCumulativeData(year);
            yearLabel.text(`Cumulative (Up to ${year})`);
        } else {
            // Individual year data for non-cumulative update
            yearData = getYearData(year);
            yearLabel.text(year);
        }

        x.domain([0, d3.max(yearData, d => d.OBS_VALUE)]);
        y.domain(yearData.map(d => d.Country));

        xAxis.transition().duration(1000).ease(d3.easeCubicInOut).call(d3.axisBottom(x).ticks(5));
        yAxis.transition().duration(1000).ease(d3.easeCubicInOut).call(d3.axisLeft(y));

        const bars = svg.selectAll(".bar").data(yearData, d => d.Country);
        const barsEnter = bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("y", d => y(d.Country))
            .attr("height", y.bandwidth())
            .attr("x", 0)
            .attr("width", 0)
            .attr("fill", d => color(d.Country));

        bars.merge(barsEnter)
            .transition()
            .duration(2000)
            .attr("width", d => x(d.OBS_VALUE))
            .attr("y", d => y(d.Country));

        bars.exit().remove();

        const labels = svg.selectAll(".label").data(yearData, d => d.Country);

        labels.enter()
            .append("text")
            .attr("class", "label")
            .attr("y", d => y(d.Country) + y.bandwidth() / 2 + 5)
            .attr("x", 0)
            .text(d => d3.format(",")(d.OBS_VALUE))
            .merge(labels)
            .transition()
            .duration(2000)
            .attr("x", d => x(d.OBS_VALUE) + 8)
            .attr("y", d => y(d.Country) + y.bandwidth() / 2 + 5)
            .text(d => d3.format(",")(d.OBS_VALUE));

        labels.exit().remove();
    }

    let yearIndex = startYearIndex;
    let interval;

    // Function to start cumulative animation from 2018 to 2022
    function startCumulativeAnimation() {
        stopAnimation();  // Stop any previous animation
        yearIndex = startYearIndex;

        interval = setInterval(() => {
            const currentYear = years[yearIndex];
            update(currentYear, true);  // Cumulative update up to the current year

            yearIndex++;
            if (yearIndex >= years.length) {
                stopAnimation();  // Stop when reaching the last year
            }
        }, 3000);
    }

    function stopAnimation() {
        clearInterval(interval);
    }

    // Populate dropdown with years and a "Total" option
    const yearSelect = document.getElementById("yearSelect");
    const totalOption = document.createElement("option");
    totalOption.value = "Total";
    totalOption.textContent = "Total (2018-2022)";
    yearSelect.appendChild(totalOption);
    
    years.forEach(year => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    // Event listeners for dropdown and buttons
    yearSelect.addEventListener("change", function() {
        stopAnimation();
        const selectedYear = this.value === "Total" ? "Total" : +this.value;
        update(selectedYear);
    });

    document.getElementById("playButton").addEventListener("click", startCumulativeAnimation);
    document.getElementById("pauseButton").addEventListener("click", stopAnimation);

    // Initialize with the first year's data
    update(years[yearIndex]);
});
