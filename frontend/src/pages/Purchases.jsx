import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash } from 'lucide-react';

const Purchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);

    const [formData, setFormData] = useState({
        supplier: '', invoiceNumber: '', date: new Date().toISOString().split('T')[0],
        items: [], cgst: 0, sgst: 0, igst: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pRes, sRes, prodRes] = await Promise.all([
                axios.get('http://localhost:5000/api/purchases'),
                axios.get('http://localhost:5000/api/suppliers'),
                axios.get('http://localhost:5000/api/inventory/products')
            ]);
            setPurchases(pRes.data);
            setSuppliers(sRes.data);
            setProducts(prodRes.data);
        } catch (err) { console.error(err); }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { product: '', batchNumber: '', expiryDate: '', mrp: 0, purchaseRate: 0, sellingPrice: 0, quantity: 1 }]
        });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Calculate totals logic if needed, simplify for now
        let total = formData.items.reduce((acc, item) => acc + (item.quantity * item.purchaseRate), 0);
        // Add taxes
        total += parseFloat(formData.cgst) + parseFloat(formData.sgst) + parseFloat(formData.igst);

        try {
            await axios.post('http://localhost:5000/api/purchases', { ...formData, totalAmount: total });
            setShowAddForm(false);
            fetchData();
        } catch (err) { alert('Failed to create purchase'); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Purchases</h1>
                <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                    <Plus size={18} /> <span>New Purchase</span>
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-100">
                    <h3 className="font-bold text-lg mb-4">New Inward Supply</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <select className="border p-2 rounded" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} required>
                            <option value="">Select Supplier</option>
                            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                        <input placeholder="Invoice No" className="border p-2 rounded" value={formData.invoiceNumber} onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })} />
                        <input type="date" className="border p-2 rounded" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                    </div>

                    <div className="mb-4">
                        <h4 className="font-semibold mb-2">Items</h4>
                        {formData.items.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-7 gap-2 mb-2 items-center">
                                <select className="col-span-1 border p-1 rounded text-sm" value={item.product} onChange={e => updateItem(idx, 'product', e.target.value)} required>
                                    <option value="">Product</option>
                                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                                <input placeholder="Batch No" className="border p-1 rounded text-sm" value={item.batchNumber} onChange={e => updateItem(idx, 'batchNumber', e.target.value)} required />
                                <input type="number" placeholder="Qty" className="border p-1 rounded text-sm" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} required />
                                <input type="number" placeholder="Rate" className="border p-1 rounded text-sm" value={item.purchaseRate} onChange={e => updateItem(idx, 'purchaseRate', e.target.value)} required />
                                <input type="number" placeholder="MRP" className="border p-1 rounded text-sm" value={item.mrp} onChange={e => updateItem(idx, 'mrp', e.target.value)} required />
                                <input type="number" placeholder="SP" className="border p-1 rounded text-sm" value={item.sellingPrice} onChange={e => updateItem(idx, 'sellingPrice', e.target.value)} required />
                                <button type="button" onClick={() => removeItem(idx)} className="text-red-500"><Trash size={16} /></button>
                            </div>
                        ))}
                        <button type="button" onClick={addItem} className="text-sm text-blue-600 font-medium">+ Add Item</button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <input type="number" placeholder="CGST Total" className="border p-2 rounded" value={formData.cgst} onChange={e => setFormData({ ...formData, cgst: e.target.value })} />
                        <input type="number" placeholder="SGST Total" className="border p-2 rounded" value={formData.sgst} onChange={e => setFormData({ ...formData, sgst: e.target.value })} />
                        <input type="number" placeholder="IGST Total" className="border p-2 rounded" value={formData.igst} onChange={e => setFormData({ ...formData, igst: e.target.value })} />
                    </div>

                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Submit Purchase</button>
                </form>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Supplier</th>
                            <th className="px-6 py-3">Invoice</th>
                            <th className="px-6 py-3">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {purchases.map(p => (
                            <tr key={p._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{new Date(p.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{p.supplier?.name || 'Unknown'}</td>
                                <td className="px-6 py-4">{p.invoiceNumber}</td>
                                <td className="px-6 py-4 font-bold">₹{p.totalAmount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Purchases;
