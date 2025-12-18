import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, FileBarChart, LogOut, Sun, Moon, Settings as SettingsIcon, Mic } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BottomNav from './BottomNav';

const Layout = () => {
    const { logout, user } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { label: 'Inventory', path: '/inventory', icon: <Package size={20} /> },
        { label: 'Purchases', path: '/purchases', icon: <ShoppingCart size={20} /> },
        { label: 'Suppliers', path: '/suppliers', icon: <Users size={20} /> },
        { label: 'Voice Sales', path: '/voice-sales', icon: <Mic size={20} /> },
        { label: 'Reports', path: '/reports', icon: <FileBarChart size={20} /> },
        { label: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gfg-bg-dark text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-surface-dark shadow-md hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-primary dark:text-white drop-shadow-lg">
                        KiranaFlow
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{user?.shopName}</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                ? 'bg-blue-50 text-gfg-green dark:bg-gray-700/50 dark:text-cyan-400'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 flex items-center justify-between">
                    <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        onClick={logout}
                        className="flex items-center space-x-2 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
                <div className="p-4 md:p-8 page-transition-enter">
                    <Outlet />
                </div>
            </main>

            <BottomNav />
        </div>
    );
};

export default Layout;
