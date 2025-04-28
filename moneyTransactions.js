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
                <button onclick="markAsRecovered(${index})" ${transaction.status === 'Recovered' ? 'disabled' : ''}>Mark as Recovered</button>
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
                <button onclick="markAsReturned(${index})" ${transaction.status === 'Returned' ? 'disabled' : ''}>Mark as Returned</button>
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
function markAsRecovered(index) {
    moneyGiven[index].status = 'Recovered';
    saveMoneyTransactions();
    displayMoneyGiven();
    updateMoneySummary();
}

// Function to mark money taken as returned
function markAsReturned(index) {
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