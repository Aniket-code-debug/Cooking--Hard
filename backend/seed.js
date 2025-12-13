const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Supplier = require('./models/Supplier');
const Product = require('./models/Product');
const Batch = require('./models/Batch');
const bcrypt = require('bcryptjs');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kirana_inventory')
    .then(() => seed())
    .catch(err => {
        console.error("DB Connection Error:", err);
        process.exit(1);
    });

async function seed() {
    try {
        console.log('Clearing old data...');
        await User.deleteMany({});
        await Supplier.deleteMany({});
        await Product.deleteMany({});
        await Batch.deleteMany({});

        // 1. Create User
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await User.create({
            shopName: 'Apna Kirana Store',
            ownerName: 'Rahul Kumar',
            email: 'admin@kirana.com',
            password: hashedPassword,
            phone: '9876543210',
            address: 'Mumbai, India'
        });
        console.log('User created: admin@kirana.com / password123');

        // 2. Create Suppliers
        const s1 = await Supplier.create({ user: user._id, name: 'Metro Cash & Carry', phone: '022-12345678', address: 'Bhandup' });
        const s2 = await Supplier.create({ user: user._id, name: 'Local Mandi', phone: '9988776655', address: 'Dadar' });
        console.log('Suppliers created');

        // 3. Create Products
        const p1 = await Product.create({ user: user._id, name: 'Fortune Oil (1L)', category: 'Oil', unit: 'pc', minStockLevel: 10 });
        const p2 = await Product.create({ user: user._id, name: 'Basmati Rice', category: 'Grain', unit: 'kg', minStockLevel: 50 });
        const p3 = await Product.create({ user: user._id, name: 'Colgate Toothpaste', category: 'Personal Care', unit: 'pc', minStockLevel: 20 });
        console.log('Products created');

        // 4. Create Batches (Initial stock)
        await Batch.create({
            product: p1._id, batchNumber: 'B001', expiryDate: new Date('2025-12-31'),
            mrp: 150, purchaseRate: 120, sellingPrice: 140, quantity: 50
        });
        await Batch.create({
            product: p2._id, batchNumber: 'RICE01', expiryDate: new Date('2026-06-30'),
            mrp: 80, purchaseRate: 60, sellingPrice: 75, quantity: 100
        });
        await Batch.create({
            product: p3._id, batchNumber: 'COL001', expiryDate: new Date('2026-01-01'),
            mrp: 50, purchaseRate: 35, sellingPrice: 45, quantity: 100
        });

        console.log('Database seeded successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
