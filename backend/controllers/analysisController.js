const axios = require('axios');
const FormData = require('form-data');
const Analysis = require('../models/Analysis');

const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL || 'http://localhost:8000';

exports.analyzePlan = async (req, res) => {
    try {
        const { files } = req;
        if (!files || (!files.png && !files.image)) {
            return res.status(400).json({ error: 'PNG image is required' });
        }

        const pngFile = files.png ? files.png[0] : files.image[0];
        const svgFile = files.svg ? files.svg[0] : null;

        let result;
        let mode;

        if (svgFile) {
            // SVG Mode
            mode = 'svg';
            const form = new FormData();
            form.append('png', pngFile.buffer, pngFile.originalname);
            form.append('svg', svgFile.buffer, svgFile.originalname);

            const response = await axios.post(`${MODEL_SERVICE_URL}/parse`, form, {
                headers: form.getHeaders()
            });
            result = response.data;
        } else {
            // YOLO Mode
            mode = 'yolo';
            const form = new FormData();
            form.append('image', pngFile.buffer, pngFile.originalname);

            const response = await axios.post(`${MODEL_SERVICE_URL}/predict`, form, {
                headers: form.getHeaders()
            });
            result = response.data;
        }

        // Save to MongoDB
        const analysis = new Analysis({
            fileName: pngFile.originalname,
            mode: mode,
            counts: result.counts || {
                room: result.room,
                wall: result.wall,
                door: result.door,
                window: result.window
            },
            roomNames: result.room_names || [],
            lowConfidence: result.low_confidence || false
            // imageUrl will be added here later after Cloudinary integration
        });

        await analysis.save();

        res.status(201).json({
            message: 'Analysis completed and saved',
            data: analysis,
            overlay: result.overlay // Base64 overlay image
        });

    } catch (error) {
        console.error('Analysis Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error during analysis' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await Analysis.find().sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};
