const express = require('express');
const router = express.Router();
const multer = require('multer');
const analysisController = require('../controllers/analysisController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadFields = upload.fields([
    { name: 'png', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'svg', maxCount: 1 }
]);

router.post('/analyze', uploadFields, analysisController.analyzePlan);
router.get('/history', analysisController.getHistory);

module.exports = router;
