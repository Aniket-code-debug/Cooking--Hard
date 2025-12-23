import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, Plus, Trash2, IndianRupee, User, CreditCard } from 'lucide-react';

const Sales = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const { showToast } = useToast();

    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [customerName, setCustomerName] = useState('');
    const [paymentMode, setPaymentMode] = useState('CASH');
    const [loading, setLoading] = useState(false);
    const [recentSales, setRecentSales] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchRecentSales();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/inventory/products`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRecentSales = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/sales?limit=10`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setRecentSales(res.data || []);
        } catch (err) {
            console.error('Failed to fetch recent sales:', err);
        }
    };

    const addToCart = () => {
        if (!selectedProduct) {
            showToast('Please select a product', 'warning');
            return;
        }

        const product = products.find(p => p._id === selectedProduct);
        if (!product) return;

        const price = product.sellingPrice || 0;

        // Check if already in cart
        const existingIndex = cart.findIndex(item => item.productId === selectedProduct);

        if (existingIndex >= 0) {
            // Update quantity
            const newCart = [...cart];
            newCart[existingIndex].quantity += parseFloat(quantity);
            setCart(newCart);
        } else {
            // Add new item
            setCart([...cart, {
                productId: selectedProduct,
                productName: product.name,
                quantity: parseFloat(quantity),
                rate: price,
                total: price * parseFloat(quantity)
            }]);
        }

        // Reset inputs
        setSelectedProduct('');
        setQuantity(1);
        showToast('Added to cart', 'success');
    };

    const removeFromCart = (index) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + item.total, 0);
    };

    const completeSale = async () => {
        if (cart.length === 0) {
            showToast('Cart is empty', 'warning');
            return;
        }

        setLoading(true);
        try {
            const saleData = {
                items: cart.map(item => ({
                    product: item.productId,
                    quantity: item.quantity,
                    rate: item.rate
                })),
                totalAmount: calculateTotal(),
                paymentMode,
                customerName: customerName || undefined
            };

            await axios.post(`${API_URL}/api/sales`, saleData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            showToast(`Sale completed! ₹${calculateTotal().toLocaleString('en-IN')}`, 'success');

            // Reset form
            setCart([]);
            setCustomerName('');
            setPaymentMode('CASH');

            // Refresh data
            fetchProducts();
            fetchRecentSales();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to complete sale', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-20">
            <div className="mb-6">
                <h1 className="text-3xl font-bold dark:text-white mb-2">Sales</h1>
                <p className="text-gray-600 dark:text-gray-400">Record customer sales and track revenue</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Sale Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Add Item Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border-2 border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold dark:text-white mb-4 flex items-center">
                            <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                            Add Items to Sale
                        </h2>

                        <div className="space-y-4">
                            {/* Product Selection */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                                        Product
                                    </label>
                                    <select
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="">Select product...</option>
                                        {products.map(p => (
                                            <option key={p._id} value={p._id}>
                                                {p.name} {p.sellingPrice ? `- ₹${p.sellingPrice}` : ''}
                                                {p.totalStock ? ` (Stock: ${p.totalStock})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        min="0.1"
                                        step="0.1"
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={addToCart}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add to Cart
                            </button>
                        </div>
                    </div>

                    {/* Cart Items Section */}
                    {cart.length > 0 && (
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-md border-2 border-green-300 dark:border-green-600">
                            <h3 className="font-bold text-lg dark:text-white mb-4 flex items-center">
                                <ShoppingCart className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                                Cart Items ({cart.length})
                            </h3>

                            <div className="space-y-2 mb-4">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
                                        <div className="flex-1">
                                            <p className="font-medium dark:text-white">{item.productName}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {item.quantity} × ₹{item.rate} = ₹{item.total.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(idx)}
                                            className="text-red-500 hover:text-red-700 ml-3"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t-2 border-green-300 dark:border-green-600 pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-bold dark:text-white">Total:</span>
                                    <span className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center">
                                        <IndianRupee className="w-6 h-6" />
                                        {calculateTotal().toLocaleString('en-IN')}
                                    </span>
                                </div>

                                {/* Payment & Customer Info */}
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium dark:text-gray-200 mb-1 flex items-center">
                                            <CreditCard className="w-4 h-4 mr-1" />
                                            Payment Mode
                                        </label>
                                        <select
                                            value={paymentMode}
                                            onChange={(e) => setPaymentMode(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="CASH">Cash</option>
                                            <option value="UPI">UPI</option>
                                            <option value="CARD">Card</option>
                                            <option value="BANK">Bank Transfer</option>
                                            <option value="CREDIT">Credit (Pay Later)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium dark:text-gray-200 mb-1 flex items-center">
                                            <User className="w-4 h-4 mr-1" />
                                            Customer (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Customer name"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={completeSale}
                                    disabled={loading}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 shadow-lg"
                                >
                                    {loading ? 'Processing...' : '✓ Complete Sale'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Recent Sales */}
                <div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                        <h2 className="text-xl font-semibold dark:text-white mb-4">Recent Sales</h2>
                        <div className="space-y-3">
                            {recentSales.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                    No sales yet
                                </p>
                            ) : (
                                recentSales.map((sale, idx) => (
                                    <div key={sale._id || idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(sale.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">
                                                {sale.paymentMode || 'CASH'}
                                            </span>
                                        </div>
                                        <p className="font-semibold dark:text-white flex items-center">
                                            <IndianRupee className="w-4 h-4" />
                                            {(sale.totalAmount || 0).toLocaleString('en-IN')}
                                        </p>
                                        {sale.customerName && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {sale.customerName}
                                            </p>
                                        )}
                                        {sale.items && sale.items.length > 0 && (
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                {sale.items.length} item(s)
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sales;
