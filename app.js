// Get references to the DOM elements
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const transactionTypeSelect = document.getElementById('transaction-type');
const addTransactionButton = document.getElementById('add-transaction');
const saveTransactionButton = document.getElementById('save-transaction');
const balanceElement = document.getElementById('balance');
const historyList = document.getElementById('history-list');
const toggleHistoryButton = document.getElementById('toggle-history');
const historySection = document.getElementById('history-section');
const exportDataButton = document.getElementById('export-data');
const clearDataButton = document.getElementById('clear-data');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentEditIndex = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderTransactions();
    updateBalance();
    
    // Set up event listeners
    addTransactionButton.addEventListener('click', addTransaction);
    saveTransactionButton.addEventListener('click', saveTransaction);
    toggleHistoryButton.addEventListener('click', toggleHistory);
    exportDataButton.addEventListener('click', exportData);
    clearDataButton.addEventListener('click', clearData);
});

function renderTransactions() {
    historyList.innerHTML = '';
    
    if (transactions.length === 0) {
        historyList.innerHTML = '<li class="list-group-item text-center">No transactions yet</li>';
        return;
    }

    transactions.forEach((transaction, index) => {
        const transactionItem = document.createElement('li');
        transactionItem.className = `list-group-item d-flex justify-content-between align-items-center ${
            transaction.amount < 0 ? 'list-group-item-danger' : 'list-group-item-success'
        }`;
        
        transactionItem.innerHTML = `
            <span>
                <strong>${transaction.description}</strong><br>
                <small>${new Date(transaction.dateModified).toLocaleString()}</small>
            </span>
            <span>${transaction.amount < 0 ? '-$' : '$'}${Math.abs(transaction.amount).toFixed(2)}</span>
            <div>
                <button class="btn btn-sm btn-primary me-2 edit-transaction">Edit</button>
                <button class="btn btn-sm btn-danger delete-transaction">Delete</button>
            </div>
        `;

        // Edit button functionality
        transactionItem.querySelector('.edit-transaction').addEventListener('click', () => {
            editTransaction(index);
        });

        // Delete button functionality
        transactionItem.querySelector('.delete-transaction').addEventListener('click', () => {
            deleteTransaction(index);
        });

        historyList.appendChild(transactionItem);
    });
}

function updateBalance() {
    const balance = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    balanceElement.textContent = `$${balance.toFixed(2)}`;
    balanceElement.className = `fs-2 fw-bold ${balance < 0 ? 'negative' : 'positive'}`;
}

function saveTransactionsToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function addTransaction() {
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = transactionTypeSelect.value;

    if (!description) {
        alert('Please enter a description');
        return;
    }

    if (isNaN(amount) {
        alert('Please enter a valid amount');
        return;
    }

    const transactionAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    
    transactions.push({
        description,
        amount: transactionAmount,
        dateModified: new Date().toISOString(),
        type: type
    });
    
    saveTransactionsToLocalStorage();
    renderTransactions();
    updateBalance();

    // Clear inputs
    descriptionInput.value = '';
    amountInput.value = '';
    descriptionInput.focus();
}

function editTransaction(index) {
    const transaction = transactions[index];
    currentEditIndex = index;
    
    descriptionInput.value = transaction.description;
    amountInput.value = Math.abs(transaction.amount);
    transactionTypeSelect.value = transaction.amount < 0 ? 'expense' : 'income';
    
    addTransactionButton.style.display = 'none';
    saveTransactionButton.style.display = 'block';
    
    descriptionInput.focus();
}

function saveTransaction() {
    if (currentEditIndex === null) return;

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = transactionTypeSelect.value;

    if (!description) {
        alert('Please enter a description');
        return;
    }

    if (isNaN(amount)) {
        alert('Please enter a valid amount');
        return;
    }

    const transactionAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    
    transactions[currentEditIndex] = {
        description,
        amount: transactionAmount,
        dateModified: new Date().toISOString(),
        type: type
    };
    
    saveTransactionsToLocalStorage();
    renderTransactions();
    updateBalance();

    // Clear inputs and reset UI
    descriptionInput.value = '';
    amountInput.value = '';
    addTransactionButton.style.display = 'block';
    saveTransactionButton.style.display = 'none';
    currentEditIndex = null;
}

function deleteTransaction(index) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions.splice(index, 1);
        saveTransactionsToLocalStorage();
        renderTransactions();
        updateBalance();
    }
}

function toggleHistory() {
    const isVisible = historySection.style.display === 'block';
    historySection.style.display = isVisible ? 'none' : 'block';
    toggleHistoryButton.textContent = isVisible ? 'Show Transaction History' : 'Hide Transaction History';
}

function exportData() {
    const csvContent = 'data:text/csv;charset=utf-8,Description,Amount,Type,Date Modified\n' +
        transactions.map(t => 
            `"${t.description.replace(/"/g, '""')}",${t.amount},${t.type},"${new Date(t.dateModified).toLocaleString()}"`
        ).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearData() {
    if (confirm('Are you sure you want to clear all transactions? This cannot be undone.')) {
        transactions = [];
        saveTransactionsToLocalStorage();
        renderTransactions();
        updateBalance();
    }
}
