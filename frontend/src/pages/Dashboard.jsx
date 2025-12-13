import { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, Package, Users, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({ totalProducts: 0, totalSuppliers: 0, totalPurchases: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, suppRes, purchRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/inventory/products'),
                    axios.get('http://localhost:5000/api/suppliers'),
                    axios.get('http://localhost:5000/api/purchases')
                ]);
                setStats({
                    totalProducts: prodRes.data.length,
                    totalSuppliers: suppRes.data.length,
                    totalPurchases: purchRes.data.length
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const cards = [
        { title: 'Total Products', value: stats.totalProducts, icon: <Package className="text-blue-600" size={24} />, bg: 'bg-blue-50' },
        { title: 'Registered Suppliers', value: stats.totalSuppliers, icon: <Users className="text-green-600" size={24} />, bg: 'bg-green-50' },
        { title: 'Total Purchases', value: stats.totalPurchases, icon: <DollarSign className="text-purple-600" size={24} />, bg: 'bg-purple-50' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                            <h3 className="text-3xl font-bold mt-1">{card.value}</h3>
                        </div>
                        <div className={`p-3 rounded-lg ${card.bg}`}>
                            {card.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
                <div className="flex space-x-4">
                    {/* Action buttons could go here */}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
