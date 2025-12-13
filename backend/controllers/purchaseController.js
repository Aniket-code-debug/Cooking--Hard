const Purchase = require('../models/Purchase');
const Batch = require('../models/Batch');

exports.createPurchase = async (req, res) => {
    try {
        const { supplier, invoiceNumber, date, items, totalAmount, cgst, sgst, igst } = req.body;
        // items: [{ product, batchNumber, expiryDate, mrp, purchaseRate, sellingPrice, quantity, total }]

        const purchaseItems = [];

        for (const item of items) {
            // Create Batch for each item
            const batch = new Batch({
                product: item.product,
                batchNumber: item.batchNumber,
                expiryDate: item.expiryDate,
                mrp: item.mrp,
                purchaseRate: item.purchaseRate,
                sellingPrice: item.sellingPrice,
                quantity: item.quantity,
                onlineStock: 0 // Purchases default to offline stock usually, or can be split. Assuming offline.
            });
            await batch.save();

            purchaseItems.push({
                product: item.product,
                batch: batch._id,
                quantity: item.quantity,
                rate: item.purchaseRate,
                amount: item.quantity * item.purchaseRate
            });
        }

        const purchase = new Purchase({
            user: req.user.id,
            supplier,
            invoiceNumber,
            date,
            totalAmount,
            cgst, sgst, igst,
            items: purchaseItems
        });

        await purchase.save();
        res.status(201).json(purchase);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find({ user: req.user.id }).populate('supplier').populate('items.product').sort({ date: -1 });
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
