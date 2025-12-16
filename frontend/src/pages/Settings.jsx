import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, User } from 'lucide-react';

const Settings = () => {
    const { user } = useAuth();
    // Placeholder state for demo
    const [shopName, setShopName] = useState(user?.shopName || 'Apna Kirana Store');
    const [address, setAddress] = useState('Mumbai, India');

    const handleSave = () => {
        alert('Settings saved (Demo)');
    };

    const inputClass = "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gfg-green focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white";

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h1>

            <div className="space-y-6">
                {/* Business Info Section */}
                <div className="bg-white dark:bg-gfg-surface-dark p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 card-3d">
                    <h2 className="text-xl font-bold mb-4 text-gfg-green flex items-center space-x-2">
                        <User size={20} />
                        <span>Business Information</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shop Name</label>
                            <input value={shopName} onChange={(e) => setShopName(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner Name</label>
                            <input value={user?.ownerName || 'Admin'} disabled className={`${inputClass} bg-gray-100 dark:bg-gray-700 cursor-not-allowed`} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                            <textarea rows="3" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass}></textarea>
                        </div>
                    </div>
                </div>

                {/* Staff Section (Placeholder) */}
                <div className="bg-white dark:bg-gfg-surface-dark p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 card-3d">
                    <h2 className="text-xl font-bold mb-4 text-gfg-green">Staff Management</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Manage access for your employees.</p>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
                        No staff members added yet.
                    </div>
                </div>

                <div className="flex justify-end">
                    <button onClick={handleSave} className="flex items-center space-x-2 bg-gfg-green text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                        <Save size={18} />
                        <span>Save Changes</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
