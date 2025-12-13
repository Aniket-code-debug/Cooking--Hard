const express = require('express');
const router = express.Router();
const capitalController = require('../controllers/capitalController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', capitalController.addTransaction);
router.get('/', capitalController.getTransactions);
router.get('/summary', capitalController.getSummary);

module.exports = router;
