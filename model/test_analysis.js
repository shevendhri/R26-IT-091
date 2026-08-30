const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const MODEL_SERVICE_URL = 'http://localhost:8000';

async function analyzePNG(filePath) {
    console.log(`\n--- Analyzing PNG: ${filePath} ---`);
    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found at ${filePath}`);
        return;
    }

    const form = new FormData();
    form.append('image', fs.createReadStream(filePath));

    try {
        const response = await axios.post(`${MODEL_SERVICE_URL}/predict`, form, {
            headers: form.getHeaders()
        });
        console.log('Detection Results:');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error calling ML service:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Demo usage
const demoPng = path.join(__dirname, 'F1_original.png');

// Create a dummy file if it doesn't exist for the demo
if (!fs.existsSync(demoPng)) fs.writeFileSync(demoPng, 'dummy png content');

async function runDemo() {
    console.log('Starting Console Demo...');
    await analyzePNG(demoPng);
    console.log('\nDemo Complete.');
}

runDemo();
