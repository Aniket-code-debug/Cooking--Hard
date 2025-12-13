const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String },
    unit: { type: String, default: 'pc' }, // pc, kg, ltr
    minStockLevel: { type: Number, default: 5 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
