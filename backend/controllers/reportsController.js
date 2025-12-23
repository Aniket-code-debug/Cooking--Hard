const Purchase = require('../models/Purchase');

exports.getGstReport = async (req, res) => {
    try {
        const purchases = await Purchase.find({ user: req.user._id });
        let totalCGST = 0;
        let totalSGST = 0;
        let totalIGST = 0;

        purchases.forEach(p => {
            totalCGST += p.cgst || 0;
            totalSGST += p.sgst || 0;
            totalIGST += p.igst || 0;
        });

        res.json({
            totalCGST,
            totalSGST,
            totalIGST,
            totalTax: totalCGST + totalSGST + totalIGST,
            totalPurchases: purchases.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

