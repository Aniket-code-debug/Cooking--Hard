import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet, Building2 } from 'lucide-react';

const Capital = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({ totalCredit: 0, totalDebit: 0, cashInHand: 0, bankBalance: 0 });
    const [showAdd, setShowAdd] = useState(false);
    const [newTx, setNewTx] = useState({ type: 'CREDIT', amount: '', category: 'SALES', mode: 'CASH', description: '' });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [txRes, sumRes] = await Promise.all([
                axios.get(`${API_URL}/api/capital`),
                axios.get(`${API_URL}/api/capital/summary`)
            ]);
            setTransactions(txRes.data);
            setSummary(sumRes.data);
        } catch (err) { }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/capital`, newTx);
            setShowAdd(false);
            setNewTx({ type: 'CREDIT', amount: '', category: 'SALES', mode: 'CASH', description: '' });
            fetchData();
        } catch (err) { alert('Failed to add transaction'); }
    };

    const inputClass = "w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white";

    return (
        <div className="pb-20 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Capital Ledger</h1>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gfg-green text-white p-4 rounded-xl shadow-lg">
                    <div className="flex items-center space-x-2 mb-1 opacity-90">
                        <Wallet size={18} /> <span className="text-sm">Cash in Hand</span>
                    </div>
                    <h2 className="text-2xl font-bold">₹{summary.cashInHand.toLocaleString()}</h2>
                </div>
                <div className="bg-primary text-white p-4 rounded-xl shadow-lg">
                    <div className="flex items-center space-x-2 mb-1 opacity-90">
                        <Building2 size={18} /> <span className="text-sm">Bank Balance</span>
                    </div>
                    <h2 className="text-2xl font-bold">₹{summary.bankBalance.toLocaleString()}</h2>
                </div>
            </div>

            <button onClick={() => setShowAdd(!showAdd)} className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white py-3 rounded-lg font-bold mb-6 flex justify-center items-center space-x-2 border dark:border-gray-700">
                <Plus size={20} /> <span>Add Transaction</span>
            </button>

            {showAdd && (
                <form onSubmit={handleAdd} className="bg-white dark:bg-gfg-surface-dark p-4 rounded-xl shadow-sm mb-6 border dark:border-gray-700 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <select className={inputClass} value={newTx.type} onChange={e => setNewTx({ ...newTx, type: e.target.value })}>
                            <option value="CREDIT">Inflow (Credit)</option>
                            <option value="DEBIT">Outflow (Debit)</option>
                        </select>
                        <select className={inputClass} value={newTx.mode} onChange={e => setNewTx({ ...newTx, mode: e.target.value })}>
                            <option value="CASH">Cash</option>
                            <option value="BANK">Bank/UPI</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="number" placeholder="Amount" className={inputClass} value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })} required />
                        <select className={inputClass} value={newTx.category} onChange={e => setNewTx({ ...newTx, category: e.target.value })}>
                            <option value="SALES">Sales</option>
                            <option value="PURCHASE">Purchase</option>
                            <option value="EXPENSE">Expense</option>
                            <option value="INVESTMENT">Investment</option>
                            <option value="WITHDRAWAL">Withdrawal</option>
                        </select>
                    </div>
                    <input placeholder="Note (Optional)" className={inputClass} value={newTx.description} onChange={e => setNewTx({ ...newTx, description: e.target.value })} />
                    <button type="submit" className="w-full bg-gfg-green text-white py-2 rounded-lg font-bold">Save</button>
                </form>
            )}

            <div className="space-y-3">
                <h3 className="font-bold text-gray-700 dark:text-gray-300">Recent Transactions</h3>
                {transactions.map(tx => (
                    <div key={tx._id} className="bg-white dark:bg-gfg-surface-dark p-4 rounded-xl shadow-sm flex justify-between items-center border border-gray-100 dark:border-gray-800 card-3d">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {tx.type === 'CREDIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{tx.category}</p>
                                <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()} • {tx.mode}</p>
                            </div>
                        </div>
                        <div className={`font-bold ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Capital;
