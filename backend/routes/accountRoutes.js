const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const cashflowController = require('../controllers/cashflowController');

// All routes require authentication
router.use(authMiddleware);

// GET /api/account/overview - Get account dashboard
router.get('/overview', cashflowController.getAccountOverview);

module.exports = router;
