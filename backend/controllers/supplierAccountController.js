const SupplierTransaction = require('../models/SupplierTransaction');
const Supplier = require('../models/Supplier');
const { calculateSupplierBalance, getCurrentSupplierBalance } = require('../utils/balanceCalculator');

// Get supplier account/ledger
exports.getSupplierAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate, type } = req.query;

        const supplier = await Supplier.findOne({ _id: id, user: req.user._id });

        if (!supplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }

        const filter = { supplier: id };

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Type filter
        if (type) filter.type = type;

        const transactions = await SupplierTransaction.find(filter)
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({
            supplier,
            transactions,
            balance: supplier.currentBalance
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Record payment to supplier
exports.recordPayment = async (req, res) => {
    const session = await require('mongoose').startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const { amount, description, paymentMode = 'Cash' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const supplier = await Supplier.findOne({ _id: id, user: req.user._id }).session(session);

        if (!supplier) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Supplier not found' });
        }

        // Calculate new supplier balance
        const newBalance = await calculateSupplierBalance(id, amount, 'PAYMENT');

        // Create supplier transaction
        const supplierTx = await SupplierTransaction.create([{
            user: req.user._id,
            supplier: id,
            type: 'PAYMENT',
            amount,
            description: description || `Payment via ${paymentMode}`,
            balance: newBalance
        }], { session });

        // Update supplier current balance
        supplier.currentBalance = newBalance;
        await supplier.save({ session });

        // Create global cash flow transaction
        const Transaction = require('../models/Transaction');
        const { calculateNewBalance } = require('../utils/balanceCalculator');

        const cashBalance = await calculateNewBalance(req.user._id, amount, 'OUT');

        await Transaction.create([{
            user: req.user._id,
            type: 'PAYMENT',
            direction: 'OUT',
            amount,
            description: `Payment to ${supplier.name}`,
            referenceId: supplierTx[0]._id,
            referenceModel: 'SupplierTransaction',
            balance: cashBalance
        }], { session });

        await session.commitTransaction();

        res.status(201).json({
            message: 'Payment recorded successfully',
            transaction: supplierTx[0],
            newBalance
        });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ error: err.message });
    } finally {
        session.endSession();
    }
};

// Get all supplier balances
exports.getSupplierBalances = async (req, res) => {
    try {
        const suppliers = await Supplier.find({ user: req.user.id })
            .select('name phone currentBalance')
            .sort({ currentBalance: -1 });

        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
