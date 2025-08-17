const { google } = require('googleapis');

// Helper function to log and exit on missing environment variables
function checkEnvVariables() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const credentials = process.env.GOOGLE_CREDENTIALS;

  if (!sheetId || !credentials) {
    const missing = [];
    if (!sheetId) missing.push('GOOGLE_SHEET_ID');
    if (!credentials) missing.push('GOOGLE_CREDENTIALS');
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

exports.handler = async function(event, context) {
  try {
    // Check for environment variables at the start
    checkEnvVariables();

    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const range = 'Recetas!A2:F'; // Changed range to include column F for image URL
    const range = 'Recetas!A2:F';

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });

    // Handle case where the sheet has no data in the specified range
    const data = response.data.values || [];
    
    const recipes = data.map(row => ({
        id: row[0] || '',
        name: row[1] || '',
        ingredients: row[2] ? row[2].split(',').map(item => item.trim()) : [],
        steps: row[3] ? row[3].split('\n').map(item => item.trim()) : [],
        timers: row[4] ? row[4].split(',').map(item => parseInt(item.trim(), 10) || 0) : [],
        imageUrl: row[5] || '' // Added imageUrl from column F
        timers: row[4] ? row[4].split(',').map(item => parseInt(item.trim(), 10) || 0) : [],
        image: row[5] || ''
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(recipes),
    };
  } catch (error) {
    // Log the detailed error to the function logs
    console.error('Function handler error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'An error occurred while fetching recipe data.',
        details: error.message 
      }),
    };
  }
};