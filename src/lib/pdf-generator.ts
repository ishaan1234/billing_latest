import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface BillData {
    billNumber: string;
    date: string;
    customer: {
        name: string;
        phone: string;
        payment: string;
    };
    items: Array<{
        category: string;
        quantity: number;
        mrp: number;
        discount: number;
        rate: number;
        amount: number;
    }>;
    totals: {
        totalAmount: number;
        totalDiscount: number;
        netAmount: number;
    };
    gst: {
        taxableAmount: number;
        gstAmount: number;
        cgstAmount: number;
        sgstAmount: number;
    };
    balance: {
        amountPaid: number;
        balanceAmount: number;
    };
}

export async function generateInvoicePDF(data: BillData): Promise<Uint8Array> {
    const existingPdfBytes = await fetch('/ADS LetterHead.pdf').then((res) => res.arrayBuffer());

    // Main Doc
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Template Doc (Clean copy for new pages)
    const templateDoc = await PDFDocument.load(existingPdfBytes);

    let pages = pdfDoc.getPages();
    let currentPage = pages[0]; // Start on the first page

    const fontSize = 10;
    const rowHeight = 20;
    const startX = 200;
    const bottomMargin = 50;
    const topMargin = 600; // Reset Y for new pages

    let currentY = 600; // Start Y for first page

    // Helper to add page if needed
    const checkPageBreak = async () => {
        if (currentY < bottomMargin) {
            const [newPage] = await pdfDoc.copyPages(templateDoc, [0]);
            pdfDoc.addPage(newPage);
            currentPage = newPage;
            currentY = topMargin;
            return true;
        }
        return false;
    };

    // Helper to draw table
    const drawTable = async (headers: string[], rows: string[][], colWidths: number[]) => {
        const drawHeaders = () => {
            headers.forEach((header, i) => {
                const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
                currentPage.drawRectangle({
                    x: x, y: currentY - 5, width: colWidths[i], height: rowHeight,
                    borderColor: rgb(0, 0, 0), borderWidth: 1,
                });
                currentPage.drawText(header, {
                    x: x + 2, y: currentY + 2, size: fontSize, font: font, color: rgb(0, 0, 0),
                });
            });
        };

        if (await checkPageBreak()) {
            // New page started
        }

        drawHeaders();
        currentY -= rowHeight;

        // Draw Rows
        for (const row of rows) {
            const pageBroken = await checkPageBreak();
            if (pageBroken) {
                drawHeaders(); // Redraw headers on new page
                currentY -= rowHeight;
            }

            row.forEach((cell, i) => {
                const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
                currentPage.drawRectangle({
                    x: x, y: currentY - 5, width: colWidths[i], height: rowHeight,
                    borderColor: rgb(0, 0, 0), borderWidth: 1,
                });
                currentPage.drawText(cell, {
                    x: x + 2, y: currentY + 2, size: fontSize, font: font, color: rgb(0, 0, 0),
                });
            });
            currentY -= rowHeight;
        }
    };

    // Table 1: Customer Info 
    const custHeaders1 = ["Bill Number", "Date"];
    const custRows1 = [[data.billNumber, data.date]];
    const custWidths1 = [100, 100];

    await drawTable(custHeaders1, custRows1, custWidths1);

    // Row 2: Name, Phone, Payment
    const custHeaders2 = ["Name", "Phone", "Payment"];
    const custRows2 = [[data.customer.name, data.customer.phone, data.customer.payment]];
    const custWidths2 = [150, 100, 80];

    currentY -= 5;
    await drawTable(custHeaders2, custRows2, custWidths2);

    // Table 2: Item Details
    currentY -= 20;
    const itemHeaders = ["Category", "Qty", "MRP", "Disc%", "Rate", "Amount"];
    const itemRows = data.items.map(item => [
        item.category,
        item.quantity.toString(),
        `${item.mrp}`,
        `${item.discount}`,
        `${item.rate.toFixed(0)}`,
        `${item.amount.toFixed(0)}`
    ]);
    const itemColWidths = [90, 40, 70, 50, 70, 70];
    await drawTable(itemHeaders, itemRows, itemColWidths);

    // Table 3: Total Summary
    currentY -= 20;
    const summaryHeaders = ["Total", "Discount", "Net Amount"];
    const summaryRows = [[
        `Rs.${data.totals.totalAmount.toFixed(0)}`,
        `Rs.${data.totals.totalDiscount.toFixed(0)}`,
        `Rs.${data.totals.netAmount.toFixed(0)}`
    ]];
    const summaryColWidths = [100, 100, 100];
    await drawTable(summaryHeaders, summaryRows, summaryColWidths);

    // Table 4: GST
    currentY -= 20;
    const gstHeaders = ["Taxable", "GST"];
    const gstRows = [[
        `Rs.${data.gst.taxableAmount.toFixed(0)}`,
        `Rs.${data.gst.gstAmount.toFixed(0)}`
    ]];
    const gstColWidths = [150, 150];
    await drawTable(gstHeaders, gstRows, gstColWidths);

    // Table 5: Balance Amount
    currentY -= 20;
    const balHeaders = ["Paid", "Balance"];
    const balRows = [[
        `Rs.${data.balance.amountPaid.toFixed(0)}`,
        `Rs.${data.balance.balanceAmount.toFixed(0)}`
    ]];
    const balColWidths = [100, 100];
    await drawTable(balHeaders, balRows, balColWidths);

    // Disclaimers
    currentY -= 30;
    await checkPageBreak();

    const disclaimerSize = 9;
    const drawDisc = (text: string) => {
        // Check page break for each line of disclaimer could be good, but per-block is okay for now
        currentPage.drawText(text, { x: startX, y: currentY, size: disclaimerSize, font });
        currentY -= 15;
    };

    drawDisc("• All sales are final—no returns or exchanges.");
    drawDisc("• Please note that all products are dry clean only.");
    drawDisc("• Steam ironing only; do not iron directly on the fabric.");
    drawDisc("• Thank you for choosing to shop with us!");
    drawDisc("   We look forward to serving you again soon.");

    return pdfDoc.save();
}
