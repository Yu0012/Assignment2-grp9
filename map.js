// Set up dimensions for the smaller map
const width = 800;
const height = 400;

// Select the tooltip and set its initial styling
const tooltip = d3.select("#tooltip")
  .style("position", "absolute")
  .style("padding", "8px")
  .style("background", "white")
  .style("border", "1px solid #333")
  .style("border-radius", "4px")
  .style("pointer-events", "none")
  .style("opacity", 0); // Hidden by default

// Set up the projection and path generator for a smaller scale map
const projection = d3.geoMercator().scale(130).translate([width / 2, height / 1.5]);
const path = d3.geoPath().projection(projection);

// Create an SVG element and append it to the map div
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Define color scale
const colorScale = d3.scaleSequential(d3.interpolateOranges).domain([0, 500]);

// Load both the CSV data and the GeoJSON file
Promise.all([
  d3.csv("map.csv"),
  d3.json("world.geojson")
]).then(([csvData, geoData]) => {
  
  // Convert the CSV data into a lookup object for easy access
  const dataMap = {};
  csvData.forEach(d => {
    dataMap[d.country.toLowerCase().trim()] = +d.value;  // Convert value to a number
  });

  // Filter out countries without data
  const filteredFeatures = geoData.features.filter(d => {
    const countryName = d.properties.name.toLowerCase().trim();
    return dataMap[countryName] !== undefined; // Only include countries with values
  });

  // Define a color scale for countries with data
  const colorScale = d3.scaleOrdinal(d3.schemeSet3.concat(d3.schemePaired))
    .domain(filteredFeatures.map(d => d.properties.name));

  // Draw the map using only countries with data
  svg.selectAll("path")
    .data(filteredFeatures)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", (d) => colorScale(d.properties.name)) 
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5)
    
    .on("mouseover", (event, d) => {
        const countryName = d.properties.name;
        const value = dataMap[countryName.toLowerCase().trim()];
        
        // Update the info box content
        d3.select("#country-name").text(`Country: ${countryName}`);
        d3.select("#value-name").text(`Value: ${value}`);
        
        // Display tooltip with country name and value
        tooltip.style("opacity", 1)
               .html(`<strong>${countryName}</strong><br>Value: ${value}`);
    })
    .on("mousemove", (event) => {
      // Position tooltip near mouse pointer
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", () => {// Select the dimensions from the container to make the map responsive
      const container = d3.select(".map-container");
      const width = container.node().getBoundingClientRect().width;
      const height = container.node().getBoundingClientRect().height;
      
      // Set up the tooltip and make it hidden by default
      const tooltip = d3.select("#tooltip")
        .style("position", "absolute")
        .style("padding", "8px")
        .style("background", "white")
        .style("border", "1px solid #333")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0); // Hidden by default
      
      // Set up the projection and path generator for a responsive map
      const projection = d3.geoMercator()
        .scale(width / 6) // Adjust the scale based on container width
        .translate([width / 2, height / 1.5]); // Centering the map
      
      const path = d3.geoPath().projection(projection);
      
      // Create an SVG element with a responsive viewBox
      const svg = d3.select("#map")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
      
      // Define color scale
      const colorScale = d3.scaleSequential(d3.interpolateOranges).domain([0, 500]);
      
      // Load both the CSV data and the GeoJSON file
      Promise.all([
        d3.csv("map.csv"),
        d3.json("world.geojson")
      ]).then(([csvData, geoData]) => {
        
        // Convert the CSV data into a lookup object for easy access
        const dataMap = {};
        csvData.forEach(d => {
          dataMap[d.country.toLowerCase().trim()] = +d.value;  // Convert value to a number
        });
      
        // Filter out countries without data
        const filteredFeatures = geoData.features.filter(d => {
          const countryName = d.properties.name.toLowerCase().trim();
          return dataMap[countryName] !== undefined; // Only include countries with values
        });
      
        // Define a color scale for countries with data
        const colorScale = d3.scaleOrdinal(d3.schemeSet3.concat(d3.schemePaired))
          .domain(filteredFeatures.map(d => d.properties.name));
      
        // Draw the map using only countries with data
        svg.selectAll("path")
          .data(filteredFeatures)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", (d) => colorScale(d.properties.name)) 
          .attr("stroke", "#333")
          .attr("stroke-width", 0.5)
          
          .on("mouseover", (event, d) => {
              const countryName = d.properties.name;
              const value = dataMap[countryName.toLowerCase().trim()];
              
              // Update the info box content
              d3.select("#country-name").text(`Country: ${countryName}`);
              d3.select("#value-name").text(`Value: ${value}`);
              
              // Display tooltip with country name and value
              tooltip.style("opacity", 1)
                     .html(`<strong>${countryName}</strong><br>Value: ${value}`);
          })
          .on("mousemove", (event) => {
            // Position tooltip near mouse pointer
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 20) + "px");
          })
          .on("mouseout", () => {
              // Hide tooltip
              tooltip.style("opacity", 0);
              
              // Clear info box content if needed
              d3.select("#country-name").text("Country: ");
              d3.select("#value-name").text("Value: ");
          });
          
      }).catch(error => {
        console.error("Error loading the data:", error);
      });
      
        // Hide tooltip
        tooltip.style("opacity", 0);
        
        // Clear info box content if needed
        d3.select("#country-name").text("Country: ");
        d3.select("#value-name").text("Value: ");
    });
    
}).catch(error => {
  console.error("Error loading the data:", error);
});
