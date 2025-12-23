const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['SALE', 'PAYMENT', 'EXPENSE', 'PURCHASE'],
        required: true
    },
    direction: {
        type: String,
        enum: ['IN', 'OUT'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'referenceModel'
    },
    referenceModel: {
        type: String,
        enum: ['Sale', 'VoiceSale', 'Purchase', 'Payment', 'SupplierTransaction', null]
    },
    balance: {
        type: Number,
        required: true
    },
    isSystemGenerated: {
        type: Boolean,
        default: true
    },
    entrySource: {
        type: String,
        enum: ['SALE', 'VOICE_AI', 'MANUAL', 'SYSTEM'],
        default: 'SYSTEM'
    },
    paymentMode: {
        type: String,
        enum: ['CASH', 'UPI', 'BANK', 'CREDIT', null],
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Compound index for efficient ledger queries
transactionSchema.index({ user: 1, createdAt: -1 });

// Unique index to prevent duplicate transactions
transactionSchema.index({ referenceId: 1, referenceModel: 1 }, {
    unique: true,
    sparse: true,
    partialFilterExpression: { referenceId: { $exists: true } }
});

module.exports = mongoose.model('Transaction', transactionSchema);
