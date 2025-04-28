// Initialize jsPDF
const { jsPDF } = window.jspdf;

function downloadFinancialPDF() {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Monthly Financial Tracker Report', 14, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Add summary section
    doc.setFontSize(16);
    doc.text('Financial Summary', 14, 45);
    
    // Add summary details
    doc.setFontSize(12);
    doc.text(`Total Income: ₹${document.getElementById('totalIncome').textContent}`, 14, 55);
    doc.text(`Total Expenses: ₹${document.getElementById('totalExpenses').textContent}`, 14, 65);
    doc.text(`Total Savings: ₹${document.getElementById('totalSavings').textContent}`, 14, 75);
    doc.text(`Total SIP: ₹${document.getElementById('totalSIP').textContent}`, 14, 85);
    
    // Add financial records table
    doc.setFontSize(16);
    doc.text('Financial Records', 14, 100);
    
    // Get table data
    const table = document.getElementById('financialTable');
    const rows = Array.from(table.querySelectorAll('tr'));
    
    // Prepare data for the table
    const tableData = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map(cell => cell.textContent.replace('₹', ''));
    });
    
    // Add table to PDF
    doc.autoTable({
        head: [tableData[0]],
        body: tableData.slice(1),
        startY: 110,
        theme: 'grid',
        styles: {
            fontSize: 10,
            cellPadding: 5
        },
        headStyles: {
            fillColor: [76, 175, 80],
            textColor: 255
        }
    });
    
    // Save the PDF
    doc.save('financial-report.pdf');
}

function downloadExpensesPDF() {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Expenses Details Report', 14, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Add summary section
    doc.setFontSize(16);
    doc.text('Expense Summary', 14, 45);
    
    // Add summary details
    doc.setFontSize(12);
    doc.text(`Total Delayed Expenses: ₹${document.getElementById('totalDelayedExpenses').textContent}`, 14, 55);
    doc.text(`Total Room Expenses: ₹${document.getElementById('totalRoomExpenses').textContent}`, 14, 65);
    doc.text(`Total Amount to Pay: ₹${document.getElementById('totalAmountToPay').textContent}`, 14, 75);
    
    // Add delayed expenses table
    doc.setFontSize(16);
    doc.text('Delayed Expenses', 14, 90);
    
    // Get delayed expenses table data
    const delayedTable = document.getElementById('delayedExpensesTable');
    const delayedRows = Array.from(delayedTable.querySelectorAll('tr'));
    
    // Prepare data for the table
    const delayedTableData = delayedRows.map(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map(cell => cell.textContent.replace('₹', ''));
    });
    
    // Add delayed expenses table to PDF
    doc.autoTable({
        head: [delayedTableData[0]],
        body: delayedTableData.slice(1),
        startY: 100,
        theme: 'grid',
        styles: {
            fontSize: 10,
            cellPadding: 5
        },
        headStyles: {
            fillColor: [76, 175, 80],
            textColor: 255
        }
    });
    
    // Add room expenses table
    doc.setFontSize(16);
    doc.text('Room Expenses', 14, doc.lastAutoTable.finalY + 20);
    
    // Get room expenses table data
    const roomTable = document.getElementById('roomExpensesTable');
    const roomRows = Array.from(roomTable.querySelectorAll('tr'));
    
    // Prepare data for the table
    const roomTableData = roomRows.map(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map(cell => cell.textContent.replace('₹', ''));
    });
    
    // Add room expenses table to PDF
    doc.autoTable({
        head: [roomTableData[0]],
        body: roomTableData.slice(1),
        startY: doc.lastAutoTable.finalY + 30,
        theme: 'grid',
        styles: {
            fontSize: 10,
            cellPadding: 5
        },
        headStyles: {
            fillColor: [76, 175, 80],
            textColor: 255
        }
    });
    
    // Save the PDF
    doc.save('expenses-report.pdf');
} 