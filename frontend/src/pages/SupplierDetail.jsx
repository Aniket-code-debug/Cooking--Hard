import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, IndianRupee, Calendar, TrendingUp, TrendingDown, Plus } from 'lucide-react';

const SupplierDetail = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const { id } = useParams();
    const navigate = useNavigate();
    const [supplier, setSupplier] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [payment, setPayment] = useState({ amount: '', paymentMode: 'CASH', description: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSupplierDetails();
    }, [id]);

    const fetchSupplierDetails = async () => {
        try {
            console.log('Fetching supplier details for ID:', id);

            const [supplierRes, accountRes] = await Promise.all([
                axios.get(`${API_URL}/api/suppliers`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get(`${API_URL}/api/suppliers/${id}/account`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            console.log('Suppliers fetched:', supplierRes.data);
            console.log('Looking for supplier with ID:', id);

            // Find the specific supplier from the list
            const foundSupplier = supplierRes.data.find(s => s._id === id);

            if (!foundSupplier) {
                console.error('Supplier not found in list. Available IDs:', supplierRes.data.map(s => s._id));
                throw new Error('Supplier not found');
            }

            console.log('Found supplier:', foundSupplier);
            console.log('Account data:', accountRes.data);

            setSupplier(foundSupplier);
            // Backend returns { supplier, transactions, balance }
            setTransactions(accountRes.data.transactions || []);
        } catch (error) {
            console.error('Failed to fetch supplier details:', error);
            console.error('Error response:', error.response);
            alert('Failed to load supplier details: ' + (error.response?.data?.error || error.message));
            navigate('/suppliers');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/suppliers/${id}/payment`, payment, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setShowPaymentModal(false);
            setPayment({ amount: '', paymentMode: 'CASH', description: '' });
            fetchSupplierDetails();
            alert('Payment recorded successfully!');
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Failed to record payment: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen dark:text-white">Loading...</div>;
    }

    if (!supplier) {
        return <div className="flex items-center justify-center h-screen dark:text-white">Supplier not found</div>;
    }

    return (
        <div className="p-6 bg-gray-50 dark:bg-gfg-bg-dark min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/suppliers')}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gfg-green mb-4"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Suppliers</span>
                </button>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white mb-2">{supplier.name}</h1>
                        <p className="text-gray-600 dark:text-gray-400">{supplier.phone}</p>
                        {supplier.address && <p className="text-sm text-gray-500 dark:text-gray-500">{supplier.address}</p>}
                    </div>

                    {supplier.currentBalance > 0 && (
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="bg-gfg-green text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition shadow-lg"
                        >
                            <Plus size={20} />
                            <span>Record Payment</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Balance Card */}
            <div className={`p-8 rounded-xl mb-6 shadow-lg ${supplier.currentBalance > 0 ? 'bg-gradient-to-r from-red-600 to-pink-600' : supplier.currentBalance < 0 ? 'bg-gradient-to-r from-green-600 to-teal-600' : 'bg-gradient-to-r from-gray-600 to-gray-700'}`}>
                <p className="text-white text-sm font-medium opacity-90 mb-1">
                    {supplier.currentBalance > 0 ? 'Amount to Pay' : supplier.currentBalance < 0 ? 'Advance Paid' : 'Settled'}
                </p>
                <p className="text-white text-5xl font-bold flex items-center">
                    <IndianRupee size={40} />
                    {Math.abs(supplier.currentBalance || 0).toLocaleString('en-IN')}
                </p>
            </div>

            {/* Transaction History */}
            <div className="mb-4">
                <h2 className="text-xl font-bold dark:text-white mb-4">Transaction History</h2>
            </div>

            <div className="space-y-3">
                {transactions.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
                    </div>
                ) : (
                    transactions.map(tx => {
                        const Icon = tx.type === 'PURCHASE' ? TrendingUp : TrendingDown;
                        const colorClass = tx.type === 'PURCHASE'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400';

                        return (
                            <div
                                key={tx._id}
                                className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div className={`p-3 rounded-lg ${tx.type === 'PURCHASE' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                                            <Icon className={`w-6 h-6 ${colorClass}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-lg dark:text-white mb-1">{tx.description}</p>
                                            <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium dark:text-gray-300">
                                                    {tx.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className={`text-2xl font-bold ${colorClass} mb-1`}>
                                            {tx.type === 'PURCHASE' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Bal: ₹{tx.balance.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPaymentModal(false)}>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold dark:text-white mb-4">Record Payment</h3>
                        <form onSubmit={handlePayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={payment.amount}
                                    onChange={e => setPayment({ ...payment, amount: e.target.value })}
                                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-gfg-green"
                                    placeholder="Enter amount"
                                    required
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Payment Mode</label>
                                <select
                                    value={payment.paymentMode}
                                    onChange={e => setPayment({ ...payment, paymentMode: e.target.value })}
                                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-gfg-green"
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="BANK">Bank Transfer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={payment.description}
                                    onChange={e => setPayment({ ...payment, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-gfg-green"
                                    placeholder="e.g., Payment for Invoice #123"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-gfg-green text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                >
                                    Record Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierDetail;
