// DOM Elements
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const addTransactionButton = document.getElementById('add-transaction');
const saveTransactionButton = document.getElementById('save-transaction');
const balanceElement = document.getElementById('balance');
const historyList = document.getElementById('history-list');
const historySection = document.getElementById('history-section');
const toggleHistoryButton = document.getElementById('toggle-history');
const exportDataButton = document.getElementById('export-data');
const clearDataButton = document.getElementById('clear-data');
const darkModeToggle = document.getElementById('darkModeToggle');
const mobileAddButton = document.getElementById('mobile-add-btn');

// Initialize transactions from localStorage or empty array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentEditIndex = null;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    renderTransactions();
    updateBalance();
    setupEventListeners();
    
    // Initialize history section as collapsed
    historySection.style.display = 'none';
    toggleHistoryButton.innerHTML = '<i class="bi bi-chevron-down"></i> Show';
    
    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
});

function setupEventListeners() {
    // Add transaction button
    addTransactionButton.addEventListener('click', (e) => {
        e.preventDefault();
        addTransaction();
    });

    // Mobile add button
    mobileAddButton.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('description').focus();
    });

    // Save transaction button
    saveTransactionButton.addEventListener('click', (e) => {
        e.preventDefault();
        saveTransaction();
    });

    // Toggle history button
    toggleHistoryButton.addEventListener('click', toggleHistory);

    // Export data button
    exportDataButton.addEventListener('click', exportData);

    // Clear data button
    clearDataButton.addEventListener('click', clearData);

    // Dark mode toggle
    darkModeToggle.addEventListener('change', toggleDarkMode);
}

function addTransaction() {
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = document.querySelector('input[name="transactionType"]:checked').value;

    // Validation
    if (!description) {
        showAlert('Please enter a description', 'warning');
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        showAlert('Please enter a valid amount', 'warning');
        return;
    }

    // Create transaction
    const transactionAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    const newTransaction = {
        description,
        amount: transactionAmount,
        dateModified: new Date().toISOString(),
        type: type
    };

    // Add to transactions array
    transactions.push(newTransaction);
    saveTransactionsToLocalStorage();
    renderTransactions();
    updateBalance();

    // Clear form
    descriptionInput.value = '';
    amountInput.value = '';
    document.getElementById('incomeRadio').checked = true;
    descriptionInput.focus();
}

function renderTransactions() {
    historyList.innerHTML = '';
    
    if (transactions.length === 0) {
        historyList.innerHTML = '<li class="list-group-item text-center py-4">No transactions yet</li>';
        return;
    }

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.dateModified) - new Date(a.dateModified));

    transactions.forEach((transaction, index) => {
        const transactionItem = document.createElement('li');
        transactionItem.className = `list-group-item ${transaction.amount < 0 ? 'list-group-item-danger' : 'list-group-item-success'}`;
        
        const date = new Date(transaction.dateModified);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        
        transactionItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <strong>${transaction.description}</strong>
                    <div class="text-muted small mt-1">${formattedDate}</div>
                </div>
                <div class="text-end">
                    <span class="badge ${transaction.amount < 0 ? 'bg-danger' : 'bg-success'} mb-1">
                        ${transaction.amount < 0 ? 'Owe' : 'Gain'}
                    </span>
                    <div class="fw-bold">${transaction.amount < 0 ? '-$' : '$'}${Math.abs(transaction.amount).toFixed(2)}</div>
                </div>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-2">
                <button class="btn btn-sm btn-outline-primary edit-transaction">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-transaction">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;

        // Edit button
        transactionItem.querySelector('.edit-transaction').addEventListener('click', () => {
            editTransaction(index);
        });

        // Delete button
        transactionItem.querySelector('.delete-transaction').addEventListener('click', () => {
            deleteTransaction(index);
        });

        historyList.appendChild(transactionItem);
    });
}

function editTransaction(index) {
    const transaction = transactions[index];
    currentEditIndex = index;
    
    descriptionInput.value = transaction.description;
    amountInput.value = Math.abs(transaction.amount);
    document.getElementById(transaction.amount < 0 ? 'expenseRadio' : 'incomeRadio').checked = true;
    
    addTransactionButton.style.display = 'none';
    saveTransactionButton.style.display = 'block';
    
    descriptionInput.focus();
}

function saveTransaction() {
    if (currentEditIndex === null) return;

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = document.querySelector('input[name="transactionType"]:checked').value;

    if (!description) {
        showAlert('Please enter a description', 'warning');
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        showAlert('Please enter a valid amount', 'warning');
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

    // Reset form
    descriptionInput.value = '';
    amountInput.value = '';
    document.getElementById('incomeRadio').checked = true;
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

function updateBalance() {
    const balance = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    balanceElement.textContent = `$${balance.toFixed(2)}`;
    balanceElement.className = `balance-display fs-2 fw-bold ${balance < 0 ? 'negative' : 'positive'}`;
}

function saveTransactionsToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function toggleHistory() {
    const isVisible = historySection.style.display === 'block';
    historySection.style.display = isVisible ? 'none' : 'block';
    toggleHistoryButton.innerHTML = isVisible 
        ? '<i class="bi bi-chevron-down"></i> Show' 
        : '<i class="bi bi-chevron-up"></i> Hide';
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

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alert.style.zIndex = '1000';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150);
    }, 3000);
}
