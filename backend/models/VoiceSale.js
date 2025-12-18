const mongoose = require('mongoose');

const voiceSaleSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    voiceText: {
        type: String,
        required: true
    },
    items: [{
        matchedItemName: {
            type: String,
            required: true
        },
        spokenName: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            required: true
        },
        confidence: {
            type: Number,
            required: true,
            min: 0,
            max: 1
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    }],
    overallConfidence: {
        type: Number,
        required: true
    },
    needsHumanReview: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    confirmedItems: [{
        productId: mongoose.Schema.Types.ObjectId,
        quantity: Number,
        unit: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('VoiceSale', voiceSaleSchema);
