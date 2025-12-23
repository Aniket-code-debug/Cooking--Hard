const Product = require('../models/Product');
const Batch = require('../models/Batch');

// Product CRUD
exports.createProduct = async (req, res) => {
    try {
        const { name, category, unit, minStockLevel } = req.body;
        const product = new Product({
            user: req.user._id,
            name, category, unit, minStockLevel
        });
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const userId = new mongoose.Types.ObjectId(req.user._id);

        const products = await Product.aggregate([
            { $match: { user: userId } },
            {
                $lookup: {
                    from: 'batches',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'batches'
                }
            },
            {
                $project: {
                    name: 1,
                    category: 1,
                    unit: 1,
                    minStockLevel: 1,
                    totalStock: { $sum: '$batches.quantity' }
                }
            }
        ]);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Batch operations (Stock In)
exports.addBatch = async (req, res) => {
    try {
        const { productId, batchNumber, expiryDate, mrp, purchaseRate, sellingPrice, quantity, onlineStock } = req.body;

        // basic validation
        if (quantity < 0) return res.status(400).json({ message: "Quantity cannot be negative" });

        const batch = new Batch({
            product: productId,
            batchNumber,
            expiryDate,
            mrp,
            purchaseRate,
            sellingPrice,
            quantity,
            onlineStock: onlineStock || 0
        });
        await batch.save();
        res.status(201).json(batch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBatches = async (req, res) => {
    try {
        const { productId } = req.params;
        const batches = await Batch.find({ product: productId }).sort({ expiryDate: 1 });
        res.json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Adjust Stock (Manual)
// Core logic: Inventory is managed using batch-based stock adjustments
// Adjust Stock (Manual)
// Core logic: Inventory is managed using batch-based stock adjustments
exports.adjustStock = async (req, res) => {
    try {
        const { batchId, quantityChange, isOnline } = req.body;
        // quantityChange can be negative (sale/loss) or positive (correction)

        const batch = await Batch.findById(batchId);
        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        if (isOnline) {
            batch.onlineStock += quantityChange;
            if (batch.onlineStock < 0) return res.status(400).json({ message: 'Insufficient online stock' });
        } else {
            batch.quantity += quantityChange;
            if (batch.quantity < 0) return res.status(400).json({ message: 'Insufficient stock' });
        }

        await batch.save();
        res.json(batch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Quick Adjust (+/-) for Mobile Speed
exports.quickAdjust = async (req, res) => {
    try {
        const { productId, change } = req.body; // change: +1, -1
        const isDeduct = change < 0;

        // Find batches for the product, sorted by expiry (Ascending for FEFO, Descending for newest)
        const sortOrder = isDeduct ? 1 : -1; // 1: Oldest first (FEFO), -1: Newest first
        const batches = await Batch.find({ product: productId, quantity: { $gt: 0 } }).sort({ expiryDate: sortOrder });

        if (batches.length === 0) {
            // If adding and no batches exist, maybe allow? But we need batch info.
            // For now, require at least one batch to exist to "adjust" it.
            return res.status(404).json({ message: 'No active batches found to adjust' });
        }

        let batchToUpdate = batches[0];
        // If adding, maybe pick the one with *most* stock or just newest? Using newest (sort -1)

        // Apply change
        batchToUpdate.quantity += change;
        if (batchToUpdate.quantity < 0) return res.status(400).json({ message: 'Insufficient stock in batch' });

        await batchToUpdate.save();
        res.json({ message: 'Stock updated', batch: batchToUpdate });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Dashboard Alerts
exports.getAlerts = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const userId = new mongoose.Types.ObjectId(req.user._id);

        // 1. Low Stock Alert (Aggregation)
        const lowStockProducts = await Product.aggregate([
            { $match: { user: userId } },
            {
                $lookup: {
                    from: 'batches',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'batches'
                }
            },
            {
                $project: {
                    name: 1,
                    minStockLevel: 1,
                    unit: 1,
                    totalStock: { $sum: '$batches.quantity' }
                }
            },
            { $match: { $expr: { $lte: ['$totalStock', '$minStockLevel'] } } }
        ]);

        // 2. Expiry Alert (Next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        // Find products first to filter batches by user
        const userProducts = await Product.find({ user: userId }).select('_id name');
        const productIds = userProducts.map(p => p._id);
        const productMap = userProducts.reduce((acc, p) => ({ ...acc, [p._id]: p.name }), {});

        const expiringBatches = await Batch.find({
            product: { $in: productIds },
            expiryDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
            quantity: { $gt: 0 }
        }).sort({ expiryDate: 1 });

        // Format expiring batches with product name
        const formattedExpiring = expiringBatches.map(b => ({
            ...b.toObject(),
            productName: productMap[b.product]
        }));

        res.json({
            lowStock: lowStockProducts,
            expiring: formattedExpiring
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

