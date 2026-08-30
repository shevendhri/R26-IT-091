const express = require('express');
const router = express.Router();
const multer = require('multer');
const analysisController = require('../controllers/analysisController');

const storage = multer.memoryStorage();

const ALLOWED_MIMETYPES = new Set([
    'image/png',
    'image/jpeg',
    'application/pdf',
    'image/svg+xml',
]);
const ALLOWED_EXTENSIONS = /\.(png|jpe?g|pdf|svg)$/i;

const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIMETYPES.has(file.mimetype) || ALLOWED_EXTENSIONS.test(file.originalname)) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type. Allowed: PNG, JPG, PDF, SVG.'));
        }
    },
});

const uploadFields = upload.fields([
    { name: 'png', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'svg', maxCount: 1 }
]);

function handleUpload(req, res, next) {
    uploadFields(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
    });
}

router.post('/analyze', handleUpload, analysisController.analyzePlan);
router.get('/history', analysisController.getHistory);

module.exports = router;
