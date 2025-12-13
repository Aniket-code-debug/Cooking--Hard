const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    shopName: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gstin: { type: String },
    address: { type: String },
    phone: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
