"use client";
import { useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface Bill {
    billNumber: string;
    date: string;
    name: string;
    phone: string;
    netAmount: string; // Coming as string from sheet "Rs. 1000.00"
    paymentMode: string;
}

export function BillHistory() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch('/api/bills')
            .then(res => res.json())
            .then(data => {
                setBills(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredBills = bills.filter(b =>
        b.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.billNumber?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-violet-500" /></div>;

    return (
        <div className="bg-white/60 backdrop-blur-sm shadow-sm rounded-2xl p-6 border border-violet-100">
            <h2 className="text-2xl font-bold mb-6 text-stone-800">Bill History</h2>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-3 text-stone-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by Name or Bill Number..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left bg-white rounded-lg overflow-hidden">
                    <thead className="bg-violet-100 text-violet-800">
                        <tr>
                            <th className="p-4 rounded-tl-lg">Bill No</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Phone</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4 rounded-tr-lg">Mode</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {filteredBills.map((bill, i) => (
                            <tr key={i} className="hover:bg-violet-50/50 transition-colors">
                                <td className="p-4 font-medium text-stone-700">{bill.billNumber}</td>
                                <td className="p-4 text-stone-500">{new Date(bill.date).toLocaleDateString()}</td>
                                <td className="p-4 font-semibold text-stone-800">{bill.name}</td>
                                <td className="p-4 text-stone-500">{bill.phone}</td>
                                <td className="p-4 text-violet-600 font-bold">{bill.netAmount}</td>
                                <td className="p-4">
                                    <span className="px-3 py-1 bg-stone-100 rounded-full text-xs text-stone-600 font-medium">
                                        {bill.paymentMode}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredBills.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-stone-500">
                                    No bills found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
