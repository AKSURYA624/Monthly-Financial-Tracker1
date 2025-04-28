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