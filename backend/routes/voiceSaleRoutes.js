const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    parseVoiceSale,
    getPendingSales,
    getAllVoiceSales,
    confirmSale,
    rejectSale,
    updateSaleItems
} = require('../controllers/voiceSaleController');

// Parse and save voice sale
router.post('/parse', auth, parseVoiceSale);

// Get pending sales
router.get('/pending', auth, getPendingSales);

// Get all voice sales
router.get('/all', auth, getAllVoiceSales);

// Confirm a voice sale
router.post('/:id/confirm', auth, confirmSale);

// Reject a voice sale
router.post('/:id/reject', auth, rejectSale);

// Update items in pending sale
router.put('/:id/items', auth, updateSaleItems);

module.exports = router;
