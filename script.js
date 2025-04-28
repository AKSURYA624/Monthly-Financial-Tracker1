document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('financialForm');
    const tableBody = document.getElementById('tableBody');
    
    // Load existing data from localStorage
    let financialData = JSON.parse(localStorage.getItem('financialData')) || [];
    
    // Display existing data
    displayData();
    
    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const formData = {
            date: document.getElementById('date').value,
            monthlyIncome: parseFloat(document.getElementById('monthlyIncome').value) || 0,
            rent: parseFloat(document.getElementById('rent').value) || 0,
            otherExpenses: parseFloat(document.getElementById('otherExpenses').value) || 0,
            roomExpenses: parseFloat(document.getElementById('roomExpenses').value) || 0,
            netSaving: parseFloat(document.getElementById('netSaving').value) || 0,
            sip: parseFloat(document.getElementById('sip').value) || 0
        };
        
        // Calculate total expenses and savings
        const totalExpenses = formData.rent + formData.otherExpenses + formData.roomExpenses;
        const totalSavings = formData.netSaving + formData.sip;
        
        // Calculate total amount (Income - Expenses - Savings)
        formData.totalAmount = formData.monthlyIncome - totalExpenses - totalSavings;
        
        // Validate data
        if (formData.totalAmount < 0) {
            alert('Total expenses and savings exceed monthly income!');
            return;
        }
        
        // Add to array
        financialData.push(formData);
        
        // Sort data by date (newest first)
        financialData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Save to localStorage
        localStorage.setItem('financialData', JSON.stringify(financialData));
        
        // Display updated data
        displayData();
        
        // Reset form
        form.reset();
        document.getElementById('date').valueAsDate = new Date();
    });
    
    function displayData() {
        tableBody.innerHTML = '';
        
        // Calculate totals
        const totals = {
            monthlyIncome: 0,
            rent: 0,
            otherExpenses: 0,
            roomExpenses: 0,
            netSaving: 0,
            sip: 0,
            totalAmount: 0
        };
        
        financialData.forEach((data, index) => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(data.date);
            const formattedDate = date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>₹${data.monthlyIncome.toFixed(2)}</td>
                <td>₹${data.rent.toFixed(2)}</td>
                <td>₹${data.otherExpenses.toFixed(2)}</td>
                <td>₹${data.roomExpenses.toFixed(2)}</td>
                <td>₹${data.netSaving.toFixed(2)}</td>
                <td>₹${data.sip.toFixed(2)}</td>
                <td>₹${data.totalAmount.toFixed(2)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" onclick="editEntry(${index})">Edit</button>
                        <button class="delete-btn" onclick="deleteEntry(${index})">Delete</button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // Add to totals
            totals.monthlyIncome += data.monthlyIncome;
            totals.rent += data.rent;
            totals.otherExpenses += data.otherExpenses;
            totals.roomExpenses += data.roomExpenses;
            totals.netSaving += data.netSaving;
            totals.sip += data.sip;
            totals.totalAmount += data.totalAmount;
        });
        
        // Add total row
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        totalRow.innerHTML = `
            <td><strong>Total</strong></td>
            <td><strong>₹${totals.monthlyIncome.toFixed(2)}</strong></td>
            <td><strong>₹${totals.rent.toFixed(2)}</strong></td>
            <td><strong>₹${totals.otherExpenses.toFixed(2)}</strong></td>
            <td><strong>₹${totals.roomExpenses.toFixed(2)}</strong></td>
            <td><strong>₹${totals.netSaving.toFixed(2)}</strong></td>
            <td><strong>₹${totals.sip.toFixed(2)}</strong></td>
            <td><strong>₹${totals.totalAmount.toFixed(2)}</strong></td>
            <td></td>
        `;
        
        tableBody.appendChild(totalRow);
        
        // Update summary totals
        const totalExpenses = totals.rent + totals.otherExpenses + totals.roomExpenses;
        const totalSavings = totals.netSaving + totals.sip;
        
        document.getElementById('totalIncome').textContent = `₹${totals.monthlyIncome.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toFixed(2)}`;
        document.getElementById('totalSavings').textContent = `₹${totalSavings.toFixed(2)}`;
        document.getElementById('totalSIP').textContent = `₹${totals.sip.toFixed(2)}`;
    }
    
    // Make functions available globally
    window.editEntry = function(index) {
        const data = financialData[index];
        document.getElementById('date').value = data.date;
        document.getElementById('monthlyIncome').value = data.monthlyIncome;
        document.getElementById('rent').value = data.rent;
        document.getElementById('otherExpenses').value = data.otherExpenses;
        document.getElementById('roomExpenses').value = data.roomExpenses;
        document.getElementById('netSaving').value = data.netSaving;
        document.getElementById('sip').value = data.sip;
        
        // Remove the old entry
        financialData.splice(index, 1);
        localStorage.setItem('financialData', JSON.stringify(financialData));
        displayData();
    };
    
    window.deleteEntry = function(index) {
        if (confirm('Are you sure you want to delete this entry?')) {
            financialData.splice(index, 1);
            localStorage.setItem('financialData', JSON.stringify(financialData));
            displayData();
        }
    };
}); 
document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expenseForm');
    const delayedExpensesBody = document.getElementById('delayedExpensesBody');
    const roomExpensesBody = document.getElementById('roomExpensesBody');
    
    // Load existing data from localStorage
    let expensesData = JSON.parse(localStorage.getItem('expensesData')) || {
        delayed: [],
        room: []
    };
    
    // Display existing data
    displayExpenses();
    
    // Set default date to today
    document.getElementById('expenseDate').valueAsDate = new Date();
    
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const formData = {
            date: document.getElementById('expenseDate').value,
            type: document.getElementById('expenseType').value,
            amount: parseFloat(document.getElementById('amount').value) || 0
        };
        
        // Calculate total (for now, just using amount as total)
        formData.total = formData.amount;
        
        // Add to appropriate array
        if (formData.type === 'delayed') {
            expensesData.delayed.push(formData);
        } else {
            expensesData.room.push(formData);
        }
        
        // Sort data by date (newest first)
        expensesData.delayed.sort((a, b) => new Date(b.date) - new Date(a.date));
        expensesData.room.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Save to localStorage
        localStorage.setItem('expensesData', JSON.stringify(expensesData));
        
        // Display updated data
        displayExpenses();
        
        // Reset form
        expenseForm.reset();
        document.getElementById('expenseDate').valueAsDate = new Date();
    });
    
    function displayExpenses() {
        delayedExpensesBody.innerHTML = '';
        roomExpensesBody.innerHTML = '';
        
        // Calculate totals
        const totals = {
            delayed: 0,
            room: 0
        };
        
        // Display delayed expenses
        expensesData.delayed.forEach((expense, index) => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(expense.date);
            const formattedDate = date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>₹${expense.amount.toFixed(2)}</td>
                <td>₹${expense.total.toFixed(2)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" onclick="editExpense('delayed', ${index})">Edit</button>
                        <button class="delete-btn" onclick="deleteExpense('delayed', ${index})">Delete</button>
                    </div>
                </td>
            `;
            
            delayedExpensesBody.appendChild(row);
            totals.delayed += expense.amount;
        });
        
        // Display room expenses
        expensesData.room.forEach((expense, index) => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(expense.date);
            const formattedDate = date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>₹${expense.amount.toFixed(2)}</td>
                <td>₹${expense.total.toFixed(2)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" onclick="editExpense('room', ${index})">Edit</button>
                        <button class="delete-btn" onclick="deleteExpense('room', ${index})">Delete</button>
                    </div>
                </td>
            `;
            
            roomExpensesBody.appendChild(row);
            totals.room += expense.amount;
        });
        
        // Update summary totals
        const totalAmountToPay = totals.delayed + totals.room;
        
        document.getElementById('totalDelayedExpenses').textContent = `₹${totals.delayed.toFixed(2)}`;
        document.getElementById('totalRoomExpenses').textContent = `₹${totals.room.toFixed(2)}`;
        document.getElementById('totalAmountToPay').textContent = `₹${totalAmountToPay.toFixed(2)}`;
    }
    
    // Make functions available globally
    window.editExpense = function(type, index) {
        const expense = expensesData[type][index];
        document.getElementById('expenseDate').value = expense.date;
        document.getElementById('expenseType').value = type;
        document.getElementById('amount').value = expense.amount;
        
        // Remove the old entry
        expensesData[type].splice(index, 1);
        localStorage.setItem('expensesData', JSON.stringify(expensesData));
        displayExpenses();
    };
    
    window.deleteExpense = function(type, index) {
        if (confirm('Are you sure you want to delete this expense?')) {
            expensesData[type].splice(index, 1);
            localStorage.setItem('expensesData', JSON.stringify(expensesData));
            displayExpenses();
        }
    };
}); 
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
// Initialize arrays to store money transactions
let moneyGiven = [];
let moneyTaken = [];

