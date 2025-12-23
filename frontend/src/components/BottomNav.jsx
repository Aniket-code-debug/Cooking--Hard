import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, FileBarChart, Settings, Mic } from 'lucide-react';

const BottomNav = () => {
    const location = useLocation();

    const navItems = [
        { label: 'Home', path: '/dashboard', icon: <Home size={20} /> },
        { label: 'Stock', path: '/inventory', icon: <Package size={20} /> },
        { label: 'Buy', path: '/purchases', icon: <ShoppingCart size={20} /> },
        { label: 'Voice', path: '/voice-sales', icon: <Mic size={20} /> },
        { label: 'Reports', path: '/reports', icon: <FileBarChart size={20} /> },
        { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gfg-surface-dark border-t dark:border-gray-700 flex justify-around py-3 pb-safe z-50">
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center space-y-1 ${location.pathname === item.path
                        ? 'text-gfg-green'
                        : 'text-gray-400 dark:text-gray-500'
                        }`}
                >
                    {item.icon}
                    <span className="text-xs font-medium">{item.label}</span>
                </Link>
            ))}
        </div>
    );
};

export default BottomNav;
