import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Phone, MapPin } from 'lucide-react';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', gstin: '', address: '' });

    useEffect(() => { fetchSuppliers(); }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/suppliers');
            setSuppliers(res.data);
        } catch (err) { console.error(err); }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/suppliers', newSupplier);
            setShowAddForm(false);
            setNewSupplier({ name: '', phone: '', gstin: '', address: '' });
            fetchSuppliers();
        } catch (err) { alert('Failed to add supplier'); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Suppliers</h1>
                <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                    <Plus size={18} /> <span>Add Supplier</span>
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAdd} className="bg-white p-6 rounded-lg shadow mb-6 space-y-4 max-w-2xl">
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Name" value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} className="px-3 py-2 border rounded" required />
                        <input placeholder="Phone" value={newSupplier.phone} onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })} className="px-3 py-2 border rounded" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="GSTIN" value={newSupplier.gstin} onChange={e => setNewSupplier({ ...newSupplier, gstin: e.target.value })} className="px-3 py-2 border rounded" />
                        <input placeholder="Address" value={newSupplier.address} onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })} className="px-3 py-2 border rounded" />
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save Supplier</button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map(s => (
                    <div key={s._id} className="bg-white p-5 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-lg text-gray-800">{s.name}</h3>
                        <div className="mt-3 space-y-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-2"><Phone size={16} /> <span>{s.phone}</span></div>
                            <div className="flex items-center space-x-2"><MapPin size={16} /> <span>{s.address || 'No Address'}</span></div>
                            {s.gstin && <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 inline-block rounded">GST: {s.gstin}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Suppliers;
