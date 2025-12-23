import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// Reuse the same spreadsheet ID
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || "";

export async function GET() {
    try {
        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        const sheet1 = doc.sheetsByIndex[0]; // Summary Sheet

        try {
            await sheet1.loadHeaderRow();
        } catch (e) {
            // If headers don't exist, the sheet is empty. Return empty list.
            return NextResponse.json([]);
        }

        const rows = await sheet1.getRows();

        const bills = rows.map(row => ({
            billNumber: row.get('Bill Number'),
            date: row.get('Date'),
            name: row.get('Name'),
            phone: row.get('Phone'),
            email: row.get('Email'),
            paymentMode: row.get('Payment Mode'),
            totalAmount: row.get('Total Amount'),
            totalDiscount: row.get('Total Discount'),
            netAmount: row.get('Net Amount'),
            amountPaid: row.get('Amount Paid'),
            balance: row.get('Balance')
        }));

        // Reverse to show newest first
        return NextResponse.json(bills.reverse());
    } catch (error) {
        console.error("Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 });
    }
}
