import { Link } from 'react-router-dom';
import { Mic, TrendingUp, Package, Wallet, Zap, Shield, BarChart3, Users } from 'lucide-react';

const Landing = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                            Vyapix
                        </h1>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gfg-green font-medium border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-gfg-green transition-all"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-6 py-2 bg-gfg-green text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
                            >
                                Get Started Free
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full mb-6">
                        <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                            AI-Powered Store Management
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        Manage Your Store
                        <br />
                        <span className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                            Like Never Before
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                        Voice-powered sales, real-time cash flow tracking, and AI insights—all in one beautiful dashboard.
                        Built for modern shop owners who want to grow smarter.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-teal-600 transition shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5"
                        >
                            Start Free Trial
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition"
                        >
                            Sign In
                        </Link>
                    </div>

                    <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                        ✨ No credit card required • 🚀 Setup in 2 minutes • 📱 Works on any device
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Everything Your Store Needs
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                        Powerful features designed for Indian shop owners
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Feature 1 */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition group">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                            <Mic className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            बोलो और बेचो
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            "दो किलो चीनी" - Just speak in Hindi/Hinglish. AI understands and creates sales instantly.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition group">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Live Cash Flow
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Track every rupee. Green for income, red for expenses. Know your cash position 24/7.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition group">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Smart Accounts
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Supplier credit tracking, payment reminders, and automatic balance calculations.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition group">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Stock at a Glance
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Low stock alerts, batch tracking, expiry management—never run out or waste products.
                        </p>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="bg-gradient-to-r from-green-600 to-teal-600 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 text-white">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-4">
                                <Shield className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">100% Secure</h3>
                            <p className="text-green-100">
                                Your data is encrypted and safe. Bank-level security for your shop.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-4">
                                <BarChart3 className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Grow 3x Faster</h3>
                            <p className="text-green-100">
                                Make data-driven decisions. See what sells, what doesn't, and why.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-4">
                                <Users className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Made for Bharat</h3>
                            <p className="text-green-100">
                                Hindi/Hinglish support. Designed for Indian shop owners, by Indian developers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12 text-center shadow-2xl">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Ready to Transform Your Store?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join hundreds of shop owners who've already digitized their business with Vyapix.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block bg-gradient-to-r from-green-500 to-teal-500 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-teal-600 transition shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5"
                    >
                        Get Started - It's Free! 🚀
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 dark:bg-black text-gray-400 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p>&copy; 2025 Vyapix. Built with ❤️ for Indian Retail Stores.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
