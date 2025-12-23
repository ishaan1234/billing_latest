const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

// MOCK DATA similar to what the frontend sends
const MOCK_BODY = {
    billNumber: "TEST-BILL-001",
    date: "2024-12-19",
    name: "Test Customer",
    phone: "1234567890",
    email: "test@example.com",
    paymentMode: "Cash",
    items: [
        { category: "Lehenga", quantity: 1, mrp: 1000, discount: 10, rate: 900, amount: 900 }
    ],
    totals: { totalAmount: 1000, totalDiscount: 100, netAmount: 900 },
    gst: { taxable: 857.14, gst: 42.86, cgst: 21.43, sgst: 21.43 },
    balance: { amountPaid: 0, balanceAmount: 900 }
};

const SPREADSHEET_ID = "1XA9zEIFiSXWU8WKp6wjGNjjtuu4ZeOoSrdn8AUaMwpc";

async function run() {
    console.log("Starting test submission...");
    try {
        const creds = JSON.parse(fs.readFileSync('billing.json', 'utf-8'));

        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

        console.log("Loading Info...");
        await doc.loadInfo();
        console.log("Loaded. Title:", doc.title);

        const sheet1 = doc.sheetsByIndex[0];
        console.log("Sheet1 Title:", sheet1.title);
        try {
            await sheet1.loadHeaderRow();
            console.log("Sheet1 Headers:", sheet1.headerValues);
        } catch (e) {
            console.log("Sheet1 has no headers yet.");
        }

        let sheet2 = doc.sheetsByTitle['Sheet2'];
        // ... (keep rest)


        if (!sheet2) {
            console.log("Sheet2 not found. Checking index 1...");
            if (doc.sheetCount > 1) {
                sheet2 = doc.sheetsByIndex[1];
                console.log("Found Sheet2 at index 1:", sheet2.title);
            } else {
                console.log("Creating Sheet2...");
                sheet2 = await doc.addSheet({ title: 'Sheet2' });
                await sheet2.setHeaderRow([
                    "Bill Number", "Category", "Quantity", "MRP", "Discount%", "Rate", "Amount"
                ]);
            }
        } else {
            console.log("Sheet2 found by title.");
        }

        const fmt = (n) => `Rs.${n.toFixed(2)}`;

        const summaryRow = [
            MOCK_BODY.billNumber,
            MOCK_BODY.date,
            MOCK_BODY.name,
            MOCK_BODY.phone,
            MOCK_BODY.email,
            MOCK_BODY.paymentMode,
            fmt(MOCK_BODY.totals.totalAmount),
            fmt(MOCK_BODY.totals.totalDiscount),
            fmt(MOCK_BODY.totals.netAmount),
            fmt(MOCK_BODY.balance.amountPaid),
            fmt(MOCK_BODY.balance.balanceAmount),
            fmt(MOCK_BODY.gst.taxable),
            fmt(MOCK_BODY.gst.gst),
            fmt(MOCK_BODY.gst.cgst),
            fmt(MOCK_BODY.gst.sgst)
        ];

        console.log("Adding Row to Sheet1...");
        await sheet1.addRow(summaryRow);
        console.log("Sheet1 Row Added.");

        console.log("Adding Rows to Sheet2...");
        for (const item of MOCK_BODY.items) {
            const itemRow = [
                MOCK_BODY.billNumber,
                item.category,
                item.quantity,
                fmt(item.mrp),
                `${item.discount}%`,
                fmt(item.rate),
                fmt(item.amount)
            ];
            await sheet2.addRow(itemRow);
        }
        console.log("Sheet2 Row Added.");
        console.log("SUCCESS");

    } catch (error) {
        console.error("ERROR DETECTED:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error(error);
        }
    }
}

run();
