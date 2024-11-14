document.addEventListener("DOMContentLoaded", function() {
  const width = 1200;
  const height = 600;

  // Tooltip styling and setup
  const tooltip = d3.select("#tooltip")
    .style("position", "absolute")
    .style("padding", "8px")
    .style("background", "white")
    .style("border", "1px solid #333")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  const projection = d3.geoMercator().scale(180).translate([width / 2, height / 1.5]);
  const path = d3.geoPath().projection(projection);

  const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g");

  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

  svg.call(zoom);
  svg.on("dblclick.zoom", null);

  function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  Promise.all([
    d3.csv("map.csv"),
    d3.json("world.geojson")
  ]).then(([csvData, geoData]) => {
    const dataMap = {};
    csvData.forEach(d => {
      dataMap[d.country.toLowerCase().trim()] = +d.value;
    });

    g.selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", (d) => {
        const countryName = d.properties.name.toLowerCase().trim();
        const value = dataMap[countryName];
        return value !== undefined ? getRandomColor() : "#eee";
      })
      .attr("stroke", "#222")
      .attr("stroke-width", 0.7)
      .each(function(d) {
        d3.select(this).attr("data-original-color", d3.select(this).attr("fill"));
      })
      .on("mouseover", function(event, d) {
        const countryName = d.properties.name;
        const value = dataMap[countryName.toLowerCase().trim()];

        if (value !== undefined) {
          d3.select(this).attr("fill", "#ff6f61");
        }

        // Update info box content and show it
        d3.select("#country-name").text(`Country: ${countryName}`);
        d3.select("#value-name").text(`Value: ${value !== undefined ? value : "No data"}`);
        d3.select(".info-box").style("display", "block");

        // Show tooltip near cursor
        tooltip
          .style("opacity", 1)
          .html(`<strong>${countryName}</strong><br>Value: ${value !== undefined ? value : "No data"}`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill", d3.select(this).attr("data-original-color"));

        tooltip.style("opacity", 0);
        d3.select(".info-box").style("display", "none");
        d3.select("#country-name").text("Country: ");
        d3.select("#value-name").text("Value: ");
      });
  }).catch(error => {
    console.error("Error loading the data:", error);
  });
});
