import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash, Check } from 'lucide-react';

const Purchases = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [step, setStep] = useState(1); // 1: Supplier & Invoice, 2: Items

    const [formData, setFormData] = useState({
        supplier: '', invoiceNumber: '', date: new Date().toISOString().split('T')[0],
        items: [], cgst: 0, sgst: 0, igst: 0
    });

    const [currentItem, setCurrentItem] = useState({ product: '', batchNumber: '', quantity: '', purchaseRate: '', sellingPrice: '' });

    useEffect(() => {
        const fetch = async () => {
            try {
                const [sRes, pRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/suppliers'),
                    axios.get('http://localhost:5000/api/inventory/products')
                ]);
                setSuppliers(sRes.data);
                setProducts(pRes.data);
            } catch (err) { }
        };
        fetch();
    }, []);

    const addItem = () => {
        if (!currentItem.product || !currentItem.quantity) return;
        setFormData({
            ...formData,
            items: [...formData.items, { ...currentItem, mrp: currentItem.sellingPrice }] // Assuming MRP=SP for speed
        });
        setCurrentItem({ product: '', batchNumber: '', quantity: '', purchaseRate: '', sellingPrice: '' });
    };

    const removeItem = (idx) => {
        setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) });
    };

    const handleSubmit = async () => {
        let total = formData.items.reduce((acc, item) => acc + (item.quantity * item.purchaseRate), 0);
        try {
            await axios.post('http://localhost:5000/api/purchases', { ...formData, totalAmount: total });
            alert('Purchase Recorded!');
            setFormData({ supplier: '', invoiceNumber: '', date: new Date().toISOString().split('T')[0], items: [], cgst: 0, sgst: 0, igst: 0 });
            setStep(1);
        } catch (err) { alert('Error recording purchase'); }
    };

    const inputClass = "w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-lg dark:text-white";

    return (
        <div className="pb-20 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Record Purchase</h1>

            {step === 1 && (
                <div className="space-y-4 bg-white dark:bg-gfg-surface-dark p-6 rounded-xl shadow-sm">
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Supplier</label>
                        <select className={inputClass} value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })}>
                            <option value="">Select Supplier</option>
                            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Invoice No</label>
                        <input className={inputClass} value={formData.invoiceNumber} onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })} placeholder="e.g. INV-001" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Date</label>
                        <input type="date" className={inputClass} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                    </div>
                    <button onClick={() => setStep(2)} className="w-full bg-gfg-green text-white py-3 rounded-lg font-bold mt-4">Next: Add Items</button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    {/* Item Entry Form */}
                    <div className="bg-white dark:bg-gfg-surface-dark p-4 rounded-xl shadow-sm space-y-3">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200">Add Item</h3>
                        <select className={inputClass} value={currentItem.product} onChange={e => setCurrentItem({ ...currentItem, product: e.target.value })}>
                            <option value="">Select Product</option>
                            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="number" placeholder="Qty" className={inputClass} value={currentItem.quantity} onChange={e => setCurrentItem({ ...currentItem, quantity: e.target.value })} />
                            <input placeholder="Batch (Opt)" className={inputClass} value={currentItem.batchNumber} onChange={e => setCurrentItem({ ...currentItem, batchNumber: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="number" placeholder="Buy Rate" className={inputClass} value={currentItem.purchaseRate} onChange={e => setCurrentItem({ ...currentItem, purchaseRate: e.target.value })} />
                            <input type="number" placeholder="Sell Price" className={inputClass} value={currentItem.sellingPrice} onChange={e => setCurrentItem({ ...currentItem, sellingPrice: e.target.value })} />
                        </div>
                        <button onClick={addItem} className="w-full border-2 border-gfg-green text-gfg-green py-2 rounded-lg font-medium">Add to List</button>
                    </div>

                    {/* List of Added Items */}
                    {formData.items.length > 0 && (
                        <div className="space-y-2">
                            {formData.items.map((item, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold dark:text-white">{products.find(p => p._id === item.product)?.name}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity} x ₹{item.purchaseRate}</p>
                                    </div>
                                    <button onClick={() => removeItem(idx)} className="text-red-500"><Trash size={18} /></button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex space-x-3 pt-4">
                        <button onClick={() => setStep(1)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-bold">Back</button>
                        <button onClick={handleSubmit} className="flex-1 bg-gfg-green text-white py-3 rounded-lg font-bold flex justify-center items-center space-x-2">
                            <Check size={20} /> <span>Save Purchase</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchases;
