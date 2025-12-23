const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const supplierAccountController = require('../controllers/supplierAccountController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', supplierController.createSupplier);
router.get('/', supplierController.getSuppliers);

// IMPORTANT: Specific routes MUST come BEFORE generic /:id routes
// Supplier account management - these are specific
router.get('/balances', supplierAccountController.getSupplierBalances);
router.get('/:id/account', supplierAccountController.getSupplierAccount);
router.post('/:id/payment', supplierAccountController.recordPayment);

// Generic route - MUST be last
router.get('/:id', supplierController.getSupplierById);

module.exports = router;
