const myChartElement = document.querySelector(".my-chart");
const ul = document.querySelector(".programming-stats .details ul");
const yearSelect = document.getElementById("year");

// Reference to the paragraphs for each year
const yearDescriptions = {
    "2018": document.getElementById("d1"),
    "2019": document.getElementById("d2"),
    "2020": document.getElementById("d3"),
    "2021": document.getElementById("d4"),
    "2022": document.getElementById("d5"),
    "Total": document.getElementById("description")
};

// Function to toggle visibility of the chart and description
const toggleContentVisibility = (selectedYear) => {
    // Hide all descriptions first
    Object.keys(yearDescriptions).forEach(year => {
        yearDescriptions[year].style.display = "none";
    });

    // Display the selected year description and chart
    yearDescriptions[selectedYear].style.display = "block";
};

// Function to parse CSV data
const parseCSV = (data) => {
    return data.trim().split('\n').slice(1).map(row => {
        const [country, year, value] = row.split(',');
        return { country, year: parseInt(year), value: +value };
    });
};

// Function to filter data by year or aggregate all years if "Total"
const filterDataByYear = (data, selectedYear) => {
    if (selectedYear === "Total") {
        return data; // No filtering, just aggregate all data
    }
    return data.filter(item => item.year === parseInt(selectedYear));
};

// Aggregate data for the donut chart by country
const aggregateData = (filteredData) => {
    return filteredData.reduce((acc, { country, value }) => {
        if (!acc[country]) {
            acc[country] = 0;
        }
        acc[country] += value;
        return acc;
    }, {});
};

// Function to create a random color
const getRandomColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor}`;
};

// Function to create the chart
let chartInstance; // Store the chart instance to update it later
const createChart = (chartData) => {
    const backgroundColors = chartData.labels.map(() => getRandomColor());

    if (chartInstance) {
        chartInstance.destroy(); // Destroy existing chart instance if exists
    }

    chartInstance = new Chart(myChartElement, {
        type: "doughnut",
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: "Total Practicing Nurses by Country",
                    data: chartData.data,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color.replace('0.2', '1')),
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                },
            },
        },
    });
};

// Populate the list with values
const populateUl = (chartData) => {
    ul.innerHTML = ""; // Clear previous list items
    chartData.labels.forEach((label, i) => {
        let li = document.createElement("li");
        li.innerHTML = `${label}: <span class='percentage'>${chartData.data[i]}</span>`;
        ul.appendChild(li);
    });
};

// Main function to fetch and display the data
const fetchDataAndRenderChart = () => {
    fetch('practice.csv') // Ensure the path to your CSV file is correct
        .then(response => response.text())
        .then(csvData => {
            const parsedData = parseCSV(csvData);

            // Default to year 2018
            const selectedYear = "2018";
            yearSelect.value = selectedYear; // Set the dropdown value to 2018
            updateChart(parsedData, selectedYear);

            // Listen for changes in the dropdown and update the chart
            yearSelect.addEventListener("change", () => {
                const selectedYear = yearSelect.value;
                updateChart(parsedData, selectedYear);
            });
        })
        .catch(error => console.error('Error fetching CSV data:', error));
};

// Update the chart based on selected year
const updateChart = (parsedData, selectedYear) => {
    let chartData;

    // Filter data by the selected year or aggregate all years if "Total"
    const filteredData = filterDataByYear(parsedData, selectedYear);
    const aggregatedData = aggregateData(filteredData);

    // Ensure there is data to display
    if (Object.keys(aggregatedData).length === 0) {
        console.error("No data available for year", selectedYear);
        return;
    }

    // Prepare the chart data
    chartData = {
        labels: Object.keys(aggregatedData),
        data: Object.values(aggregatedData),
    };

    // Create and populate the chart
    createChart(chartData);
    populateUl(chartData);

    // Toggle visibility of the description and chart content based on selected year
    toggleContentVisibility(selectedYear);
};

// Fetch and render the data when the page loads
fetchDataAndRenderChart();
