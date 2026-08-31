const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    fileName: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ['yolo', 'svg'],
        required: true
    },
    counts: {
        room: { type: Number, default: 0 },
        wall: { type: Number, default: 0 },
        door: { type: Number, default: 0 },
        window: { type: Number, default: 0 }
    },
    roomNames: [String],
    rooms: [{
        name: { type: String, default: '' },
        type: { type: String, default: 'other' },
        doors: { type: Number, default: 0 },
        windows: { type: Number, default: 0 },
        wallAreaPx2: { type: Number, default: 0 },
        compliance: {
            ventilation: Boolean,
            wall_thickness: Boolean,
        },
    }],
    imageUrl: String,
    lowConfidence: {
        type: Boolean,
        default: false
    },
    compliance: {
        has_toilet: Boolean,
        scale_established: Boolean,
    },
    approvalChecklist: [{
        item_no: Number,
        question: String,
        status: { type: String, enum: ['pass', 'fail', 'not_verifiable'] },
        insight: String,
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Analysis', AnalysisSchema);
