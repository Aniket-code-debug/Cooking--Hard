import React, { useState, useEffect } from 'react';
import { Coffee, Loader2 } from 'lucide-react';

const ServerWakeupMessage = ({ show, onClose }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (show) {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 2;
                });
            }, 600);

            return () => clearInterval(interval);
        } else {
            setProgress(0);
        }
    }, [show]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl max-w-md mx-4 text-center">
                <div className="flex justify-center mb-4">
                    <Coffee className="w-16 h-16 text-amber-600 animate-bounce" />
                </div>

                <h3 className="text-xl font-bold dark:text-white mb-2">
                    ☕ Waking up server...
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Our free server goes to sleep after inactivity.
                    This will take 15-30 seconds.
                </p>

                <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div
                        className="absolute top-0 left-0 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Please wait...</span>
                </div>

                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                    💡 Tip: Stay on this page and the next load will be instant!
                </p>
            </div>
        </div>
    );
};

export default ServerWakeupMessage;
