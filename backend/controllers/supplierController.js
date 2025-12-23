const Supplier = require('../models/Supplier');

exports.createSupplier = async (req, res) => {
    try {
        const { name, phone, gstin, address } = req.body;
        const supplier = new Supplier({
            user: req.user._id,
            name, phone, gstin, address
        });
        await supplier.save();
        res.status(201).json(supplier);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find({ user: req.user._id });
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get supplier by ID
exports.getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!supplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }

        res.json(supplier);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
