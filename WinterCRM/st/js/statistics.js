document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Fetch client count data from the /clients endpoint
        const responseClients = await fetch('/clientsCount');
        const clientsData = await responseClients.json();

        // Calculate total number of clients
        const totalClientCount = clientsData.lenClients;

        // Display the total number of clients
        document.getElementById("client-count").innerText = totalClientCount;

        // Fetch shop count data from the /getShopInfo endpoint
        const responseShop = await fetch('/getShopInfo');
        const shopCountData = await responseShop.json();

        // Ensure that shopCountData is an array
        if (!Array.isArray(shopCountData)) {
            console.error('Error: Shop count data is not an array.');
            return;
        }

        // Extract data for shop chart
        const datesShop = shopCountData.map(entry => entry[0]);
        const countsShop = shopCountData.map(entry => entry[1]);
        const totalShopCount = countsShop.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        // Calculate the declension for the word "заказ" for shop count
        const declensionShop = calculateDeclensionShop(totalShopCount);

        // Display the total number of shop count
        document.getElementById("shop-count").innerText = `${totalShopCount} ${declensionShop}`;

        // Existing code for rent count chart
        const responseRent = await fetch('/getrentcountbydate');
        const rentCountData = await responseRent.json();

        // Extract data for rent chart
        const dates = rentCountData.map(entry => entry[0]);
        const counts = rentCountData.map(entry => entry[1]);
        const totalRentCount = counts.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        // Calculate the declension for the word "заказ" for rent count
        const declensionRent = calculateDeclension(totalRentCount);

        // Display the total number of rent count
        document.getElementById("rent-count").innerText = `${totalRentCount} ${declensionRent}`;

        // Calculate the declension for the word "заказ" for shop count
        const declensionShopChart = calculateDeclension(totalShopCount);

        var ctx = document.getElementById('rentCountChart').getContext('2d');
        var rentCountChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Заказов за день',
                        data: counts,
                        backgroundColor: 'rgb(177, 173, 237)',
                        borderColor: 'rgb(138, 132, 226)',
                        borderWidth: 5
                    },
                    {
                        label: 'Продаж в магазине за день',
                        data: countsShop,
                        backgroundColor: 'rgb(255, 99, 132)',
                        borderColor: 'rgb(255, 99, 132)',
                        borderWidth: 5
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                        },
                        title: {
                            display: true,
                            text: 'Кол-во заказов'
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom' // Adjust legend position as needed
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

function calculateDeclension(number) {
    // Function to calculate the declension of the word "заказ" based on the given number
    if (number % 10 === 1 && number % 100 !== 11) {
        return "заказ";
    } else if (number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) {
        return "заказа";
    } else {
        return "заказов";
    }
}

function calculateDeclensionShop(number) {
    // Function to calculate the declension of the word "заказ" based on the given number
    if (number % 10 === 1 && number % 100 !== 11) {
        return "продажа";
    } else if (number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) {
        return "продажи";
    } else {
        return "продаж";
    }
}

// Для slide-bar
const body = document.querySelector("body"),
  sidebar = body.querySelector(".slide_menu__wrapper"),
  toggle = body.querySelector(".toggle");

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
  })