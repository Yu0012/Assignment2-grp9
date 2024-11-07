// script.js
// Function to fetch CSV data
async function fetchCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

// Function to parse CSV data
function parseCSV(data) {
    const lines = data.split('\n').slice(1); // Skip header row
    const result = [];
    lines.forEach(line => {
        const [country, timePeriod, obsValue] = line.split(',');
        if (country && timePeriod && obsValue) {
            result.push({ country, timePeriod: parseInt(timePeriod), obsValue: parseInt(obsValue) });
        }
    });
    return result; 
}

// Function to create the chart
function createChart(data) {
    // Sort data by timePeriod in ascending order
    data.sort((a, b) => a.timePeriod - b.timePeriod);
    
    const labels = [...new Set(data.map(d => d.timePeriod))]; // Get unique time periods
    const datasets = {};

    // Prepare datasets for each country
    data.forEach(entry => {
        if (!datasets[entry.country]) {
            datasets[entry.country] = {
                label: entry.country,
                data: new Array(labels.length).fill(0),
                fill: false,
                borderColor: getRandomColor(),
                tension: 0.3, // Add some curve to the line
                pointRadius: 5, // Size of point markers
                pointHoverRadius: 7, // Size of point markers on hover
                // Adding tooltips for each point
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}`;
                        }
                    }
                }
            };
        }
        const index = labels.indexOf(entry.timePeriod);
        datasets[entry.country].data[index] = entry.obsValue;
    });

    // Create datasets array
    const chartDatasets = Object.values(datasets);

    // Create the chart
    const ctx = document.getElementById('nursingChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: chartDatasets,
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top', // Position the legend at the top
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            return `Year: ${tooltipItems[0].label}`;
                        },
                        label: function(tooltipItem) {
                            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Nursing Gradutes from 2019-2022',
                    font: {
                        size: 20, // Font size of the title
                        weight: 'bold' // Bold font weight for title
                    },
                    color: '#000000',
                    
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year',
                        font: {
                            size: 16 // Font size for X axis title
                        },
                          color: '#000000'
                        
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10 // Limit the number of ticks on the X-axis
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Nurses',
                        font: {
                            size: 16 // Font size for Y axis title
                            
                        },
                        color: '#000000'
                    },
                    beginAtZero: true, // Start Y axis at zero
                }
            }
        },
    });

    // Add data labels above New Zealand's line
    chartDatasets.forEach((dataset, index) => {
        if (dataset.label === 'New Zealand') {
            dataset.datalabels = {
                anchor: 'end',
                align: 'start',
                formatter: function(value) {
                    return value; // Show the value as the label
                },
                offset: 10, // Move labels above the points
                color: 'black' // Color of the labels
            };
        }
    });

    // Register the data labels plugin
    Chart.register(ChartDataLabels);

    // Update the chart with the new options
    chart.update();
}

// Function to generate a random color for datasets
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Main function to load data and create the chart
async function main() {
    const csvData = await fetchCSV('ng.csv'); // Replace with the path to your CSV file
    const parsedData = parseCSV(csvData);
    createChart(parsedData);
}

// Run the main function
main();
