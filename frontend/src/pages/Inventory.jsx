import { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Plus, Minus, Search, X, IndianRupee } from 'lucide-react';
import FloatingVoiceMic from '../components/FloatingVoiceMic';

const Inventory = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const { showToast } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: '',
        unit: 'pc',
        minStockLevel: 5,
        sellingPrice: 0,
        costPrice: 0
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/inventory/products`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const addProduct = async () => {
        if (!newProduct.name) {
            showToast('Please enter product name', 'warning');
            return;
        }
        if (newProduct.sellingPrice <= 0) {
            showToast('Please enter a valid selling price', 'warning');
            return;
        }

        try {
            await axios.post(`${API_URL}/api/inventory/products`, newProduct, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            showToast('Product added successfully!', 'success');
            setShowAddModal(false);
            setNewProduct({
                name: '',
                category: '',
                unit: 'pc',
                minStockLevel: 5,
                sellingPrice: 0,
                costPrice: 0
            });
            fetchProducts();
        } catch (err) {
            showToast('Failed to add product: ' + (err.response?.data?.message || err.message), 'error');
        }
    };

    const handleQuickAdjust = async (productId, change) => {
        try {
            await axios.post(`${API_URL}/api/inventory/quick-adjust`, { productId, change }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setProducts(prev => prev.map(p => {
                if (p._id === productId) {
                    return { ...p, totalStock: (p.totalStock || 0) + change };
                }
                return p;
            }));
            fetchProducts();
        } catch (err) {
            showToast('Failed to adjust: ' + (err.response?.data?.message || err.message), 'error');
        }
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="pb-20">
            <div className="sticky top-0 bg-white dark:bg-gfg-bg-dark z-10 pb-4 pt-2">
                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Inventory</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-gfg-green dark:text-white"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-3">
                {filtered.map(p => (
                    <div key={p._id} className="bg-white dark:bg-gfg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center card-3d">
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{p.name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {p.totalStock !== undefined ? `${p.totalStock} ${p.unit}` : 'Stock info unavailable'}
                                </p>
                                {p.sellingPrice > 0 && (
                                    <span className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center">
                                        <IndianRupee className="w-3 h-3" />
                                        {p.sellingPrice}/{p.unit}
                                    </span>
                                )}
                            </div>
                            {p.totalStock <= p.minStockLevel && <span className="text-xs text-red-500 font-bold bg-red-50 px-1 rounded">LOW</span>}
                        </div>

                        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => handleQuickAdjust(p._id, -1)}
                                className="p-3 bg-white dark:bg-gray-700 shadow-sm rounded-md text-red-600 active:scale-95 transition"
                            >
                                <Minus size={20} />
                            </button>
                            <span className="font-bold w-8 text-center dark:text-white">{p.totalStock || 0}</span>
                            <button
                                onClick={() => handleQuickAdjust(p._id, 1)}
                                className="p-3 bg-gfg-green shadow-sm rounded-md text-white active:scale-95 transition"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-36 right-6 md:bottom-24 md:right-24 bg-gfg-green text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-40"
            >
                <Plus size={24} />
            </button>

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold dark:text-white">Add New Product</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                <X size={20} className="dark:text-white" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Product Name *</label>
                                <input
                                    type="text"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="e.g., Sugar, Rice"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium dark:text-gray-300 mb-1">Selling Price * (₹)</label>
                                    <input
                                        type="number"
                                        value={newProduct.sellingPrice}
                                        onChange={e => setNewProduct({ ...newProduct, sellingPrice: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="50"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium dark:text-gray-300 mb-1">Cost Price (₹)</label>
                                    <input
                                        type="number"
                                        value={newProduct.costPrice}
                                        onChange={e => setNewProduct({ ...newProduct, costPrice: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="40"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium dark:text-gray-300 mb-1">Unit</label>
                                    <select
                                        value={newProduct.unit}
                                        onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="pc">Piece (pc)</option>
                                        <option value="kg">Kilogram (kg)</option>
                                        <option value="ltr">Liter (ltr)</option>
                                        <option value="gm">Gram (gm)</option>
                                        <option value="ml">Milliliter (ml)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium dark:text-gray-300 mb-1">Min Stock</label>
                                    <input
                                        type="number"
                                        value={newProduct.minStockLevel}
                                        onChange={e => setNewProduct({ ...newProduct, minStockLevel: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="5"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Category</label>
                                <input
                                    type="text"
                                    value={newProduct.category}
                                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="e.g., Groceries, Snacks"
                                />
                            </div>

                            <button
                                onClick={addProduct}
                                className="w-full bg-gfg-green text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                Add Product
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <FloatingVoiceMic />
        </div>
    );
};

export default Inventory;
