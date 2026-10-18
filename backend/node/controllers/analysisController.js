const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');
const path = require('path');
const { createWorker, PSM } = require('tesseract.js');
const engData = require('@tesseract.js-data/eng');
const Analysis = require('../models/Analysis');

const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL || 'http://localhost:8010';

async function pdfToPngBuffer(pdfBuffer) {
    // Convert first page of a PDF to PNG using pdf2pic
    const { fromBuffer } = require('pdf2pic');
    const converter = fromBuffer(pdfBuffer, {
        density: 200,        // DPI — higher = better quality for floor plans
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

const UDA_RULES = [
    {
        id: 'front_elevation',
        question: 'Is the front elevation drawn?',
        phrases: ['FRONT ELEVATION'],
        words: ['FRONT', 'ELEVATION'],
    },
    {
        id: 'side_elevation',
        question: 'Is the side elevation drawn?',
        phrases: ['SIDE ELEVATION'],
        words: ['SIDE', 'ELEVATION'],
    },
    {
        id: 'ground_plan',
        question: 'Is the ground plan drawn?',
        phrases: ['GROUND FLOOR PLAN', 'GROUND PLAN'],
        words: ['GROUND', 'PLAN'],
    },
    {
        id: 'foundation_details',
        question: 'Is the Foundation Details?',
        phrases: ['FOUNDATION DETAIL', 'FOUNDATION DETAILS'],
        words: ['FOUNDATION', 'DETAIL'],
    },
    {
        id: 'septic_tank_details',
        question: 'Is the Spectic Tank Details?',
        phrases: ['SEPTIC TANK DETAIL', 'SEPTIC TANK DETAILS', 'SPECTIC TANK DETAIL', 'SPECTIC TANK DETAILS'],
        words: ['SEPTIC', 'TANK'],
        alternateWords: [['SPECTIC', 'TANK']],
    },
    {
        id: 'column_detail',
        question: 'Is the column Detail?',
        phrases: ['COLUMN DETAIL', 'COLUMN DETAILS'],
        words: ['COLUMN', 'DETAIL'],
    },
];

function normalizePlanText(text) {
    return String(text || '')
        .toUpperCase()
        .replace(/0/g, 'O')
        .replace(/1/g, 'I')
        .replace(/[^A-Z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function editDistance(a, b) {
    const left = normalizePlanText(a).replace(/\s/g, '');
    const right = normalizePlanText(b).replace(/\s/g, '');
    const dp = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));

    for (let i = 0; i <= left.length; i++) dp[i][0] = i;
    for (let j = 0; j <= right.length; j++) dp[0][j] = j;

    for (let i = 1; i <= left.length; i++) {
        for (let j = 1; j <= right.length; j++) {
            const cost = left[i - 1] === right[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost,
            );
        }
    }

    return dp[left.length][right.length];
}

function hasFuzzyKeyword(normalizedText, keyword) {
    const cleanKeyword = normalizePlanText(keyword).replace(/\s/g, '');
    const tokens = normalizedText.split(' ').filter(Boolean);
    const maxDistance = cleanKeyword.length >= 7 ? 2 : 1;

    for (let i = 0; i < tokens.length; i++) {
        const candidates = [
            tokens[i],
            `${tokens[i]}${tokens[i + 1] || ''}`,
            `${tokens[i]}${tokens[i + 1] || ''}${tokens[i + 2] || ''}`,
        ];

        if (candidates.some(candidate => {
            if (Math.abs(candidate.length - cleanKeyword.length) > maxDistance) return false;
            return editDistance(candidate, cleanKeyword) <= maxDistance;
        })) {
            return true;
        }
    }

    return false;
}

function findEvidenceLine(rawText, rule) {
    const lines = String(rawText || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const phrases = (rule.phrases || []).map(phrase => phrase.toLowerCase());
    const wordGroups = [
        (rule.words || []).map(word => word.toLowerCase()),
        ...(rule.alternateWords || []).map(group => group.map(word => word.toLowerCase())),
    ].filter(group => group.length > 0);

    for (const line of lines) {
        const lowerLine = line.toLowerCase();
        if (phrases.some(phrase => lowerLine.includes(phrase))) return line.slice(0, 160);
    }

    for (const line of lines) {
        const lowerLine = line.toLowerCase();
        if (wordGroups.some(group => group.every(word => lowerLine.includes(word)))) return line.slice(0, 160);
    }

    return '';
}

function checkUdaRulesFromText(rawText) {
    // Match actual OCR lines only. Never feed crop names into rule matching.
    const lines = String(rawText || '').split(/\r?\n/).map(line => line.trim())
        .filter(line => line && !/^\[[^\]]+\]$/.test(line));
    return UDA_RULES.map(rule => {
        let match = null;
        for (const line of lines) {
            const normalized = normalizePlanText(line);
            const tokens = normalized.split(' ');
            const phraseMatch = rule.phrases.some(phrase => (` ${normalized} `).includes(` ${normalizePlanText(phrase)} `));
            const groups = [rule.words, ...(rule.alternateWords || [])];
            const wordMatch = groups.some(group => group.every(word => tokens.includes(normalizePlanText(word))));
            const fuzzyMatch = groups.some(group => group.every(word => hasFuzzyKeyword(normalized, word)));
            const score = phraseMatch ? 0.88 : wordMatch ? 0.72 : fuzzyMatch ? 0.62 : 0;
            if (score && (!match || score > match.confidence)) {
                match = { evidence: line.slice(0, 160), confidence: score };
            }
        }
        return {
            id: rule.id, question: rule.question, source: 'ocr',
            status: match ? 'pass' : 'not_verifiable',
            evidence: match ? match.evidence : 'Label not detected by OCR. Review the drawing manually; this does not establish that the drawing is missing.',
            confidence: match ? match.confidence : 0,
        };
    });
}

async function imageBufferForOcr(imageBuffer) {
    return sharp(imageBuffer)
        .grayscale()
        .normalize()
        .resize({ width: 3600, height: 3600, fit: 'inside', withoutEnlargement: false })
        .sharpen()
        .png()
        .toBuffer();
}

async function prepareOcrImages(imageBuffer) {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const base = sharp(imageBuffer).rotate().grayscale().normalize();
    const regions = [
        { label: 'full sheet', left: 0, top: 0, width, height, upscale: 3600 },
        // Broad lower panels cover floor-plan captions in two-column sheets.
        { label: 'lower left panel', left: 0, top: Math.round(height * 0.45), width: Math.floor(width * 0.5), height: Math.floor(height * 0.55), upscale: 2400 },
        { label: 'lower right panel', left: Math.floor(width * 0.5), top: Math.round(height * 0.45), width: Math.floor(width * 0.5), height: Math.floor(height * 0.55), upscale: 2400 },
        { label: 'upper details', left: Math.round(width * 0.58), top: 0, width: Math.round(width * 0.26), height: Math.round(height * 0.48), upscale: 2600 },
        { label: 'right detail column', left: Math.round(width * 0.58), top: Math.round(height * 0.18), width: Math.round(width * 0.28), height: Math.round(height * 0.34), upscale: 2600 },
        { label: 'column title strip', left: Math.round(width * 0.62), top: Math.round(height * 0.34), width: Math.round(width * 0.18), height: Math.round(height * 0.16), upscale: 2200 },
        { label: 'lower-left details', left: 0, top: Math.round(height * 0.62), width: Math.round(width * 0.43), height: Math.round(height * 0.38), upscale: 2600 },
        { label: 'foundation title strip', left: Math.round(width * 0.02), top: Math.round(height * 0.79), width: Math.round(width * 0.32), height: Math.round(height * 0.14), upscale: 2400 },
        { label: 'lower-middle details', left: Math.round(width * 0.32), top: Math.round(height * 0.62), width: Math.round(width * 0.36), height: Math.round(height * 0.38), upscale: 2400 },
        { label: 'lower-right details', left: Math.round(width * 0.56), top: Math.round(height * 0.58), width: Math.round(width * 0.30), height: Math.round(height * 0.32), upscale: 2400 },
    ].filter(region => region.width > 80 && region.height > 80);

    const images = [];
    for (const region of regions) {
        const left = Math.max(0, Math.min(width - 1, region.left));
        const top = Math.max(0, Math.min(height - 1, region.top));
        const cropWidth = Math.max(1, Math.min(width - left, region.width));
        const cropHeight = Math.max(1, Math.min(height - top, region.height));
        const common = base.clone()
            .extract({ left, top, width: cropWidth, height: cropHeight })
            .resize({ width: region.upscale, fit: 'inside', withoutEnlargement: false })
            .sharpen();

        images.push({ label: region.label, buffer: await common.clone().png().toBuffer() });
        images.push({ label: `${region.label} high contrast`, buffer: await common.clone().threshold(175).png().toBuffer() });
    }

    return images;
}

async function extractTextWithOcr(imageBuffer) {
    const worker = await createWorker('eng', 1, {
        corePath: path.join(__dirname, '..', 'node_modules', 'tesseract.js-core'),
        langPath: engData.langPath,
        cacheMethod: 'none',
        gzip: engData.gzip,
    });
    try {
        await worker.setParameters({
            tessedit_pageseg_mode: PSM.SPARSE_TEXT,
            preserve_interword_spaces: '1',
            user_defined_dpi: '300',
        });
        const images = await prepareOcrImages(imageBuffer);
        const textBlocks = [];

        for (const image of images) {
            const result = await worker.recognize(image.buffer);
            const text = result?.data?.text || '';
            if (text.trim()) textBlocks.push(text);
        }

        return textBlocks.join('\n\n');
    } finally {
        await worker.terminate();
    }
}

function buildUdaResponse(rawText) {
    const rules = checkUdaRulesFromText(rawText);
    const passCount = rules.filter(rule => rule.status === 'pass').length;
    const failCount = rules.filter(rule => rule.status === 'fail').length;
    const reviewCount = rules.filter(rule => rule.status === 'not_verifiable').length;
    const readable = String(rawText || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean).join(' ');

    return {
        status: 'success',
        overall_status: passCount === rules.length ? 'pass' : (failCount > 0 ? 'fail' : 'not_verifiable'),
        summary: {
            total: rules.length,
            passed: passCount,
            failed: failCount,
            manual_review: reviewCount,
        },
        rules,
        extracted_text_summary: readable
            ? readable.slice(0, 280) + (readable.length > 280 ? '...' : '')
            : 'No readable sheet labels were extracted. Upload a clearer plan sheet or review manually.',
        disclaimer: 'This is an OCR-based preliminary UDA drawing-sheet completeness check and does not replace professional approval review.',
    };
}

exports.analyzePlan = async (req, res) => {
    try {
        const { files } = req;
        // Accept field names: svg, png, image (legacy)
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

        // Convert PDF page 1 → PNG buffer
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

        // Every upload — SVG, PNG, JPEG/JPG, or a PDF already converted above —
        // goes through real YOLO detection on the pixels. An SVG is rasterized
        // first (sharp/librsvg, which also neutralizes any embedded scripts);
        // nothing reads pre-existing vector labels out of it anymore.
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

        let response;
        try {
            response = await axios.post(`${MODEL_SERVICE_URL}/predict`, form, {
                headers: form.getHeaders(),
                maxBodyLength: Infinity,
            });
        } catch (modelErr) {
            const detail = modelErr.response?.data?.detail ||
                           modelErr.response?.data?.error ||
                           modelErr.message ||
                           modelErr.code ||
                           'Connection failed';
            console.error('Model service error:', detail);

            const status = modelErr.response?.status === 422 ? 422 : 503;
            return res.status(status).json({
                error: status === 422 ? detail : 'Blueprint detection failed. Check the Python model server and try again.',
                detail,
            });
        }

        const result = response.data;
        const mode = isSvg ? 'svg' : 'yolo';  // records the original file type, not the analysis method — both use YOLO now

        // Map per-room data from ML response
        const rooms = (result.rooms || []).map((r, i) => ({
            name:        r.name      || `Room ${i + 1}`,
            confidence:  r.confidence,
            type:        r.type      || 'other',
            doors:       r.doors     || 0,
            windows:     r.windows   || 0,
            walls:       r.walls     ?? undefined,
            area_sqft:   r.area_sqft ?? undefined,
            wallAreaPx2: r.area_px2  || 0,
            compliance:  r.compliance || undefined,
        }));

        // Save to MongoDB
        const analysis = new Analysis({
            analysisSource: result.analysis_source,
            modelName: result.model_name,
            notice: result.notice,
            fileName:         imageName,
            mode,
            counts:           result.counts || {},
            roomNames:        rooms.map(r => r.name),
            rooms,
            lowConfidence:    result.low_confidence || false,
            compliance:       result.compliance || undefined,
            approvalChecklist: result.approval_checklist || undefined,
        });

        let savedAnalysis = null;
        if (Analysis.db.readyState === 1) {
            try {
                savedAnalysis = await analysis.save();
            } catch (saveErr) {
                console.warn('Analysis history save skipped:', saveErr.message);
            }
        } else {
            console.warn('Analysis history save skipped: MongoDB is not connected.');
        }

        res.status(201).json({
            message: savedAnalysis ? 'Analysis completed and saved' : 'Analysis completed (history save skipped)',
            data:    savedAnalysis || analysis,
            overlay: result.overlay,
            detections: result.detections,
            modelName: result.model_name,
            notice: result.notice,
            rooms,
            compliance: result.compliance,
            approvalChecklist: result.approval_checklist,
            analysisSource: result.analysis_source,
            geminiError: result.gemini_error,
            lowConfidence: result.low_confidence || false,
        });

    } catch (error) {
        console.error('Analysis Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error during analysis' });
    }
};

exports.checkUdaRules = async (req, res) => {
    try {
        const { files } = req;
        if (!files || (!files.svg && !files.png && !files.image)) {
            return res.status(400).json({ error: 'A drawing sheet image (PNG, JPG, PDF, or SVG) is required.' });
        }

        let imageFile = files.svg ? files.svg[0] : (files.png ? files.png[0] : files.image[0]);
        let imageBuffer = imageFile.buffer;
        let imageName = imageFile.originalname;
        const isPdf = imageName.toLowerCase().endsWith('.pdf') ||
                      imageFile.mimetype === 'application/pdf';
        const isSvg = !!files.svg || imageName.toLowerCase().endsWith('.svg') ||
                      imageFile.mimetype === 'image/svg+xml';

        if (isPdf) {
            try {
                imageBuffer = await pdfToPngBuffer(imageBuffer);
                imageName = imageName.replace(/\.pdf$/i, '_page1.png');
            } catch (pdfErr) {
                console.error('UDA PDF conversion failed:', pdfErr.message);
                return res.status(422).json({
                    error: 'PDF conversion failed. Make sure pdf2pic and poppler are installed.',
                    detail: pdfErr.message,
                });
            }
        }

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
                console.error('UDA SVG conversion failed:', svgErr.message);
                return res.status(422).json({
                    error: 'SVG conversion failed. Please check the file is a valid SVG.',
                    detail: svgErr.message,
                });
            }
        }

        const rawText = await extractTextWithOcr(imageBuffer);
        res.status(200).json(buildUdaResponse(rawText));
    } catch (error) {
        console.error('UDA Rules Analysis Error:', error.message);
        res.status(500).json({
            error: 'OCR analysis failed. Make sure tesseract.js dependencies are installed and the uploaded sheet is a valid image.',
            detail: error.message,
        });
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
