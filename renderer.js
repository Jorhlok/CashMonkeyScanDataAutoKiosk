const { ipcRenderer } = require('electron');
const { JSDOM } = require('jsdom');
const qs = require('qs');

// Reference to the UI elements
const runButton = document.getElementById('run-report');
const datePicker = document.getElementById('date-picker');
const autoRefreshCheckbox = document.getElementById('auto-refresh');
const loadingIndicator = document.getElementById('refreshStatus');
const outputElement = document.getElementById('output');
const toggleRoutesCheckbox = document.getElementById('toggleRoutesCheckbox');

let autoRefreshEnabled = false;
let intervalId = null;
let routesVisible = toggleRoutesCheckbox.checked; // Initialize based on checkbox state

// Event listeners for auto-refresh toggle
autoRefreshCheckbox.addEventListener('change', (event) => {
    autoRefreshEnabled = event.target.checked;

    if (autoRefreshEnabled) {
        startAutoRefresh();
        datePicker.style.display = 'none';  // Hide date picker when auto-refresh is enabled
    } else {
        stopAutoRefresh();
        datePicker.style.display = 'block';  // Show date picker when auto-refresh is disabled
    }
});

// Event listener for the Run Report button
runButton.addEventListener('click', () => {
    const selectedDate = datePicker.value;
    fetchDataAndUpdateUI(selectedDate);
});

// Event listener for the Toggle Routes checkbox
toggleRoutesCheckbox.addEventListener('change', (event) => {
    routesVisible = event.target.checked;
    toggleRoutesVisibility(); // Update visibility when checkbox is toggled
});

// Function to start auto-refresh
function startAutoRefresh() {
    if (intervalId) return;

    intervalId = setInterval(() => {
        // Use today's date if auto-refresh is enabled
        const selectedDate = new Date().toISOString().split('T')[0];
        fetchDataAndUpdateUI(selectedDate);
    }, 10000);  // Refresh every 10 seconds
}

// Function to stop auto-refresh
function stopAutoRefresh() {
    clearInterval(intervalId);
    intervalId = null;
}

// Function to toggle the visibility of individual routes
function toggleRoutesVisibility() {
    const routeSections = document.querySelectorAll('.route-section');
    routeSections.forEach(section => {
        // Skip grand total section
        if (section.classList.contains('grand-total-section')) return;

        if (routesVisible) {
            section.style.display = 'block'; // Show routes
        } else {
            section.style.display = 'none'; // Hide routes
        }
    });
}

