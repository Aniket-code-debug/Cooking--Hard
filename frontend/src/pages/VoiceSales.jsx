import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mic, Check, X, Edit2, Clock, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const VoiceSales = () => {
    const navigate = useNavigate();
    const [pendingSales, setPendingSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editedItems, setEditedItems] = useState([]);

    useEffect(() => {
        fetchPendingSales();
    }, []);

    const fetchPendingSales = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/voice-sales/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingSales(res.data);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/api/voice-sales/${id}/confirm`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from list
            setPendingSales(prev => prev.filter(sale => sale._id !== id));

            // Show success message
            alert(`✅ ${response.data.message}\n\n📦 Inventory has been updated!\nGo to Inventory page to see changes.`);

            // Navigate to inventory page after short delay
            setTimeout(() => {
                navigate('/inventory');
            }, 1500);

        } catch (err) {
            console.error('Confirm error:', err);
            const errorMsg = err.response?.data?.message || 'Failed to confirm sale';
            alert(`❌ ${errorMsg}`);
        }
    };

    const handleReject = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/voice-sales/${id}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from list
            setPendingSales(prev => prev.filter(sale => sale._id !== id));

            alert('Sale rejected');
        } catch (err) {
            console.error('Reject error:', err);
            alert('Failed to reject sale');
        }
    };

    const getConfidenceBadge = (confidence) => {
        if (confidence >= 0.85) {
            return <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded-full font-medium">{(confidence * 100).toFixed(0)}% ✓</span>;
        } else if (confidence >= 0.6) {
            return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs rounded-full font-medium">{(confidence * 100).toFixed(0)}% ⚠️</span>;
        } else {
            return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-xs rounded-full font-medium">{(confidence * 100).toFixed(0)}% ❌</span>;
        }
    };

    const getTimeSince = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        );
    }

    return (
        <div className="pb-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    📋 Pending Voice Sales ({pendingSales.length})
                </h1>
            </div>

            {pendingSales.length === 0 ? (
                <div className="bg-white dark:bg-surface-dark p-8 rounded-xl shadow-sm text-center">
                    <Mic className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                        No Pending Sales
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Use the 🎤 button to record a sale
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingSales.map(sale => (
                        <div key={sale._id} className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 card-3d">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="text-gray-400" size={16} />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {getTimeSince(sale.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 italic">
                                        "{sale.voiceText}"
                                    </p>
                                </div>
                                <div>
                                    {getConfidenceBadge(sale.overallConfidence)}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-3 mb-4">
                                {sale.items.map((item, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    📦 {item.matchedItemName}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Qty: {item.quantity} {item.unit} • Spoken: "{item.spokenName}"
                                                </p>
                                            </div>
                                            <div>
                                                {getConfidenceBadge(item.confidence)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleReject(sale._id)}
                                    className="flex-1 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-2"
                                >
                                    <X size={18} />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleConfirm(sale._id)}
                                    className="flex-1 py-2 bg-gfg-green text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    Confirm Sale
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VoiceSales;
