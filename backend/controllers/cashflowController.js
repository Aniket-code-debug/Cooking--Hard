const Transaction = require('../models/Transaction');
const SupplierTransaction = require('../models/SupplierTransaction');
const Supplier = require('../models/Supplier');
const { calculateNewBalance, getCurrentCashBalance } = require('../utils/balanceCalculator');

// Get global cash flow ledger
exports.getCashFlow = async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;

        const filter = { user: req.user.id };

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Type filter
        if (type) filter.type = type;

        const transactions = await Transaction.find(filter)
            .sort({ createdAt: -1 })
            .limit(100);

        const currentBalance = await getCurrentCashBalance(req.user.id);

        res.json({
            transactions,
            currentBalance
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create manual cash entry
exports.createCashEntry = async (req, res) => {
    try {
        const { type, amount, description, direction } = req.body;

        if (!['PAYMENT', 'EXPENSE'].includes(type)) {
            return res.status(400).json({ error: 'Invalid type for manual entry' });
        }

        const balance = await calculateNewBalance(req.user.id, amount, direction);

        const transaction = await Transaction.create({
            user: req.user.id,
            type,
            direction,
            amount,
            description,
            balance
        });

        res.status(201).json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get account overview dashboard
exports.getAccountOverview = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get current cash balance
        const cashInHand = await getCurrentCashBalance(userId);

        // Get all supplier balances
        const suppliers = await Supplier.find({ user: userId });

        let totalPayables = 0;
        let totalReceivables = 0;

        suppliers.forEach(supplier => {
            if (supplier.currentBalance < 0) {
                totalPayables += Math.abs(supplier.currentBalance);
            } else {
                totalReceivables += supplier.currentBalance;
            }
        });

        // Calculate monthly revenue (current month sales)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyRevenue = await Transaction.aggregate([
            {
                $match: {
                    user: req.user.id,
                    type: 'SALE',
                    createdAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // Calculate monthly expenses
        const monthlyExpenses = await Transaction.aggregate([
            {
                $match: {
                    user: req.user.id,
                    type: { $in: ['PAYMENT', 'EXPENSE', 'PURCHASE'] },
                    createdAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const revenue = monthlyRevenue[0]?.total || 0;
        const expenses = monthlyExpenses[0]?.total || 0;

        // Bank balance (placeholder - can be added later)
        const bankBalance = 0;

        // Net worth = (Cash + Bank) - Payables + Receivables
        const netWorth = cashInHand + bankBalance - totalPayables + totalReceivables;

        res.json({
            cashInHand,
            bankBalance,
            totalReceivables,
            totalPayables,
            netWorth,
            monthlyRevenue: revenue,
            monthlyExpenses: expenses
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
