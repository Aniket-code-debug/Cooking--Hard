const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware);

router.post('/products', inventoryController.createProduct);
router.get('/products', inventoryController.getProducts);

router.post('/batches', inventoryController.addBatch);
router.get('/products/:productId/batches', inventoryController.getBatches);

router.post('/adjust', inventoryController.adjustStock);
router.post('/quick-adjust', inventoryController.quickAdjust);
router.get('/alerts', inventoryController.getAlerts);

module.exports = router;
