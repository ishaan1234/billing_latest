"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Printer, Download, Save, Loader2 } from "lucide-react";
import { generateInvoicePDF, BillData } from "@/lib/pdf-generator";

const CATEGORIES = ["Lehenga", "Saree", "Gown", "Palazzo Set", "Skirt Set", "RTW Saree", "Other"];

interface LineItem {
    id: string;
    category: string;
    quantity: number;
    mrp: number;
    discount: number;
    rate: number;
    amount: number;
}

export function BillingForm() {
    // Customer Details
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [name, setName] = useState("Default Name");
    const [phone, setPhone] = useState("0000000000");
    const [email, setEmail] = useState("");
    const [paymentMode, setPaymentMode] = useState("Cash");

    // Items
    const [items, setItems] = useState<LineItem[]>([{
        id: crypto.randomUUID(),
        category: "Lehenga",
        quantity: 1,
        mrp: 0,
        discount: 0,
        rate: 0,
        amount: 0
    }]);

    // Payment
    const [amountPaid, setAmountPaid] = useState(0);

    // Computed Values
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalDiscount, setTotalDiscount] = useState(0);
    const [netAmount, setNetAmount] = useState(0);
    const [gstBreakdown, setGstBreakdown] = useState({
        taxable: 0, gst: 0, cgst: 0, sgst: 0
    });
    const [gstRate, setGstRate] = useState(5);
    const [balance, setBalance] = useState(0);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastBillNumber, setLastBillNumber] = useState<string | null>(null);

    // Recalculate row
    const updateItem = (id: string, field: keyof LineItem, value: any) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;

            const updated = { ...item, [field]: value };

            let rate = updated.mrp;
            if (updated.discount > 0) {
                rate = updated.mrp * (1 - updated.discount / 100);
            }
            updated.rate = rate; // Unit price after discount
            updated.amount = rate * updated.quantity; // Total for this line

            return updated;
        }));
    };

    // Recalculate Totals
    useEffect(() => {
        const totalBase = items.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
        const totalNet = items.reduce((sum, item) => sum + item.amount, 0);
        const totalDisc = totalBase - totalNet;


        setTotalAmount(totalBase);
        setTotalDiscount(totalDisc);
        setNetAmount(totalNet);

        // GST Calculation
        const taxable = totalNet / (1 + gstRate / 100);
        const gstTotal = totalNet - taxable;
        const cgst = gstTotal / 2;
        const sgst = gstTotal / 2;

        setGstBreakdown({
            taxable: taxable,
            gst: gstTotal,
            cgst: cgst,
            sgst: sgst
        });

        setBalance(totalNet - amountPaid);

    }, [items, amountPaid, gstRate]);

    const handleAddItem = () => {
        setItems(prev => [...prev, {
            id: crypto.randomUUID(),
            category: "Lehenga",
            quantity: 1,
            mrp: 0,
            discount: 0,
            rate: 0,
            amount: 0
        }]);
    };

    const handleRemoveItem = (id: string) => {
        if (items.length === 1) return;
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const handleGeneratePDF = async () => {
        const billNo = "2509" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

        const data: BillData = {
            billNumber: billNo,
            date: new Date(date).toLocaleDateString(),
            customer: { name, phone, payment: paymentMode },
            items: items,
            totals: { totalAmount, totalDiscount, netAmount },
            gst: {
                taxableAmount: gstBreakdown.taxable,
                gstAmount: gstBreakdown.gst,
                cgstAmount: gstBreakdown.cgst,
                sgstAmount: gstBreakdown.sgst
            },
            balance: { amountPaid, balanceAmount: balance }
        };

        const pdfBytes = await generateInvoicePDF(data);
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${billNo}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const billNo = "2509" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            setLastBillNumber(billNo);

            const billData = {
                billNumber: billNo,
                date,
                name,
                phone,
                email,
                paymentMode,
                items,
                totals: { totalAmount, totalDiscount, netAmount },
                gst: gstBreakdown,
                gstRate,
                balance: { amountPaid, balance }
            };

            const res = await fetch('/api/submit-bill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(billData)
            });

            if (!res.ok) throw new Error("Failed to submit");

            const finalData: BillData = {
                billNumber: billNo,
                date: new Date(date).toLocaleDateString(),
                customer: { name, phone, payment: paymentMode },
                items,
                totals: { totalAmount, totalDiscount, netAmount },
                gst: {
                    taxableAmount: gstBreakdown.taxable,
                    gstAmount: gstBreakdown.gst,
                    cgstAmount: gstBreakdown.cgst,
                    sgstAmount: gstBreakdown.sgst
                },
                balance: { amountPaid, balanceAmount: balance }
            };

            const pdfBytes = await generateInvoicePDF(finalData);
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${billNo}.pdf`;
            link.click();

            alert("Bill Saved & PDF Downloaded!");
        } catch (e) {
            console.error(e);
            alert("Error saving bill");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full mt-1 p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none transition-all";

    return (
        <div className="max-w-5xl mx-auto p-8 bg-white/60 backdrop-blur-sm shadow-xl rounded-2xl my-8 border border-pink-100">
            <h1 className="text-3xl font-bold text-stone-800 mb-8 border-b border-stone-100 pb-4">New Invoice</h1>

            {/* Customer Details */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold text-pink-600 mb-4">Customer Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm text-stone-500 font-medium">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm text-stone-500 font-medium">Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm text-stone-500 font-medium">Phone</label>
                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm text-stone-500 font-medium">Email (Optional)</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
                    </div>
                </div>
            </section>

            {/* Items */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold text-pink-600 mb-4 flex justify-between items-center">
                    Items
                    <button onClick={handleAddItem} className="flex items-center gap-2 text-sm bg-pink-50 text-pink-600 px-3 py-1 rounded-full hover:bg-pink-100 transition-colors">
                        <Plus size={16} /> Add Item
                    </button>
                </h2>

                <div className="overflow-x-auto rounded-lg border border-stone-100">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-pink-50 text-pink-800 border-b border-pink-100">
                            <tr>
                                <th className="p-3">Category</th>
                                <th className="p-3 w-20">Qty</th>
                                <th className="p-3 w-32">MRP</th>
                                <th className="p-3 w-24">Disc %</th>
                                <th className="p-3 w-32">Rate</th>
                                <th className="p-3 w-32">Amount</th>
                                <th className="p-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {items.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-pink-50/30">
                                    <td className="p-2">
                                        <select
                                            value={item.category}
                                            onChange={e => updateItem(item.id, 'category', e.target.value)}
                                            className="w-full p-2 border border-transparent hover:border-stone-200 rounded bg-transparent focus:border-pink-300 outline-none"
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                            className="w-full p-2 border border-stone-200 rounded focus:ring-2 focus:ring-pink-200 outline-none"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.mrp}
                                            onChange={e => updateItem(item.id, 'mrp', parseFloat(e.target.value) || 0)}
                                            className="w-full p-2 border border-stone-200 rounded focus:ring-2 focus:ring-pink-200 outline-none"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            min="0" max="100"
                                            value={item.discount}
                                            onChange={e => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                                            className="w-full p-2 border border-stone-200 rounded focus:ring-2 focus:ring-pink-200 outline-none"
                                        />
                                    </td>
                                    <td className="p-2 text-stone-500">Rs.{item.rate.toFixed(2)}</td>
                                    <td className="p-2 font-medium text-stone-800">Rs.{item.amount.toFixed(2)}</td>
                                    <td className="p-2">
                                        <button onClick={() => handleRemoveItem(item.id)} className="text-stone-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Calculations and Payment */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
                <div>
                    <h3 className="text-lg font-semibold text-stone-700 mb-3">Payment</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-stone-500 font-medium">Mode</label>
                            <select
                                value={paymentMode}
                                onChange={e => setPaymentMode(e.target.value)}
                                className={inputClass}
                            >
                                <option>Cash</option>
                                <option>Card</option>
                                <option>UPI</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-stone-500 font-medium">Amount Paid</label>
                            <input
                                type="number"
                                value={amountPaid}
                                onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)}
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-pink-50 rounded-lg border border-pink-100 flex justify-between items-center">
                        <span className="font-semibold text-pink-700">Balance</span>
                        <span className="font-bold text-xl text-pink-700">Rs.{balance.toFixed(2)}</span>
                    </div>
                </div>

                <div className="bg-stone-50 p-6 rounded-xl space-y-3 border border-stone-100/50">
                    <div className="flex justify-between text-stone-500">
                        <span>Total Amount</span>
                        <span>Rs.{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                        <span>Total Discount</span>
                        <span>- Rs.{totalDiscount.toFixed(2)}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-stone-200 text-sm text-stone-400 space-y-1">
                        <div className="flex justify-between">
                            <span>Taxable Amount</span>
                            <span>Rs.{gstBreakdown.taxable.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span>GST (%)</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={gstRate}
                                    onChange={e => setGstRate(parseFloat(e.target.value) || 0)}
                                    className="w-16 p-1 text-center border border-stone-200 rounded text-stone-700 focus:ring-1 focus:ring-pink-300 outline-none"
                                />
                            </div>
                            <span>Rs.{gstBreakdown.gst.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="border-t border-stone-200 pt-3 flex justify-between font-bold text-xl text-stone-800">
                        <span>Net Amount</span>
                        <span>Rs.{netAmount.toFixed(2)}</span>
                    </div>


                </div>
            </section>

            {/* Actions */}
            <div className="flex justify-end gap-4">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    Submit & Print
                </button>
            </div>
        </div>
    );
}
