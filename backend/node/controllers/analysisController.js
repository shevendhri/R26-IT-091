const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');
const mongoose = require('mongoose');
const Analysis = require('../models/Analysis');

const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL || 'http://127.0.0.1:8081';

function isMongoConnected() {
    return mongoose.connection.readyState === 1;
}

async function pdfToPngBuffer(pdfBuffer) {
    // Convert the first page of a PDF to PNG using pdf2pic.
    const { fromBuffer } = require('pdf2pic');
    const converter = fromBuffer(pdfBuffer, {
        density: 200,
        format: 'png',
        width: 2000,
        height: 2000,
        preserveAspectRatio: true,
    });
    const page = await converter(1, { responseType: 'buffer' });
    return page.buffer;
}

async function svgToPngBuffer(svgBuffer) {
    // Rasterizing via sharp/librsvg also neutralizes any embedded scripts.
    return sharp(svgBuffer, { density: 200 }).png().toBuffer();
}

exports.analyzePlan = async (req, res) => {
    try {
        const { files } = req;
        // Accept field names: svg, png, image (legacy).
        if (!files || (!files.svg && !files.png && !files.image)) {
            return res.status(400).json({ error: 'A floor plan image (PNG, JPG, PDF, or SVG) is required.' });
        }

        let imageFile = files.svg ? files.svg[0] : (files.png ? files.png[0] : files.image[0]);
        let imageBuffer = imageFile.buffer;
        let imageName = imageFile.originalname;
        const isPdf = imageName.toLowerCase().endsWith('.pdf') ||
                      imageFile.mimetype === 'application/pdf';
        const isSvg = !!files.svg || imageName.toLowerCase().endsWith('.svg') ||
                      imageFile.mimetype === 'image/svg+xml';

        // Convert PDF page 1 to a PNG buffer.
        if (isPdf) {
            try {
                imageBuffer = await pdfToPngBuffer(imageBuffer);
                imageName = imageName.replace(/\.pdf$/i, '_page1.png');
            } catch (pdfErr) {
                console.error('PDF conversion failed:', pdfErr.message);
                return res.status(422).json({
                    error: 'PDF conversion failed. Make sure pdf2pic and poppler are installed.',
                    detail: pdfErr.message,
                });
            }
        }

        // Every upload - SVG, PNG, JPEG/JPG, or a PDF converted above - goes
        // through real YOLO detection on the pixels.
        if (isSvg) {
            const rawSvgBuffer = imageFile.buffer;
            const text = rawSvgBuffer.slice(0, 200).toString('utf8').trimStart();
            if (!/^(<\?xml|<svg)/i.test(text)) {
                return res.status(422).json({ error: 'File does not look like a valid SVG.' });
            }
            try {
                imageBuffer = await svgToPngBuffer(rawSvgBuffer);
                imageName = imageName.replace(/\.svg$/i, '_rasterized.png');
            } catch (svgErr) {
                console.error('SVG conversion failed:', svgErr.message);
                return res.status(422).json({
                    error: 'SVG conversion failed. Please check the file is a valid SVG.',
                    detail: svgErr.message,
                });
            }
        }

        const form = new FormData();
        form.append('image', imageBuffer, imageName);

        const response = await axios.post(`${MODEL_SERVICE_URL}/predict`, form, {
            headers: form.getHeaders(),
            maxBodyLength: Infinity,
        });
        const result = response.data;
        const mode = isSvg ? 'svg' : 'yolo';

        // Map per-room data from ML response.
        const rooms = (result.rooms || []).map((r, i) => ({
            name:        r.name      || `Room ${i + 1}`,
            type:        r.type      || 'other',
            doors:       r.doors     || 0,
            windows:     r.windows   || 0,
            walls:       r.walls     ?? undefined,
            area_sqft:   r.area_sqft ?? undefined,
            wallAreaPx2: r.area_px2  || 0,
            compliance:  r.compliance || undefined,
        }));

        const analysisPayload = {
            fileName:         imageName,
            mode,
            counts:           result.counts || {},
            roomNames:        rooms.map(r => r.name),
            rooms,
            lowConfidence:    result.low_confidence || false,
            compliance:       result.compliance || undefined,
            approvalChecklist: result.approval_checklist || undefined,
        };

        if (isMongoConnected()) {
            const analysis = new Analysis(analysisPayload);
            await analysis.save();

            return res.status(201).json({
                message: 'Analysis completed and saved',
                data:    analysis,
                overlay: result.overlay,
                rooms,
                compliance: result.compliance,
                approvalChecklist: result.approval_checklist,
            });
        }

        return res.status(200).json({
            message: 'Analysis completed',
            data: analysisPayload,
            overlay: result.overlay,
            rooms,
            compliance: result.compliance,
            approvalChecklist: result.approval_checklist,
        });

    } catch (error) {
        console.error('Analysis Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error during analysis' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        if (!isMongoConnected()) {
            return res.json([]);
        }

        const history = await Analysis.find().sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};
