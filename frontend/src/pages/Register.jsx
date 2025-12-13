import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        shopName: '', ownerName: '', email: '', password: '', gstin: '', address: '', phone: ''
    });
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    const inputClass = "w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gfg-green focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gfg-bg-dark transition-colors duration-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white dark:bg-gfg-surface-dark p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-center text-gfg-green mb-2">Create Account</h2>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Start managing your shop today</p>

                {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="shopName" placeholder="Shop Name" onChange={handleChange} className={inputClass} required />
                        <input name="ownerName" placeholder="Owner Name" onChange={handleChange} className={inputClass} required />
                    </div>
                    <input name="email" type="email" placeholder="Email" onChange={handleChange} className={inputClass} required />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} className={inputClass} required />
                    <input name="phone" placeholder="Phone" onChange={handleChange} className={inputClass} required />
                    <input name="gstin" placeholder="GSTIN (Optional)" onChange={handleChange} className={inputClass} />
                    <textarea name="address" placeholder="Address" onChange={handleChange} className={inputClass} rows="2"></textarea>

                    <button type="button" className="w-full bg-gfg-green text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors" onClick={handleSubmit}>
                        Register Shop
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account? <Link to="/login" className="text-gfg-green hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
