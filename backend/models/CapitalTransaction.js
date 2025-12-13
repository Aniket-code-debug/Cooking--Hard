const mongoose = require('mongoose');

const capitalTransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true }, // CREDIT = Inflow, DEBIT = Outflow
    category: { type: String, enum: ['SALES', 'PURCHASE', 'EXPENSE', 'INVESTMENT', 'WITHDRAWAL'], required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    mode: { type: String, enum: ['CASH', 'BANK', 'UPI'], default: 'CASH' },
    description: { type: String }
});

module.exports = mongoose.model('CapitalTransaction', capitalTransactionSchema);
