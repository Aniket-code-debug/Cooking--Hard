const CapitalTransaction = require('../models/CapitalTransaction');

exports.addTransaction = async (req, res) => {
    try {
        const { type, category, amount, date, mode, description } = req.body;
        const transaction = new CapitalTransaction({
            user: req.user.id,
            type, category, amount, date, mode, description
        });
        await transaction.save();
        res.status(201).json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await CapitalTransaction.find({ user: req.user.id }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSummary = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const stats = await CapitalTransaction.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    totalCredit: {
                        $sum: { $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0] }
                    },
                    totalDebit: {
                        $sum: { $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0] }
                    },
                    cashInHand: {
                        $sum: {
                            $cond: [
                                { $eq: ["$mode", "CASH"] },
                                { $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", { $multiply: ["$amount", -1] }] },
                                0
                            ]
                        }
                    },
                    bankBalance: {
                        $sum: {
                            $cond: [
                                { $in: ["$mode", ["BANK", "UPI"]] },
                                { $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", { $multiply: ["$amount", -1] }] },
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        res.json(stats[0] || { totalCredit: 0, totalDebit: 0, cashInHand: 0, bankBalance: 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
