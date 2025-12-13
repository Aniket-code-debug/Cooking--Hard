const Product = require('../models/Product');
const Batch = require('../models/Batch');

// Product CRUD
exports.createProduct = async (req, res) => {
    try {
        const { name, category, unit, minStockLevel } = req.body;
        const product = new Product({
            user: req.user.id,
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
        const products = await Product.find({ user: req.user.id });
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
