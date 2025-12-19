import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Wallet, Building2, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccountOverview = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const [overview, setOverview] = useState({
        cashInHand: 0,
        bankBalance: 0,
        totalReceivables: 0,
        totalPayables: 0,
        netWorth: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOverview();
    }, []);

    const fetchOverview = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/account/overview`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setOverview(res.data);
        } catch (error) {
            console.error('Failed to fetch account overview:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl dark:text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 dark:text-white">Account Overview</h1>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Cash in Hand */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl shadow-sm border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                        <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">CASH</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">Cash in Hand</p>
                    <p className="text-3xl font-bold text-green-800 dark:text-green-200">
                        ₹{overview.cashInHand.toLocaleString('en-IN')}
                    </p>
                </div>

                {/* Bank Balance */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                        <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">BANK</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">Bank Balance</p>
                    <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                        ₹{overview.bankBalance.toLocaleString('en-IN')}
                    </p>
                </div>

                {/* Total Receivables */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl shadow-sm border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">TO RECEIVE</span>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">Receivables</p>
                    <p className="text-3xl font-bold text-purple-800 dark:text-purple-200">
                        ₹{overview.totalReceivables.toLocaleString('en-IN')}
                    </p>
                </div>

                {/* Total Payables */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-xl shadow-sm border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">TO PAY</span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-1">Payables</p>
                    <p className="text-3xl font-bold text-red-800 dark:text-red-200">
                        ₹{overview.totalPayables.toLocaleString('en-IN')}
                    </p>
                </div>
            </div>

            {/* Net Worth Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-xl text-white mb-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium opacity-90 mb-1">Net Worth</p>
                        <p className="text-5xl font-bold mb-3">₹{overview.netWorth.toLocaleString('en-IN')}</p>
                        <div className="flex space-x-6 text-sm opacity-90">
                            <span>Revenue: ₹{overview.monthlyRevenue.toLocaleString('en-IN')}</span>
                            <span>•</span>
                            <span>Expenses: ₹{overview.monthlyExpenses.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm opacity-75 mb-2">This Month</p>
                        <div className={`text-2xl font-bold ${(overview.monthlyRevenue - overview.monthlyExpenses) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            {(overview.monthlyRevenue - overview.monthlyExpenses) >= 0 ? '+' : ''}
                            ₹{(overview.monthlyRevenue - overview.monthlyExpenses).toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => navigate('/cashflow')}
                    className="bg-white dark:bg-gfg-surface-dark p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-lg dark:text-white">View Cash Flow</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">See all transactions</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>

                <button
                    onClick={() => navigate('/suppliers')}
                    className="bg-white dark:bg-gfg-surface-dark p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-lg dark:text-white">Supplier Accounts</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage payments</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default AccountOverview;
