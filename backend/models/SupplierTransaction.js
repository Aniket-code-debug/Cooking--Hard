const mongoose = require('mongoose');

const supplierTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['PURCHASE', 'PAYMENT', 'ADJUSTMENT'],
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
        enum: ['Purchase', 'Payment', null]
    },
    balance: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Compound index for efficient supplier ledger queries
supplierTransactionSchema.index({ supplier: 1, createdAt: -1 });
supplierTransactionSchema.index({ user: 1, supplier: 1 });

// Unique index to prevent duplicate transactions
supplierTransactionSchema.index({ referenceId: 1, referenceModel: 1 }, {
    unique: true,
    sparse: true,
    partialFilterExpression: { referenceId: { $exists: true } }
});

module.exports = mongoose.model('SupplierTransaction', supplierTransactionSchema);
