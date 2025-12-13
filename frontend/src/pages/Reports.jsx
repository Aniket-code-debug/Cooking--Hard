import { useEffect, useState } from 'react';
import axios from 'axios';
import { Download } from 'lucide-react';

const Reports = () => {
    const [gstData, setGstData] = useState({ totalCGST: 0, totalSGST: 0, totalIGST: 0, totalTax: 0 });

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/reports/gst');
                setGstData(res.data);
            } catch (err) { }
        };
        fetchReport();
    }, []);

    return (
        <div className="pb-20 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Reports</h1>

            <div className="bg-gradient-to-br from-gfg-green to-blue-600 rounded-2xl p-6 text-white shadow-lg mb-6">
                <p className="opacity-90 text-sm mb-1">Total GST Input Credit</p>
                <h2 className="text-4xl font-bold mb-4">₹{gstData.totalTax.toLocaleString()}</h2>

                <div className="grid grid-cols-3 gap-2 text-center border-t border-white/20 pt-4">
                    <div>
                        <p className="text-xs opacity-75">CGST</p>
                        <p className="font-bold">₹{gstData.totalCGST}</p>
                    </div>
                    <div>
                        <p className="text-xs opacity-75">SGST</p>
                        <p className="font-bold">₹{gstData.totalSGST}</p>
                    </div>
                    <div>
                        <p className="text-xs opacity-75">IGST</p>
                        <p className="font-bold">₹{gstData.totalIGST}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gfg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Detailed Report</h3>
                <p className="text-gray-500 text-sm mb-4">Download monthly purchase report for GST filing.</p>
                <button className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
                    <Download size={20} />
                    <span>Download CSV</span>
                </button>
            </div>
        </div>
    );
};

export default Reports;
