

require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

async function getSheetsData() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets.readonly',
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const range = 'Recetas!A2:F'; 

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        return response.data.values;
    } catch (error) {
        console.error('Error fetching sheets data:', error);
        throw error;
    }
}

app.get('/api/recipes', async (req, res) => {
    try {
        const data = await getSheetsData();
        const recipes = data.map(row => ({
            id: row[0],
            name: row[1],
            ingredients: row[2].split(',').map(item => item.trim()),
            steps: row[3].split('\n').map(item => item.trim()),
            timers: row[4] ? row[4].split(',').map(item => parseInt(item.trim(), 10)) : [],
            imageUrl: row[5] // Add this line to include the image URL
        }));
        res.json(recipes);
    } catch (error) {
        res.status(500).send('Error retrieving recipe data');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

