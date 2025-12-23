import { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Plus, Minus, Search, Package } from 'lucide-react';
import FloatingVoiceMic from '../components/FloatingVoiceMic';

const Inventory = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const { showToast } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Fetch products. Ideally, backend should return total stock already aggregated. 
            // Our current /products doesn't return total stock, assume we fix backend or fetch alerts for stock??
            // Wait, standard /products endpoint might not have stock if it's in batches.
            // Let's modify products endpoint? Or fetch alerts?
            // "getAlerts" returns low stock.
            // Let's assume we need to fetch batch/stock info.
            // Actually, for speed, the /products endpoint SHOULD include query param ?includeStock=true
            // But I haven't implemented that.
            // I'll stick to fetching products and locally fetching batches is too slow.
            // I will use the /alerts endpoint to get stock? No, that only returns LOW stock.
            // I should have optimized /inventory.
            // Valid Strategy: fetch /products. For simplicity (MVP), I will just list products.
            // Stock adjust needs context.
            // Let's just use /alerts endpoint data? No, that misses healthy items.
            // I will fetch /inventory/products and then for each product fetch batches? Too heavy (N+1).
            // Better: update backend getProducts to include totalStock.
            // Given I cannot easily edit backend again without context switch, I'll try to use what I have.
            // I will fetch /inventory/products.
            // Then I will fetch ALL batches once and map them? /inventory/products/:id/batches is endpoint.
            // I'll fetch /inventory/products. I'll make a helper to fetch stock for visible items?
            // Or... I'll just Assume "0" if not loaded and let user click to load?
            // NO, "Everything must be fast".
            // I should update getProducts in backend. But I'll do a quick hack:
            // Fetch /alerts? No.
            // I'll update getProducts to aggregate stock. It's necessary for "View Stock".
            // See the backend code I have... getProducts just finds Product.
            // I really should utilize `getAlerts` aggregation logic in `getProducts`.
            // Okay, I will update Backend `inventoryController.js` to return stock in `getProducts`!
            // That was part of "Optimize api/inventory" task.
            const res = await axios.get(`${API_URL}/api/inventory/products`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setProducts(res.data);

            // Temporary: fetch batches for all? Or just render products and allow click to expand?
            // "One tap actions" implies I see the stock.
            // I will assume the backend returns stock (I will fix backend next step).
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleQuickAdjust = async (productId, change) => {
        try {
            await axios.post(`${API_URL} /api/inventory / quick - adjust`, { productId, change });
            // Optimistic update
            setProducts(prev => prev.map(p => {
                if (p._id === productId) {
                    // This assumes p.totalStock exists.
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
                            <p className="text-sm text-gray-500 dark:text-gray-400">{p.totalStock !== undefined ? `${p.totalStock} ${p.unit} ` : 'Stock info unavailable'}</p>
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

            <button className="fixed bottom-24 right-24 bg-gfg-green text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-40">
                <Plus size={24} />
            </button>

            <FloatingVoiceMic />
        </div>
    );
};

export default Inventory;
