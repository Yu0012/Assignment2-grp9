// Function to fetch CSV data
async function fetchCSV(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch the CSV file');
        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error fetching CSV:', error);
        alert('Failed to load CSV data. Please check the file path.');
        return '';
    }
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

// Function to generate a random color for datasets (if country not in colorPalette)
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to create the chart
function createChart(data) {
    const ctx = document.getElementById('nursingChart').getContext('2d');

    // Extract labels (years) and ensure sorting
    const labels = [...new Set(data.map(d => d.timePeriod))].sort((a, b) => a - b);

    // Define a consistent color palette for countries
    const colorPalette = {
        "Japan": "#FF6384",
        "Korea": "#36A2EB",
        "New Zealand": "#FFCE56",
        "United States": "#4BC0C0",
        "Mexico": "#8E44AD"
    };

    // Prepare datasets for each country
    const datasets = [];
    const countries = [...new Set(data.map(d => d.country))];

    countries.forEach(country => {
        const countryData = data.filter(d => d.country === country);
        const countryValues = labels.map(year => {
            const entry = countryData.find(d => d.timePeriod === year);
            return entry ? entry.obsValue : null;
        });

        datasets.push({
            label: country,
            data: countryValues,
            borderColor: colorPalette[country] || getRandomColor(),
            backgroundColor: colorPalette[country] || getRandomColor(),
            fill: false,
            borderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            tension: 0.4
        });
    });

    // Register the Chart.js plugins
    Chart.register(ChartDataLabels);

    // Create the chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuad'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#333',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
                        }
                    }
                },
                // Disable data labels for all countries
                datalabels: {
                    display: false // <--- This line hides all labels
                },
                title: {
                    display: true,
                    text: 'Nursing Graduates by Country (2018-2022)',
                    font: {
                        size: 20,
                        weight: 'bold'
                    },
                    color: '#333'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year',
                        font: {
                            size: 16
                        },
                        color: '#333'
                    },
                    ticks: {
                        color: '#333'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Nurses',
                        font: {
                            size: 16
                        },
                        color: '#333'
                    },
                    ticks: {
                        color: '#333'
                    }
                }
            }
        }
    });
}

// Main function to load data and create the chart
async function main() {
    const csvData = await fetchCSV('ng.csv'); // Ensure the correct file path
    if (csvData) {
        const parsedData = parseCSV(csvData);
        console.log('Parsed Data:', parsedData); // Debugging to check data
        createChart(parsedData);
    }
}

// Run the main function
main();
