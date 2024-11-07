const myChart = document.querySelector(".my-chart");
const ul = document.querySelector(".programming-stats .details ul");

const parseCSV = (data) => {
    return data.trim().split('\n').slice(1).map(row => {
        const [country, year, value] = row.split(',');
        return { country, year, value: +value }; // Convert OBS_VALUE to a number
    });
};

// Function to aggregate data
const aggregateData = (parsedData) => {
    return parsedData.reduce((acc, { country, value }) => {
        if (!acc[country]) {
            acc[country] = 0; // Initialize if it doesn't exist
        }
        acc[country] += value; // Sum the OBS_VALUE
        return acc;
    }, {});
};

// Function to create a random color
const getRandomColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor}`;
};

// Function to create the chart
const createChart = (chartData) => {
    const backgroundColors = chartData.labels.map(() => getRandomColor()); // Create a unique color for each segment

    new Chart(myChart, {
        type: "doughnut",
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: "Total Observation Values by Country",
                    data: chartData.data,
                    backgroundColor: backgroundColors, // Use the array of random colors
                    borderColor: backgroundColors.map(color => color.replace('0.2', '1')), // Use a darker border color
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

// Function to populate the list with values
const populateUl = (chartData) => {
    chartData.labels.forEach((l, i) => {
        let li = document.createElement("li");
        li.innerHTML = `${l}: <span class='percentage'>${chartData.data[i]}</span>`;
        ul.appendChild(li);
    });
};

// Fetch and parse the CSV file
fetch('practice.csv')
    .then(response => response.text())
    .then(csvData => {
        const parsedData = parseCSV(csvData);
        const aggregatedData = aggregateData(parsedData);

        // Convert aggregated data back into an array format for the chart
        const chartData = {
            labels: Object.keys(aggregatedData),
            data: Object.values(aggregatedData),
        };
        

        createChart(chartData);
        populateUl(chartData);
    })
    .catch(error => console.error('Error fetching CSV data:', error));
