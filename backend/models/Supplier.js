const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    gstin: { type: String },
    address: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
