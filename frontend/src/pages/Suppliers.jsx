import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Phone, MapPin } from 'lucide-react';

const Suppliers = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [suppliers, setSuppliers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', gstin: '', address: '' });

    useEffect(() => { fetchSuppliers(); }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/suppliers`);
            setSuppliers(res.data);
        } catch (err) { console.error(err); }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/suppliers`, newSupplier);
            setShowAddForm(false);
            setNewSupplier({ name: '', phone: '', gstin: '', address: '' });
            fetchSuppliers();
        } catch (err) { alert('Failed to add supplier'); }
    };

    const inputClass = "px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-gfg-green focus:outline-none";

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
                <button onClick={() => setShowAddForm(!showAddForm)} className="bg-gfg-green text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition">
                    <Plus size={18} /> <span>Add Supplier</span>
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAdd} className="bg-white dark:bg-gfg-surface-dark p-6 rounded-lg shadow mb-6 space-y-4 max-w-2xl border dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Name" value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} className={inputClass} required />
                        <input placeholder="Phone" value={newSupplier.phone} onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })} className={inputClass} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="GSTIN" value={newSupplier.gstin} onChange={e => setNewSupplier({ ...newSupplier, gstin: e.target.value })} className={inputClass} />
                        <input placeholder="Address" value={newSupplier.address} onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })} className={inputClass} />
                    </div>
                    <button type="submit" className="bg-gfg-green text-white px-4 py-2 rounded hover:bg-green-700 transition">Save Supplier</button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map(s => (
                    <div key={s._id} className="bg-white dark:bg-gfg-surface-dark p-5 rounded-lg shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{s.name}</h3>
                        <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center space-x-2"><Phone size={16} /> <span>{s.phone}</span></div>
                            <div className="flex items-center space-x-2"><MapPin size={16} /> <span>{s.address || 'No Address'}</span></div>
                            {s.gstin && <div className="text-xs bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-hover px-2 py-1 inline-block rounded">GST: {s.gstin}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Suppliers;
