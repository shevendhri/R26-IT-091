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

async function analyzeSVG(pngPath, svgPath) {
    console.log(`\n--- Analyzing PNG + SVG Pair ---`);
    console.log(`PNG: ${pngPath}`);
    console.log(`SVG: ${svgPath}`);

    if (!fs.existsSync(pngPath) || !fs.existsSync(svgPath)) {
        console.error(`Error: One or both files not found.`);
        return;
    }

    const form = new FormData();
    form.append('png', fs.createReadStream(pngPath));
    form.append('svg', fs.createReadStream(svgPath));

    try {
        const response = await axios.post(`${MODEL_SERVICE_URL}/parse`, form, {
            headers: form.getHeaders()
        });
        console.log('Parsing Results:');
        console.log(`Counts:`, JSON.stringify(response.data.counts, null, 2));
        console.log(`Overlay Image (Base64 length): ${response.data.overlay.length} chars`);
    } catch (error) {
        console.error('Error calling ML service:', error.message);
    }
}

// Demo usage sample - 1_original.png, model.svg |   2_original.png,model2.svg,

const demoPng = path.join(__dirname, '3_original.png');
const demoSvg = path.join(__dirname, 'model3.svg');

// Create dummy files if they don't exist 
if (!fs.existsSync(demoPng)) fs.writeFileSync(demoPng, 'dummy png content');
if (!fs.existsSync(demoSvg)) fs.writeFileSync(demoSvg, 'dummy svg content');

async function runDemo() {
    console.log('Starting Console Demo...');
    await analyzePNG(demoPng);
    await analyzeSVG(demoPng, demoSvg);
    console.log('\nDemo Complete.');
}

runDemo();
