const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    batchNumber: { type: String, required: true },
    expiryDate: { type: Date },
    mrp: { type: Number, required: true },
    purchaseRate: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    onlineStock: { type: Number, default: 0 }, // Separate as requested
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
