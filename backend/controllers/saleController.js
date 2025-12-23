const Sale = require('../models/Sale');
const Batch = require('../models/Batch');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Create a new sale
exports.createSale = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items, totalAmount, paymentMode, customerName } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in sale' });
        }

        // Create the sale record
        const sale = new Sale({
            user: req.user.id,
            items,
            totalAmount,
            paymentMode: paymentMode || 'CASH',
            customerName,
            status: 'COMPLETED'
        });

        await sale.save({ session });

        // Deduct inventory using FEFO (First Expiry First Out)
        for (const item of items) {
            let remainingQty = item.quantity;

            // Find batches for this product, sorted by expiry (oldest first)
            const batches = await Batch.find({
                product: item.product,
                quantity: { $gt: 0 }
            }).sort({ expiryDate: 1 }).session(session);

            if (batches.length === 0) {
                throw new Error(`No stock available for product ${item.product}`);
            }

            // Deduct from batches
            for (const batch of batches) {
                if (remainingQty <= 0) break;

                const deductQty = Math.min(batch.quantity, remainingQty);
                batch.quantity -= deductQty;
                remainingQty -= deductQty;

                await batch.save({ session });
            }

            if (remainingQty > 0) {
                throw new Error(`Insufficient stock for product ${item.product}`);
            }
        }

        // Create Transaction (Cash IN)
        const transaction = new Transaction({
            user: req.user.id,
            type: 'SALE',
            direction: 'IN',
            amount: totalAmount,
            category: 'SALES',
            paymentMode: paymentMode || 'CASH',
            description: customerName ? `Sale to ${customerName}` : 'Cash sale',
            relatedSale: sale._id
        });

        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: 'Sale recorded successfully',
            sale,
            transaction
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: err.message });
    }
};

// Get all sales for the user
exports.getSales = async (req, res) => {
    try {
        const { limit = 100 } = req.query;

        const sales = await Sale.find({ user: req.user.id })
            .populate('items.product', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json(sales);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a specific sale by ID
exports.getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate('items.product', 'name sellingPrice');

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        res.json(sale);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

