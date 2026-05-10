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
    imageUrl: String,
    lowConfidence: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Analysis', AnalysisSchema);
