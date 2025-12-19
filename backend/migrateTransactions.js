/**
 * Migration Script: Backfill Transactions
 * Run this ONCE to create Transaction and SupplierTransaction entries
 * for all existing VoiceSales and Purchases
 */

const mongoose = require('mongoose');
const VoiceSale = require('./models/VoiceSale');
const Purchase = require('./models/Purchase');
const Product = require('./models/Product');
const Transaction = require('./models/Transaction');
const SupplierTransaction = require('./models/SupplierTransaction');
const Supplier = require('./models/Supplier');
require('dotenv').config();

const backfillTransactions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Backfill Voice Sales → Transactions
        console.log('\n📊 Backfilling Voice Sales...');
        const confirmedSales = await VoiceSale.find({ status: 'confirmed' });

        for (const sale of confirmedSales) {
            // Check if transaction already exists
            const exists = await Transaction.findOne({
                referenceId: sale._id,
                referenceModel: 'VoiceSale'
            });

            if (exists) {
                console.log(`✓ Transaction already exists for sale ${sale._id}`);
                continue;
            }

            // Calculate total amount
            let totalAmount = 0;
            const itemsToProcess = sale.confirmedItems || sale.items;

            for (const item of itemsToProcess) {
                if (item.productId) {
                    const product = await Product.findById(item.productId);
                    if (product && product.sellingPrice) {
                        totalAmount += product.sellingPrice * item.quantity;
                    }
                }
            }

            if (totalAmount > 0) {
                // Get last balance
                const lastTx = await Transaction.findOne({ user: sale.user })
                    .sort({ createdAt: -1 })
                    .select('balance');

                const currentBalance = lastTx?.balance || 0;
                const newBalance = currentBalance + totalAmount;

                await Transaction.create({
                    user: sale.user,
                    type: 'SALE',
                    direction: 'IN',
                    amount: totalAmount,
                    description: `Voice Sale - "${sale.voiceText}"`,
                    referenceId: sale._id,
                    referenceModel: 'VoiceSale',
                    balance: newBalance,
                    isSystemGenerated: true,
                    entrySource: 'VOICE_AI',
                    paymentMode: 'CASH',
                    createdAt: sale.reviewedAt || sale.createdAt
                });

                console.log(`✓ Created transaction for voice sale ${sale._id}: ₹${totalAmount}`);
            }
        }

        // 2. Backfill Purchases → SupplierTransactions
        console.log('\n📦 Backfilling Purchases...');
        const purchases = await Purchase.find({});

        for (const purchase of purchases) {
            // Check if supplier transaction already exists
            const exists = await SupplierTransaction.findOne({
                referenceId: purchase._id,
                referenceModel: 'Purchase'
            });

            if (exists) {
                console.log(`✓ Supplier transaction already exists for purchase ${purchase._id}`);
                continue;
            }

            if (!purchase.supplier) {
                console.log(`⚠️ Purchase ${purchase._id} has no supplier, skipping`);
                continue;
            }

            // Get last supplier balance
            const lastTx = await SupplierTransaction.findOne({ supplier: purchase.supplier })
                .sort({ createdAt: -1 })
                .select('balance');

            const currentBalance = lastTx?.balance || 0;
            const newBalance = currentBalance + purchase.totalAmount;

            await SupplierTransaction.create({
                user: purchase.user,
                supplier: purchase.supplier,
                type: 'PURCHASE',
                amount: purchase.totalAmount,
                description: `Purchase - Invoice #${purchase.invoiceNumber}`,
                referenceId: purchase._id,
                referenceModel: 'Purchase',
                balance: newBalance,
                isSystemGenerated: true,
                entrySource: 'PURCHASE',
                createdAt: purchase.date || purchase.createdAt
            });

            // Update supplier cached balance
            const supplier = await Supplier.findById(purchase.supplier);
            if (supplier) {
                supplier.currentBalance = newBalance;
                await supplier.save();
            }

            console.log(`✓ Created supplier transaction for purchase ${purchase._id}: ₹${purchase.totalAmount}`);
        }

        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

backfillTransactions();
