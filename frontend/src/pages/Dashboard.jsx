import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [alerts, setAlerts] = useState({ lowStock: [], expiring: [] });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/inventory/alerts');
                setAlerts(res.data);
            } catch (err) { }
            setLoading(false);
        };
        fetchAlerts();
    }, []);

    if (loading) return <div className="p-4 text-center">Loading...</div>;

    const hasAlerts = alerts.lowStock.length > 0 || alerts.expiring.length > 0;

    return (
        <div className="pb-20">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Overview</h1>

            {!hasAlerts && (
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center border border-green-100 dark:border-green-800">
                    <CheckCircle className="mx-auto text-green-500 mb-2" size={48} />
                    <h2 className="text-xl font-bold text-green-700 dark:text-green-400">All Good!</h2>
                    <p className="text-gray-600 dark:text-gray-300">Inventory is healthy.</p>
                </div>
            )}

            {alerts.lowStock.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold mb-2 flex items-center text-red-600 dark:text-red-400">
                        <AlertCircle className="mr-2" size={20} /> Low Stock
                    </h2>
                    <div className="space-y-3">
                        {alerts.lowStock.map(p => (
                            <div key={p._id} className="bg-white dark:bg-gfg-surface-dark p-4 rounded-lg shadow-sm border border-red-100 dark:border-red-900/30 flex justify-between items-center" onClick={() => navigate('/inventory')}>
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-100">{p.name}</p>
                                    <p className="text-sm text-red-500">Stock: {p.totalStock} {p.unit}</p>
                                </div>
                                <button className="bg-red-50 text-red-600 px-3 py-1 rounded text-sm font-medium">Fix</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {alerts.expiring.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold mb-2 flex items-center text-orange-600 dark:text-orange-400">
                        <Clock className="mr-2" size={20} /> Expiring Soon
                    </h2>
                    <div className="space-y-3">
                        {alerts.expiring.map(b => (
                            <div key={b._id} className="bg-white dark:bg-gfg-surface-dark p-4 rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/30">
                                <div className="flex justify-between">
                                    <p className="font-bold text-gray-800 dark:text-gray-100">{b.productName}</p>
                                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                        {new Date(b.expiryDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Batch: {b.batchNumber} | Qty: {b.quantity}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-8">
                <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => navigate('/purchases')} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                        <span className="block text-2xl mb-1">🛒</span>
                        <span className="font-bold text-blue-700 dark:text-blue-300">New Purchase</span>
                    </button>
                    <button onClick={() => navigate('/inventory')} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                        <span className="block text-2xl mb-1">📦</span>
                        <span className="font-bold text-green-700 dark:text-green-300">Inventory</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
