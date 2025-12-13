import { useEffect, useState } from 'react';
import axios from 'axios';

const Reports = () => {
    const [gstData, setGstData] = useState({ totalCGST: 0, totalSGST: 0, totalIGST: 0, totalTax: 0 });

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/reports/gst');
                setGstData(res.data);
            } catch (err) { console.error(err); }
        };
        fetchReport();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Reports</h1>

            <div className="bg-white p-6 rounded-xl shadow border">
                <h2 className="text-lg font-bold mb-4 text-gray-800">GST Input Credit Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-500">Total CGST</p>
                        <p className="text-xl font-bold text-blue-700">₹{gstData.totalCGST}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-500">Total SGST</p>
                        <p className="text-xl font-bold text-green-700">₹{gstData.totalSGST}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-500">Total IGST</p>
                        <p className="text-xl font-bold text-purple-700">₹{gstData.totalIGST}</p>
                    </div>
                    <div className="p-4 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-500">Total Tax Paid</p>
                        <p className="text-xl font-bold text-gray-800">₹{gstData.totalTax}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
