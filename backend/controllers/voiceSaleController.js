const VoiceSale = require('../models/VoiceSale');
const Product = require('../models/Product');
const { parseVoiceSaleWithAI } = require('../services/geminiService');

// Parse voice sale and save to pending queue
exports.parseVoiceSale = async (req, res) => {
    try {
        const { voiceText } = req.body;

        if (!voiceText) {
            return res.status(400).json({ message: 'Voice text is required' });
        }

        // Get user's inventory
        const inventory = await Product.find({ user: req.user._id });

        if (inventory.length === 0) {
            return res.status(400).json({ message: 'No inventory items found. Add products first.' });
        }

        console.log('🎯 About to call Gemini with:', { voiceText, inventoryCount: inventory.length });

        // Match items using Gemini AI
        const matchResult = await parseVoiceSaleWithAI(voiceText, inventory);

        console.log('📊 Gemini returned:', { itemsCount: matchResult.items.length, confidence: matchResult.overallConfidence });

        // Create voice sale record
        const voiceSale = new VoiceSale({
            user: req.user._id,
            voiceText,
            items: matchResult.items,
            overallConfidence: matchResult.overallConfidence,
            needsHumanReview: matchResult.needsHumanReview,
            status: 'pending'
        });

        await voiceSale.save();

        res.status(201).json({
            success: true,
            voiceSale,
            message: 'Voice sale recorded for review'
        });

    } catch (error) {
        console.error('Parse voice sale error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all pending voice sales for user
exports.getPendingSales = async (req, res) => {
    try {
        const pendingSales = await VoiceSale.find({
            user: req.user._id,
            status: 'pending'
        }).sort({ createdAt: -1 });

        res.status(200).json(pendingSales);
    } catch (error) {
        console.error('Get pending sales error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all voice sales (including confirmed/rejected)
exports.getAllVoiceSales = async (req, res) => {
    try {
        const voiceSales = await VoiceSale.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json(voiceSales);
    } catch (error) {
        console.error('Get all voice sales error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Confirm and finalize a voice sale
exports.confirmSale = async (req, res) => {
    try {
        const { id } = req.params;
        const { confirmedItems } = req.body; // Optional: user can edit items

        const voiceSale = await VoiceSale.findOne({
            _id: id,
            user: req.user._id
        });

        if (!voiceSale) {
            return res.status(404).json({ message: 'Voice sale not found' });
        }

        if (voiceSale.status !== 'pending') {
            return res.status(400).json({ message: 'Voice sale already processed' });
        }

        // Update status
        voiceSale.status = 'confirmed';
        voiceSale.reviewedBy = req.user._id;
        voiceSale.reviewedAt = new Date();

        if (confirmedItems) {
            voiceSale.confirmedItems = confirmedItems;
        } else {
            // Use matched items as-is
            voiceSale.confirmedItems = voiceSale.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unit: item.unit
            }));
        }

        await voiceSale.save();

        // Deduct inventory stock using FEFO (First Expiry, First Out)
        const Batch = require('../models/Batch');
        const itemsToDeduct = confirmedItems || voiceSale.confirmedItems;

        for (const item of itemsToDeduct) {
            if (!item.productId || !item.quantity) continue;

            // Find batches for this product, sorted by expiry (oldest first)
            const batches = await Batch.find({
                product: item.productId,
                quantity: { $gt: 0 }
            }).sort({ expiryDate: 1 });

            let remainingToDeduct = item.quantity;

            for (const batch of batches) {
                if (remainingToDeduct <= 0) break;

                const deductAmount = Math.min(batch.quantity, remainingToDeduct);
                batch.quantity -= deductAmount;
                await batch.save();

                remainingToDeduct -= deductAmount;

                console.log(`✅ Deducted ${deductAmount} from batch ${batch._id}, remaining: ${batch.quantity}`);
            }

            if (remainingToDeduct > 0) {
                console.warn(`⚠️ Insufficient stock for ${item.productId}, couldn't deduct ${remainingToDeduct}`);
            }
        }

        // INTEGRATION HOOK: Create cash flow transaction (SALE - cash IN)
        const Transaction = require('../models/Transaction');
        const { calculateNewBalance } = require('../utils/balanceCalculator');

        // Calculate total amount (assuming each item has price from product)
        let totalAmount = 0;
        const Product = require('../models/Product');

        for (const item of itemsToDeduct) {
            if (item.productId) {
                const product = await Product.findById(item.productId);
                if (product && product.sellingPrice) {
                    totalAmount += product.sellingPrice * item.quantity;
                }
            }
        }

        if (totalAmount > 0) {
            const newBalance = await calculateNewBalance(req.user._id, totalAmount, 'IN');

            await Transaction.create({
                user: req.user._id,
                type: 'SALE',
                direction: 'IN',
                amount: totalAmount,
                description: `Voice Sale - "${voiceSale.voiceText}"`,
                referenceId: voiceSale._id,
                referenceModel: 'VoiceSale',
                balance: newBalance,
                isSystemGenerated: true,
                entrySource: 'VOICE_AI',
                paymentMode: 'CASH' // Default to cash, can be updated later
            });
        }

        res.status(200).json({
            success: true,
            voiceSale,
            message: 'Voice sale confirmed and inventory updated successfully'
        });

    } catch (error) {
        console.error('Confirm sale error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Reject a voice sale
exports.rejectSale = async (req, res) => {
    try {
        const { id } = req.params;

        const voiceSale = await VoiceSale.findOne({
            _id: id,
            user: req.user._id
        });

        if (!voiceSale) {
            return res.status(404).json({ message: 'Voice sale not found' });
        }

        voiceSale.status = 'rejected';
        voiceSale.reviewedBy = req.user._id;
        voiceSale.reviewedAt = new Date();

        await voiceSale.save();

        res.status(200).json({
            success: true,
            message: 'Voice sale rejected'
        });

    } catch (error) {
        console.error('Reject sale error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update items in a pending voice sale
exports.updateSaleItems = async (req, res) => {
    try {
        const { id } = req.params;
        const { items } = req.body;

        const voiceSale = await VoiceSale.findOne({
            _id: id,
            user: req.user._id,
            status: 'pending'
        });

        if (!voiceSale) {
            return res.status(404).json({ message: 'Pending voice sale not found' });
        }

        voiceSale.items = items;
        await voiceSale.save();

        res.status(200).json({
            success: true,
            voiceSale
        });

    } catch (error) {
        console.error('Update sale items error:', error);
        res.status(500).json({ message: error.message });
    }
};
