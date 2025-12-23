const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        rate: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMode: {
        type: String,
        enum: ['CASH', 'UPI', 'CARD', 'BANK', 'CREDIT'],
        default: 'CASH'
    },
    customerName: {
        type: String
    },
    status: {
        type: String,
        enum: ['COMPLETED', 'PENDING', 'CANCELLED'],
        default: 'COMPLETED'
    }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
