const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const cashflowController = require('../controllers/cashflowController');

// All routes require authentication
router.use(authMiddleware);

// GET /api/cashflow - Get cash flow ledger
router.get('/', cashflowController.getCashFlow);

// POST /api/cashflow/entry - Create manual cash entry
router.post('/entry', cashflowController.createCashEntry);

module.exports = router;
