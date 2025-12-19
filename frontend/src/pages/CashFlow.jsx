import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Filter, Calendar } from 'lucide-react';

const CashFlow = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [transactions, setTransactions] = useState([]);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, SALE, PAYMENT, EXPENSE

    useEffect(() => {
        fetchCashFlow();
    }, [filter]);

    const fetchCashFlow = async () => {
        try {
            const params = filter !== 'all' ? { type: filter } : {};
            const res = await axios.get(`${API_URL}/api/cashflow`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params
            });
            setTransactions(res.data.transactions);
            setCurrentBalance(res.data.currentBalance);
        } catch (error) {
            console.error('Failed to fetch cash flow:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTransactionColor = (direction) => {
        return direction === 'IN'
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400';
    };

    const getTransactionIcon = (direction) => {
        return direction === 'IN' ? TrendingUp : TrendingDown;
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen dark:text-white">Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 dark:bg-gfg-dark min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold dark:text-white mb-2">Cash Flow</h1>
                <p className="text-gray-600 dark:text-gray-400">Track all your cash transactions</p>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 p-8 rounded-xl text-white mb-6 shadow-lg">
                <p className="text-sm font-medium opacity-90 mb-1">Current Cash Balance</p>
                <p className="text-5xl font-bold">₹{currentBalance.toLocaleString('en-IN')}</p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gfg-surface-dark p-4 rounded-xl mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium dark:text-white">Filter:</span>
                    <div className="flex space-x-2">
                        {['all', 'SALE', 'PAYMENT', 'EXPENSE'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === type
                                        ? 'bg-gfg-green text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {type === 'all' ? 'All' : type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
                {transactions.length === 0 ? (
                    <div className="bg-white dark:bg-gfg-surface-dark p-8 rounded-xl text-center">
                        <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
                    </div>
                ) : (
                    transactions.map(tx => {
                        const Icon = getTransactionIcon(tx.direction);
                        const colorClass = getTransactionColor(tx.direction);

                        return (
                            <div
                                key={tx._id}
                                className="bg-white dark:bg-gfg-surface-dark p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div className={`p-3 rounded-lg ${tx.direction === 'IN' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
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
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                                                    {tx.type}
                                                </span>
                                                {tx.paymentMode && (
                                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                                                        {tx.paymentMode}
                                                    </span>
                                                )}
                                                {tx.entrySource === 'VOICE_AI' && (
                                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-medium">
                                                        🎤 Voice
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className={`text-2xl font-bold ${colorClass} mb-1`}>
                                            {tx.direction === 'IN' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
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
        </div>
    );
};

export default CashFlow;
