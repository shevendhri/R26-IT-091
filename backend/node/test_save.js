const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BACKEND_URL = 'http://localhost:5000/api';

async function testFullFlow() {
    console.log('--- Testing Full Flow (Backend -> ML -> MongoDB) ---');
    
    const pngPath = path.join(__dirname, 'F1_original.png');
    const svgPath = path.join(__dirname, 'model.svg');

    if (!fs.existsSync(pngPath) || !fs.existsSync(svgPath)) {
        console.error('Error: Test files not found.');
        return;
    }

    const form = new FormData();
    form.append('png', fs.createReadStream(pngPath));
    form.append('svg', fs.createReadStream(svgPath));

    try {
        console.log('Sending request to Backend...');
        const response = await axios.post(`${BACKEND_URL}/analyze`, form, {
            headers: form.getHeaders()
        });

        console.log('Backend Response:', response.data.message);
        console.log('Saved Data ID:', response.data.data._id);
        console.log('Counts:', JSON.stringify(response.data.data.counts, null, 2));

        console.log('\nFetching History from MongoDB...');
        const historyResponse = await axios.get(`${BACKEND_URL}/history`);
        console.log(`History count: ${historyResponse.data.length}`);
        console.log('Latest record:', JSON.stringify(historyResponse.data[0], null, 2));

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Error Details:', error.response.data);
        }
    }
}

testFullFlow();
