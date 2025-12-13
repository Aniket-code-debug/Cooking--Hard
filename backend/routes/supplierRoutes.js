const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', supplierController.createSupplier);
router.get('/', supplierController.getSuppliers);

module.exports = router;