async function fetchDataAndUpdateUI(date) {
    const routes = ['Reject', 'MF', 'hotlist'];
    const grandTotal = {}; // To keep track of the grand total for each user
    let grandTotalCount = 0; // To keep track of total occurrences across all users
    let routeData = {}; // To store data for each route

    loadingIndicator.style.display = 'block';
    // Get the URL and headers from the main process securely
    const { url, headers } = await ipcRenderer.invoke('get-api-data');

    // Create a promise for each route to ensure all routes are processed first
    const routePromises = routes.map(routename => {
        const routeUrl = `${url}?date=${date}&routename=${routename}`;
        
        const options = {
            method: 'GET',
            headers: headers
        };
        
        console.log(options);
        
        return fetch(routeUrl, options)
            .then(response => response.text())
            .then(data => {
                const dom = new JSDOM(data);
                const document = dom.window.document;
                const tbody = document.querySelector('tbody');
                const rows = tbody.querySelectorAll('tr');

                let userCount = {};

                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    const rowData = Array.from(cells).map(cell => cell.textContent.trim());
                    const userName = rowData[3];

                    if (userName) {
                        // Track user occurrences for this specific route
                        if (userCount[userName]) {
                            userCount[userName]++;
                        } else {
                            userCount[userName] = 1;
                        }

                        // Track overall user occurrences across all routes
                        if (grandTotal[userName]) {
                            grandTotal[userName]++;
                        } else {
                            grandTotal[userName] = 1;
                        }

                        // Track grand total count (all users, all routes)
                        grandTotalCount++;
                    }
                });

                routeData[routename] = userCount; // Save route-specific data
            })
            .catch(error => {
                console.error('Error fetching data for route:', routename, error);
            });
    });

    // Get cookies from Electron (if using IPC for dynamic cookies)
    ipcRenderer.invoke('fetch-listings', date).then(listingsData => {
        // Wait for all route data to be fetched
        Promise.all(routePromises)
        .then(() => {
            // Now all routes have been processed, update the UI
            routes.forEach(routename => {
                const userCount = routeData[routename];
                const routeSection = document.querySelector(`.route-section-${routename}`);
                
                if (!routeSection) {
                    // If route section doesn't exist, create it
                    const newRouteSection = document.createElement('div');
                    newRouteSection.classList.add('route-section', 'route-section-' + routename); // Add route-specific class
                    newRouteSection.innerHTML = `<h3>Route: ${routename} on ${date}</h3>`;
                    outputElement.appendChild(newRouteSection);
                }

                const existingRouteSection = document.querySelector(`.route-section-${routename}`);
                // Update the route title without resetting the section
                existingRouteSection.querySelector('h3').innerHTML = `Route: ${routename} on ${date}`;
        
                // Clear the existing user data
                existingRouteSection.querySelectorAll('.user').forEach(userElement => userElement.remove());
                existingRouteSection.querySelector('.route-total')?.remove(); // Remove previous route total

                // Update user data dynamically
                for (const [user, count] of Object.entries(userCount)) {
                    let userElement = existingRouteSection.querySelector(`.user-${user}`);
                    if (!userElement) {
                        // If user data doesn't exist, create it
                        userElement = document.createElement('p');
                        userElement.classList.add(`user-${user}`);
                        userElement.classList.add('user'); // To identify and clear them later
                        existingRouteSection.appendChild(userElement);
                    }
                    userElement.innerHTML = `${user}: ${count}`; // Update user count
                }

                const routeTotal = Object.values(userCount).reduce((total, count) => total + count, 0);
                let totalElement = existingRouteSection.querySelector('.route-total');
                if (!totalElement) {
                    // If route total doesn't exist, create it
                    totalElement = document.createElement('p');
                    totalElement.classList.add('route-total');
                    existingRouteSection.appendChild(totalElement);
                }
                totalElement.innerHTML = `Total for ${routename}: ${routeTotal}`; // Update route total
            });
        
            // Update grand total count for each user
            let grandTotalSection = document.querySelector('.grand-total-section');
            if (!grandTotalSection) {
                // If grand total section doesn't exist, create it
                grandTotalSection = document.createElement('div');
                grandTotalSection.classList.add('route-section', 'grand-total-section');
                outputElement.appendChild(grandTotalSection);
            }
        
            // Clear previous grand total data
            grandTotalSection.querySelectorAll('.scans-per-user p').forEach(element => element.remove());
            grandTotalSection.querySelector('.grand-total')?.remove();
            grandTotalSection.querySelector('.listings-container')?.remove();

            // Create or update the grand totals container
            const grandTotalsContainer = grandTotalSection.querySelector('.grand-totals-container') || document.createElement('div');
            grandTotalsContainer.style.display = 'flex';
            grandTotalsContainer.style.justifyContent = 'space-between';
            grandTotalsContainer.style.gap = '75px';  // Adjust this value to your desired space
            grandTotalSection.appendChild(grandTotalsContainer);

            // Create or update scans per user container
            let scansPerUserContainer = grandTotalsContainer.querySelector('.scans-per-user');
            if (!scansPerUserContainer) {
                scansPerUserContainer = document.createElement('div');
                scansPerUserContainer.classList.add('scans-per-user');
                grandTotalsContainer.appendChild(scansPerUserContainer);
            }

            // Add Total Scans inside the scans per user container
            let grandTotalElement = scansPerUserContainer.querySelector('.grand-total');
            if (!grandTotalElement) {
                grandTotalElement = document.createElement('h3');
                grandTotalElement.classList.add('grand-total');
                scansPerUserContainer.appendChild(grandTotalElement);
            }
            grandTotalElement.innerHTML = `Total Pre Scans: ${grandTotalCount}`; // Update grand total scans

            // Update grand total user data for Scans inside the scansPerUserContainer
            for (const [user, count] of Object.entries(grandTotal)) {
                let userGrandTotalElement = scansPerUserContainer.querySelector(`.user-grand-total-${user}`);
                if (!userGrandTotalElement) {
                    userGrandTotalElement = document.createElement('p');
                    userGrandTotalElement.classList.add(`user-grand-total-${user}`);
                    scansPerUserContainer.appendChild(userGrandTotalElement);
                }
                userGrandTotalElement.innerHTML = `${user}: ${count}`; // Update grand total user count (scans)
            }
        
            // Create or update the Total Listings data container
            let listingsContainer = grandTotalsContainer.querySelector('.listings-container');
            if (!listingsContainer) {
                listingsContainer = document.createElement('div');
                listingsContainer.classList.add('listings-container');
                grandTotalsContainer.appendChild(listingsContainer);
            }

            // Total Listings section
            let totalListingsElement = listingsContainer.querySelector('.total-listings');
            if (!totalListingsElement) {
                totalListingsElement = document.createElement('p');
                totalListingsElement.classList.add('total-listings');
                listingsContainer.appendChild(totalListingsElement);
            }
            totalListingsElement.innerHTML = `<h3>Total Listings: ${listingsData['Totals'] || 0}</h3>`; // Total listings data
        
            // Loop through listingsData and add listings per user
            for (const [user, totalListed] of Object.entries(listingsData)) {
                if (user !== 'Totals') {
                let userListingsElement = listingsContainer.querySelector(`.user-listings-${user}`);
                if (!userListingsElement) {
                    userListingsElement = document.createElement('p');
                    userListingsElement.classList.add(`user-listings-${user}`);
                    listingsContainer.appendChild(userListingsElement);
                }
                userListingsElement.innerHTML = `${user}: ${totalListed}`; // Update listings per user
            }
            }
        
            // Hide loading indicator once data is loaded
            loadingIndicator.style.display = 'none';
        
            // Apply visibility based on the checkbox state after the report is generated
            toggleRoutesVisibility();
        })
        .catch(error => {
            console.error('Error processing all routes:', error);
            loadingIndicator.style.display = 'none';
        });
    });
}

//modifications for automatically starting
autoRefreshCheckbox.click();
runButton.click();
