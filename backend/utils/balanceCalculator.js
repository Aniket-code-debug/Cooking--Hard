const Transaction = require('../models/Transaction');
const SupplierTransaction = require('../models/SupplierTransaction');

/**
 * Calculate new global cash balance after transaction
 */
exports.calculateNewBalance = async (userId, amount, direction) => {
    const lastTx = await Transaction.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .select('balance');

    const currentBalance = lastTx?.balance || 0;

    return direction === 'IN'
        ? currentBalance + amount
        : currentBalance - amount;
};

/**
 * Calculate new supplier balance after transaction
 * PURCHASE increases balance (you owe more)
 * PAYMENT decreases balance (you owe less)
 */
exports.calculateSupplierBalance = async (supplierId, amount, type) => {
    const lastTx = await SupplierTransaction.findOne({ supplier: supplierId })
        .sort({ createdAt: -1 })
        .select('balance');

    const currentBalance = lastTx?.balance || 0;

    return type === 'PURCHASE'
        ? currentBalance + amount  // Debit - increases payable
        : currentBalance - amount; // Credit - decreases payable
};

/**
 * Get current cash balance for user
 */
exports.getCurrentCashBalance = async (userId) => {
    const lastTx = await Transaction.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .select('balance');

    return lastTx?.balance || 0;
};

/**
 * Get current supplier balance
 */
exports.getCurrentSupplierBalance = async (supplierId) => {
    const lastTx = await SupplierTransaction.findOne({ supplier: supplierId })
        .sort({ createdAt: -1 })
        .select('balance');

    return lastTx?.balance || 0;
};
