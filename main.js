const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { session } = require('electron');
const qs = require('qs');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();  // Load .env file

ipcMain.handle('fetch-listings', async (event, date) => {
    const listerurl = process.env.LISTER_API_URL;
    const cookie = process.env.LISTER_COOKIE;
    const Content_Type = process.env.LISTER_CONTENT_TYPE;
    const Accept = process.env.LISTER_ACCEPT;
    const url = listerurl;

    // Prepare the form data
    const formData = qs.stringify({
        filter_date: date,
        go: 'Submit',
    });

    // Prepare the request headers
    const headers = {
        'Content-Type': Content_Type,
        'Cookie': cookie,
        'Accept': Accept,
    };

    try {
        // Send the POST request with axios
        const response = await axios.post(url, formData, { headers });

        // Load the response HTML into cheerio for parsing
        const $ = cheerio.load(response.data);

        // Initialize a result object for the summary data
        const summaryData = {};

        // Iterate over each row in the table
        $('table tr').each((index, row) => {
            // Skip the first row (header row)
            if (index === 0) return;

            const cells = $(row).find('td');

            // Extract the 'user' and 'totalListed' fields
            const user = $(cells[0]).text().trim();
            const totalListed = $(cells[7]).text().trim();

            // Skip empty, invalid, or unwanted rows
            if (!user || !totalListed || totalListed === "-" || user === "User" || user === "Total Listed") {
                return;
            }

            // Assign the totalListed value to the user key in summaryData
            summaryData[user] = totalListed;
        });

        // Output the summarized data, excluding "User: Total Listed"
        console.log(summaryData);
        
        return summaryData;

    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        return {};
    }
});
// Handle a request from renderer for sensitive data
ipcMain.handle('get-api-data', () => {
    return {
        url: process.env.PRESCAN_API_URL,
        headers: {
            'Authorization': process.env.PRESCAN_AUTH_TOKEN,
            'Cookie': process.env.PRESCAN_COOKIE,
            'User-Agent': process.env.PRESCAN_USER_AGENT,
        }
    };
});
let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,  // Set to false to allow node integration
        }
    });

    win.loadFile('index.html');

    win.on('closed', () => {
        win = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
