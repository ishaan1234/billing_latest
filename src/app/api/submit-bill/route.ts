import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// Spreadsheet ID from existing python code: "1pme8L67ABaSnLW60g93aE1TCyp-zEzY0HqcXepkbLZA"
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || "";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { billNumber, date, name, phone, email, paymentMode, items, totals, gst, gstRate, balance } = body;

        // Load Credentials from Environment Variables
        // Make sure to add GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY to your .env.local file

        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

        await doc.loadInfo(); // loads document properties and worksheets

        const sheet1 = doc.sheetsByIndex[0]; // Summary Sheet

        try {
            await sheet1.loadHeaderRow();
        } catch (e) {
            // Sheet likely empty or new. Initialize Headers.
            await sheet1.setHeaderRow([
                "Bill Number", "Date", "Name", "Phone", "Email", "Payment Mode",
                "Total Amount", "Total Discount", "Net Amount", "Amount Paid", "Balance",
                "Taxable Amount", "GST Amount", "GST %"
            ]);
        }

        let sheet2 = doc.sheetsByTitle['Sheet2'];

        // If not found by title, try index 1
        if (!sheet2 && doc.sheetCount > 1) {
            sheet2 = doc.sheetsByIndex[1];
        }

        if (!sheet2) {
            // Create Sheet2 if it doesn't exist
            sheet2 = await doc.addSheet({ title: 'Sheet2' });
        }

        // Ensure Sheet2 has headers
        try {
            await sheet2.loadHeaderRow();
        } catch (e) {
            await sheet2.setHeaderRow([
                "Bill Number", "Category", "Quantity", "MRP", "Discount%", "Rate", "Amount"
            ]);
        }

        // Optional: Check if Sheet1 needs headers
        // We can't easily check for empty headers without loading cells, but if it's a new "Untitled" sheet, it might be empty.
        // Let's safe-guard by checking if rowCount is very small or just append. 
        // Best not to overwrite existing headers if they exist.
        // We'll proceed with just appending for now, but creating Sheet2 is critical.

        // Prepare Sheet 1 Row (Summary)
        // Structure from Python:
        // Bill Number, Date, Name, Phone, Email, Payment, Total Amount, Total Discount, Net Amount, Amount Paid, Balance Amount, Taxable Amount, GST Amount, GST %

        // Formatting helper
        const fmt = (n: number | undefined | null) => `Rs.${(n || 0).toFixed(2)}`;

        const summaryRow = [
            billNumber,
            new Date(date).toISOString().split('T')[0], // YYYY-MM-DD
            name || "N/A",
            phone || "N/A",
            email || "N/A",
            paymentMode,
            fmt(totals.totalAmount),
            fmt(totals.totalDiscount),
            fmt(totals.netAmount),
            fmt(balance.amountPaid),
            fmt(balance.balanceAmount),
            fmt(gst.taxable), // Taxable Amount
            fmt(gst.gst),     // GST Amount
            `${gstRate}%`     // GST %
        ];

        await sheet1.addRow(summaryRow);

        // Prepare Sheet 2 Rows (Items)
        // Structure: Bill Number, Category, Quantity, MRP, Discount%, Rate, Amount
        for (const item of items) {
            const itemRow = [
                billNumber,
                item.category,
                item.quantity,
                fmt(item.mrp),
                `${item.discount}%`,
                fmt(item.rate),
                fmt(item.amount)
            ];
            await sheet2.addRow(itemRow);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Sheet Error:", error);
        return NextResponse.json({ error: "Failed to save to sheet" }, { status: 500 });
    }
}
