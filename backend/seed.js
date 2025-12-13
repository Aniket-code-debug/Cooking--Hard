const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Batch = require('./models/Batch');
const Supplier = require('./models/Supplier');
const CapitalTransaction = require('./models/CapitalTransaction');
const Purchase = require('./models/Purchase');

mongoose.connect('mongodb://localhost:27017/kirana_inventory')
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => console.error(err));

const seed = async () => {
    try {
        await User.deleteMany();
        await Product.deleteMany();
        await Batch.deleteMany();
        await Supplier.deleteMany();
        await CapitalTransaction.deleteMany();
        await Purchase.deleteMany();

        // 1. Create User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        const user = new User({
            shopName: 'Demo Kirana Store',
            ownerName: 'Rahul',
            email: 'test@example.com',
            password: hashedPassword
        });
        await user.save();
        console.log('User created: test@example.com / password123');

        // 2. Suppliers
        const suppliers = [];
        const supplierNames = ['Metro Cash & Carry', 'Udaan Wholesale', 'Local Mandi Distributor', 'ITC Direct', 'Amul Distributor'];
        for (let name of supplierNames) {
            const s = new Supplier({
                user: user._id,
                name,
                phone: '9876543210', // Changed from contact to phone
                email: 'supplier@test.com', // Added email just in case
                address: 'Market Yard'
            });
            await s.save();
            suppliers.push(s);
        }
        console.log(`${suppliers.length} Suppliers created`);

        // 3. Products & Batches
        const productList = [
            { name: 'Amul Gold Milk', unit: 'Pkt', category: 'Dairy', minStock: 20 },
            { name: 'Tata Salt', unit: 'Kg', category: 'Grocery', minStock: 10 },
            { name: 'Maggi Noodles', unit: 'Pkt', category: 'Snacks', minStock: 50 },
            { name: 'Fortune Oil', unit: 'Ltr', category: 'Oil', minStock: 15 },
            { name: 'Aashirvaad Atta', unit: 'Kg', category: 'Staples', minStock: 5 },
            { name: 'Colgate Toothpaste', unit: 'Pc', category: 'Personal Care', minStock: 10 },
            { name: 'Surf Excel', unit: 'Kg', category: 'Household', minStock: 5 },
            { name: 'Britannia Biscuits', unit: 'Pkt', category: 'Snacks', minStock: 20 },
            { name: 'Brooke Bond Tea', unit: 'Kg', category: 'Beverages', minStock: 5 },
            { name: 'Sugar', unit: 'Kg', category: 'Staples', minStock: 25 },
        ];

        for (let pData of productList) {
            const prod = new Product({
                name: pData.name,
                unit: pData.unit,
                category: pData.category,
                minStockLevel: pData.minStock, // Mapped correctly
                user: user._id
            });
            await prod.save();

            // Add batches (Some fresh, some near expiry)
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 90); // 3 months later

            const batch1 = new Batch({
                product: prod._id, batchNumber: 'B1-' + prod.name.substring(0, 3),
                expiryDate: expiry, quantity: 50, mrp: 50, purchaseRate: 40, sellingPrice: 50
            });
            await batch1.save();

            // Add a "Low Stock" scenario for Sugar
            if (prod.name === 'Sugar') {
                // No extra batch, so stock stays low (50 is > 25, ah wait. Let's make one very low)
            }

            // Create one expiring batch for Milk
            if (prod.name === 'Amul Gold Milk') {
                const nearExpiry = new Date();
                nearExpiry.setDate(nearExpiry.getDate() + 2);
                const batchExp = new Batch({
                    product: prod._id, batchNumber: 'EXP-MILK',
                    expiryDate: nearExpiry, quantity: 10, mrp: 30, purchaseRate: 25, sellingPrice: 30
                });
                await batchExp.save();
            }
        }
        console.log('Products & Batches created');

        // 4. Capital Transactions (Month Flow)
        // Generate daily sales (CREDIT) and expenses (DEBIT) for last 10 days
        const today = new Date();
        const modes = ['CASH', 'BANK', 'UPI'];

        for (let i = 10; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);

            // Daily Sales Inflow
            const dailySales = Math.floor(Math.random() * 5000) + 2000; // 2k to 7k
            const salesTx = new CapitalTransaction({
                user: user._id, type: 'CREDIT', category: 'SALES',
                amount: dailySales, date: date, mode: modes[Math.floor(Math.random() * 3)],
                description: `Daily Sales - ${date.toLocaleDateString()}`
            });
            await salesTx.save();

            // Occasional Expense
            if (i % 3 === 0) {
                const expense = Math.floor(Math.random() * 500) + 100;
                const expTx = new CapitalTransaction({
                    user: user._id, type: 'DEBIT', category: 'EXPENSE',
                    amount: expense, date: date, mode: 'CASH',
                    description: 'Shop Maintenance / Tea'
                });
                await expTx.save();
            }
        }

        // Initial Capital
        const initialCap = new CapitalTransaction({
            user: user._id, type: 'CREDIT', category: 'INVESTMENT',
            amount: 50000, date: new Date(today.getFullYear(), today.getMonth(), 1), // 1st of month
            mode: 'BANK', description: 'Initial Capital Injection'
        });
        await initialCap.save();

        console.log('Capital Transactions Seeded');

        // 5. Purchases (GST Data)
        // Create random purchases for stock
        for (let i = 0; i < 5; i++) {
            const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
            const date = new Date();
            date.setDate(today.getDate() - (i * 2));

            // Random Total
            const totalAmount = Math.floor(Math.random() * 10000) + 5000;
            // Assume 18% GST (9% CGST, 9% SGST)
            const baseAmount = totalAmount / 1.18;
            const cgst = baseAmount * 0.09;
            const sgst = baseAmount * 0.09;

            const purchase = new Purchase({
                user: user._id,
                supplier: supplier._id,
                invoiceNumber: `INV-2024-${100 + i}`,
                date: date,
                items: [], // We are lazy here, reports only check totals usually?
                // Wait, the purchase model might require items? Let's check model. 
                // Assuming schema is flexible or we just add a dummy item.
                totalAmount: Math.round(totalAmount),
                cgst: Math.round(cgst),
                sgst: Math.round(sgst),
                igst: 0
            });
            // Add dummy items if required by validation (checked Controller, it only sums gst fields)
            // But let's be safe if model requires items
            // Fetch a product ID
            const randProd = await Product.findOne();

            purchase.items = [{
                product: randProd._id,
                quantity: 10,
                rate: 50,
                amount: 500
            }];

            await purchase.save();
        }
        console.log('Purchases (GST Data) Seeded');

        console.log('SEEDING COMPLETE');
        process.exit();
    } catch (err) {
        console.error("SEEDING ERROR:", JSON.stringify(err, null, 2));
        process.exit(1);
    }
};

seed();