// Load data from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    loadMoneyTransactions();
    updateMoneySummary();
});

// Function to load money transactions from localStorage
function loadMoneyTransactions() {
    const savedMoneyGiven = localStorage.getItem('moneyGiven');
    const savedMoneyTaken = localStorage.getItem('moneyTaken');
    
    if (savedMoneyGiven) {
        moneyGiven = JSON.parse(savedMoneyGiven);
        displayMoneyGiven();
    }
    
    if (savedMoneyTaken) {
        moneyTaken = JSON.parse(savedMoneyTaken);
        displayMoneyTaken();
    }
}

// Function to save money transactions to localStorage
function saveMoneyTransactions() {
    localStorage.setItem('moneyGiven', JSON.stringify(moneyGiven));
    localStorage.setItem('moneyTaken', JSON.stringify(moneyTaken));
}

// Function to display money given transactions
function displayMoneyGiven() {
    const tbody = document.getElementById('moneyGivenBody');
    tbody.innerHTML = '';
    
    moneyGiven.forEach((transaction, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.personName}</td>
            <td>₹${transaction.amount.toFixed(2)}</td>
            <td>${transaction.recoveryDate}</td>
            <td>${transaction.status}</td>
            <td>
                <button onclick="Recovered(${index})" ${transaction.status === 'Recovered' ? 'disabled' : ''}> Recovered</button>
                <button onclick="deleteMoneyGiven(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to display money taken transactions
function displayMoneyTaken() {
    const tbody = document.getElementById('moneyTakenBody');
    tbody.innerHTML = '';
    
    moneyTaken.forEach((transaction, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.personName}</td>
            <td>₹${transaction.amount.toFixed(2)}</td>
            <td>${transaction.returnDate}</td>
            <td>${transaction.status}</td>
            <td>
                <button onclick="Returned(${index})" ${transaction.status === 'Returned' ? 'disabled' : ''}>Returned</button>
                <button onclick="deleteMoneyTaken(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to update money summary
function updateMoneySummary() {
    const totalToReceive = moneyGiven
        .filter(t => t.status === 'Pending')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalToPay = moneyTaken
        .filter(t => t.status === 'Pending')
        .reduce((sum, t) => sum + t.amount, 0);
    
    document.getElementById('totalToReceive').textContent = `₹${totalToReceive.toFixed(2)}`;
    document.getElementById('totalToPay').textContent = `₹${totalToPay.toFixed(2)}`;
}

// Function to add new money transaction
document.getElementById('moneyTransactionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const transactionType = document.getElementById('transactionType').value;
    const personName = document.getElementById('personName').value;
    const date = document.getElementById('transactionDate').value;
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const recoveryDate = document.getElementById('recoveryDate').value;
    
    const transaction = {
        personName,
        date,
        amount,
        status: 'Pending'
    };
    
    if (transactionType === 'given') {
        transaction.recoveryDate = recoveryDate;
        moneyGiven.push(transaction);
        displayMoneyGiven();
    } else {
        transaction.returnDate = recoveryDate;
        moneyTaken.push(transaction);
        displayMoneyTaken();
    }
    
    saveMoneyTransactions();
    updateMoneySummary();
    e.target.reset();
});

// Function to mark money given as recovered
function Recovered(index) {
    moneyGiven[index].status = 'Recovered';
    saveMoneyTransactions();
    displayMoneyGiven();
    updateMoneySummary();
}

// Function to mark money taken as returned
function Returned(index) {
    moneyTaken[index].status = 'Returned';
    saveMoneyTransactions();
    displayMoneyTaken();
    updateMoneySummary();
}

// Function to delete money given transaction
function deleteMoneyGiven(index) {
    moneyGiven.splice(index, 1);
    saveMoneyTransactions();
    displayMoneyGiven();
    updateMoneySummary();
}

// Function to delete money taken transaction
function deleteMoneyTaken(index) {
    moneyTaken.splice(index, 1);
    saveMoneyTransactions();
    displayMoneyTaken();
    updateMoneySummary();
}

// Function to download money transactions PDF
function downloadMoneyTransactionsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Money Transactions Report', 14, 15);
    
    // Add money given table
    doc.setFontSize(14);
    doc.text('Money Given', 14, 30);
    
    const moneyGivenData = moneyGiven.map(t => [
        t.date,
        t.personName,
        `₹${t.amount.toFixed(2)}`,
        t.recoveryDate,
        t.status
    ]);
    
    doc.autoTable({
        head: [['Date', 'Person Name', 'Amount', 'Recovery Date', 'Status']],
        body: moneyGivenData,
        startY: 35
    });
    
    // Add money taken table
    const moneyTakenY = doc.lastAutoTable.finalY + 15;
    doc.text('Money Taken', 14, moneyTakenY);
    
    const moneyTakenData = moneyTaken.map(t => [
        t.date,
        t.personName,
        `₹${t.amount.toFixed(2)}`,
        t.returnDate,
        t.status
    ]);
    
    doc.autoTable({
        head: [['Date', 'Person Name', 'Amount', 'Return Date', 'Status']],
        body: moneyTakenData,
        startY: moneyTakenY + 5
    });
    
    // Add summary
    const summaryY = doc.lastAutoTable.finalY + 15;
    doc.text('Summary', 14, summaryY);
    
    const totalToReceive = moneyGiven
        .filter(t => t.status === 'Pending')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalToPay = moneyTaken
        .filter(t => t.status === 'Pending')
        .reduce((sum, t) => sum + t.amount, 0);
    
    doc.autoTable({
        body: [
            ['Total Amount to Receive', `₹${totalToReceive.toFixed(2)}`],
            ['Total Amount to Pay', `₹${totalToPay.toFixed(2)}`]
        ],
        startY: summaryY + 5
    });
    
    doc.save('money_transactions_report.pdf');
} 