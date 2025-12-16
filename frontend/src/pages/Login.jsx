import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

// ✅ USE ENV VARIABLE
const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const res = await axios.post(
                `${API_URL}/api/auth/login`,
                { email, password }
            );

            login(res.data.user, res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gfg-bg-dark transition-colors duration-200">
            <div className="max-w-md w-full bg-white dark:bg-gfg-surface-dark p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative">
                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <h2 className="text-3xl font-bold text-center text-gfg-green mb-2">KiranaFlow</h2>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Sign in to manage your shop</p>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gfg-green focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gfg-green focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gfg-green text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Sign In
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-gfg-green hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};
console.log("API URL:", import.meta.env.VITE_API_URL);


export default Login;
