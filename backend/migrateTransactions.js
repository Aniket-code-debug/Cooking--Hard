/**
 * Enhanced Migration Script: Backfill Transactions with Smart Pricing
 * This script creates transactions even when products don't have prices
 * by using fallback estimation based on purchase rates or default values
 */

const mongoose = require('mongoose');
const VoiceSale = require('./models/VoiceSale');
const Purchase = require('./models/Purchase');
const Product = require('./models/Product');
const Batch = require('./models/Batch');
const Transaction = require('./models/Transaction');
const SupplierTransaction = require('./models/SupplierTransaction');
const Supplier = require('./models/Supplier');
require('dotenv').config();

const backfillTransactionsEnhanced = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        let totalSalesAmount = 0;
        let salesCount = 0;
        let purchasesAmount = 0;
        let purchasesCount = 0;

        // 1. Backfill Voice Sales → Transactions
        console.log('\n📊 Backfilling Voice Sales...');
        const confirmedSales = await VoiceSale.find({ status: 'confirmed' }).sort({ createdAt: 1 });

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

            // Calculate total amount with smart fallbacks
            let totalAmount = 0;
            const itemsToProcess = sale.confirmedItems || sale.items;

            for (const item of itemsToProcess) {
                if (item.productId) {
                    const product = await Product.findById(item.productId);

                    let itemPrice = 0;

                    if (product && product.sellingPrice > 0) {
                        // Use product selling price
                        itemPrice = product.sellingPrice;
                    } else if (product && product.costPrice > 0) {
                        // Use cost price + 20% margin
                        itemPrice = product.costPrice * 1.2;
                    } else {
                        // Find from batches
                        const batch = await Batch.findOne({ product: item.productId }).sort({ createdAt: -1 });
                        if (batch && batch.sellingPrice > 0) {
                            itemPrice = batch.sellingPrice;
                        } else if (batch && batch.mrp > 0) {
                            itemPrice = batch.mrp;
                        } else {
                            // Fallback: estimate based on unit (rough estimate for demo data)
                            if (product) {
                                if (product.unit === 'kg') itemPrice = 50;
                                else if (product.unit === 'ltr') itemPrice = 60;
                                else itemPrice = 20; // per piece
                            } else {
                                itemPrice = 10; // minimum fallback
                            }
                        }
                    }

                    totalAmount += itemPrice * item.quantity;
                }
            }

            // Always create transaction even if small amount
            if (totalAmount === 0) {
                totalAmount = 10; // Minimum transaction value
            }

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

            totalSalesAmount += totalAmount;
            salesCount++;
            console.log(`✓ Created transaction for voice sale ${sale._id}: ₹${totalAmount} (Balance: ₹${newBalance})`);
        }

        // 2. Backfill Purchases → SupplierTransactions
        console.log('\n📦 Backfilling Purchases...');
        const purchases = await Purchase.find({}).sort({ date: 1, createdAt: 1 });

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

            purchasesAmount += purchase.totalAmount;
            purchasesCount++;
            console.log(`✓ Created supplier transaction for purchase ${purchase._id}: ₹${purchase.totalAmount} (Supplier balance: ₹${newBalance})`);
        }

        console.log('\n✅ Migration completed successfully!');
        console.log(`\n📈 Summary:`);
        console.log(`   Sales: ${salesCount} transactions, Total: ₹${totalSalesAmount.toLocaleString('en-IN')}`);
        console.log(`   Purchases: ${purchasesCount} transactions, Total: ₹${purchasesAmount.toLocaleString('en-IN')}`);
        console.log(`   Net Cash Flow: ₹${(totalSalesAmount).toLocaleString('en-IN')}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

backfillTransactionsEnhanced();
