"use client";
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, ShoppingBag, CreditCard } from 'lucide-react';

interface Bill {
    date: string;
    netAmount: string; // "Rs. 1200.00"
}

export function AnalyticsDashboard() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        chartData: [] as any[]
    });
    const [loading, setLoading] = useState(true);

    const parseCurrency = (str: string) => {
        if (!str) return 0;
        // Remove "Rs." (case insensitive), commas, and whitespace
        const cleanStr = str.replace(/rs\.?/gi, '').replace(/,/g, '').trim();
        return parseFloat(cleanStr) || 0;
    };

    useEffect(() => {
        fetch('/api/bills')
            .then(res => res.json())
            .then((bills: Bill[]) => {
                let totalRev = 0;

                // Group by date for chart
                const salesByDate: Record<string, number> = {};

                bills.forEach(bill => {
                    const amount = parseCurrency(bill.netAmount);
                    totalRev += amount;

                    const date = new Date(bill.date).toLocaleDateString('en-GB'); // DD/MM/YYYY
                    salesByDate[date] = (salesByDate[date] || 0) + amount;
                });

                // Format chart data (Last 7 days approx, or just all dates sorted)
                const chartData = Object.keys(salesByDate).map(date => ({
                    date,
                    sales: salesByDate[date]
                })).slice(-10); // Last 10 days of activity

                setStats({
                    totalRevenue: totalRev,
                    totalOrders: bills.length,
                    avgOrderValue: bills.length ? totalRev / bills.length : 0,
                    chartData
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-violet-500" /></div>;

    const StatCard = ({ title, value, icon: Icon, bgClass, borderClass, iconClass }: any) => (
        <div className={`${bgClass} backdrop-blur-sm p-6 rounded-2xl shadow-sm border ${borderClass} flex items-center gap-4 transition-transform hover:scale-105`}>
            <div className={`p-4 rounded-full bg-white/60 ${iconClass} shadow-sm`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-stone-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-stone-800">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
                    icon={TrendingUp}
                    bgClass="bg-emerald-100/80"
                    borderClass="border-emerald-200"
                    iconClass="text-emerald-600"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    bgClass="bg-sky-100/80"
                    borderClass="border-sky-200"
                    iconClass="text-sky-600"
                />
                <StatCard
                    title="Average Order Value"
                    value={`Rs. ${stats.avgOrderValue.toFixed(0)}`}
                    icon={CreditCard}
                    bgClass="bg-violet-100/80"
                    borderClass="border-violet-200"
                    iconClass="text-violet-600"
                />
            </div>

            {/* Chart */}
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-violet-100">
                <h3 className="text-xl font-bold text-stone-800 mb-6">Sales Trend (Last 10 Active Days)</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f5f5f4' }}
                            />
                            <Bar dataKey="sales" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
