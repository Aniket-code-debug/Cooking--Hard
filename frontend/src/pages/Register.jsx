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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-blue-600 mb-2">Create Account</h2>
                <p className="text-center text-gray-500 mb-8">Start managing your shop today</p>

                {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="shopName" placeholder="Shop Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                        <input name="ownerName" placeholder="Owner Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                    </div>
                    <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                    <input name="phone" placeholder="Phone" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                    <input name="gstin" placeholder="GSTIN (Optional)" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                    <textarea name="address" placeholder="Address" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" rows="2"></textarea>

                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Register Shop
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
