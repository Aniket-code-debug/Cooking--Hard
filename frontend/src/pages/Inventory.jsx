import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', category: '', unit: '', minStockLevel: 5 });
    const [expandedProduct, setExpandedProduct] = useState(null);
    const [batches, setBatches] = useState([]);

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/inventory/products');
            setProducts(res.data);
        } catch (err) { console.error(err); }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/inventory/products', newProduct);
            setShowAddForm(false);
            setNewProduct({ name: '', category: '', unit: '', minStockLevel: 5 });
            fetchProducts();
        } catch (err) { alert('Failed to add product'); }
    };

    const toggleExpand = async (productId) => {
        if (expandedProduct === productId) {
            setExpandedProduct(null);
        } else {
            setExpandedProduct(productId);
            try {
                const res = await axios.get(`http://localhost:5000/api/inventory/products/${productId}/batches`);
                setBatches(res.data);
            } catch (err) { console.error(err); }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Inventory</h1>
                <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                    <Plus size={18} /> <span>Add Product</span>
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddProduct} className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-100 grid grid-cols-1 md:grid-cols-5 gap-4">
                    <input placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="px-3 py-2 border rounded" required />
                    <input placeholder="Category" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="px-3 py-2 border rounded" />
                    <input placeholder="Unit (pc/kg)" value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })} className="px-3 py-2 border rounded" />
                    <input placeholder="Min Stock" type="number" value={newProduct.minStockLevel} onChange={e => setNewProduct({ ...newProduct, minStockLevel: e.target.value })} className="px-3 py-2 border rounded" />
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                </form>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 font-medium text-gray-500">Name</th>
                            <th className="px-6 py-3 font-medium text-gray-500">Category</th>
                            <th className="px-6 py-3 font-medium text-gray-500">Unit</th>
                            <th className="px-6 py-3 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map(p => (
                            <div key={p._id} style={{ display: 'contents' }}>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{p.name}</td>
                                    <td className="px-6 py-4">{p.category}</td>
                                    <td className="px-6 py-4">{p.unit}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => toggleExpand(p._id)} className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                                            <span>{expandedProduct === p._id ? 'Hide Batches' : 'View Batches'}</span>
                                            {expandedProduct === p._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    </td>
                                </tr>
                                {expandedProduct === p._id && (
                                    <tr>
                                        <td colSpan="4" className="bg-gray-50 px-6 py-4">
                                            <h4 className="font-semibold text-sm mb-2 text-gray-700">Detailed Batch Info</h4>
                                            {batches.length === 0 ? <p className="text-sm text-gray-500">No batches found.</p> : (
                                                <table className="w-full text-sm bg-white rounded border">
                                                    <thead>
                                                        <tr className="bg-gray-100 border-b">
                                                            <th className="p-2">Batch No</th>
                                                            <th className="p-2">Expiry</th>
                                                            <th className="p-2">Qty (Offline)</th>
                                                            <th className="p-2">Online Stock</th>
                                                            <th className="p-2">MRP</th>
                                                            <th className="p-2">SP</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y">
                                                        {batches.map(b => (
                                                            <tr key={b._id}>
                                                                <td className="p-2">{b.batchNumber}</td>
                                                                <td className="p-2">{b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : '-'}</td>
                                                                <td className="p-2 font-bold text-gray-800">{b.quantity}</td>
                                                                <td className="p-2 text-blue-600">{b.onlineStock}</td>
                                                                <td className="p-2">{b.mrp}</td>
                                                                <td className="p-2">{b.sellingPrice}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </div>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
