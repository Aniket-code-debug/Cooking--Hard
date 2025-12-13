const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    invoiceNumber: { type: String },
    date: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
        quantity: { type: Number, required: true },
        rate: { type: Number, required: true },
        amount: { type: Number, required: true },
    }]
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
