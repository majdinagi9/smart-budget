// DOM Elements
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const categoryFilter = document.getElementById('category-filter');
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

// Category Management
const getCategoryColor = (categoryValue) => {
    const option = categorySelect.querySelector(`option[value="${categoryValue}"]`);
    return option ? option.dataset.color : '#6c757d';
};

const getCategoryName = (categoryValue) => {
    const option = categorySelect.querySelector(`option[value="${categoryValue}"]`);
    return option ? option.textContent : 'Uncategorized';
};

const filterTransactions = () => {
    const selectedCategory = categoryFilter.value;
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    const filteredTransactions = selectedCategory
        ? transactions.filter(t => t.category === selectedCategory)
        : transactions;
    
    displayTransactions(filteredTransactions);
};

// Transaction Management
function addTransaction(e) {
    e.preventDefault();
    
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = document.querySelector('input[name="transactionType"]:checked').value;
    const category = categorySelect.value;
    
    if (!description || isNaN(amount) || !category) {
        alert('Please fill in all fields (description, amount, and category)');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        description,
        amount,
        type,
        category,
        date: new Date().toISOString()
    };

    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    descriptionInput.value = '';
    amountInput.value = '';
    categorySelect.value = '';

    updateBalance();
    displayTransactions(transactions);
}

function createTransactionElement(transaction) {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.dataset.id = transaction.id;

    const transactionAmount = transaction.type === 'income' ? 
        `+${transaction.amount}` : 
        `-${transaction.amount}`;

    const categoryColor = getCategoryColor(transaction.category);
    const categoryName = getCategoryName(transaction.category);

    li.innerHTML = `
        <div class="transaction-details">
            <div class="transaction-info">
                <div class="fw-bold">${transaction.description}</div>
                <div class="transaction-meta">
                    <span class="category-badge" style="background-color: ${categoryColor}">${categoryName}</span>
                    <span>${new Date(transaction.date).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="d-flex gap-2 align-items-center">
                <span class="${transaction.type === 'income' ? 'positive' : 'negative'} fw-bold">$${transactionAmount}</span>
                <button class="btn btn-sm btn-outline-primary edit-btn">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;

    return li;
}

function displayTransactions(transactions) {
    historyList.innerHTML = '';
    transactions
        .sort((a, b) => b.id - a.id)
        .forEach(transaction => {
            const element = createTransactionElement(transaction);
            historyList.appendChild(element);
        });
}

function deleteTransaction(id) {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const updatedTransactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    
    updateBalance();
    displayTransactions(updatedTransactions);
}

function startEdit(transaction) {
    descriptionInput.value = transaction.description;
    amountInput.value = transaction.amount;
    categorySelect.value = transaction.category;
    document.querySelector(`input[value="${transaction.type}"]`).checked = true;
    
    addTransactionButton.style.display = 'none';
    saveTransactionButton.style.display = 'block';
    saveTransactionButton.dataset.editId = transaction.id;
}

function saveEdit(e) {
    e.preventDefault();
    
    const editId = parseInt(saveTransactionButton.dataset.editId);
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const transactionIndex = transactions.findIndex(t => t.id === editId);
    
    if (transactionIndex === -1) return;
    
    transactions[transactionIndex] = {
        ...transactions[transactionIndex],
        description: descriptionInput.value.trim(),
        amount: parseFloat(amountInput.value),
        type: document.querySelector('input[name="transactionType"]:checked').value,
        category: categorySelect.value
    };
    
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    descriptionInput.value = '';
    amountInput.value = '';
    categorySelect.value = '';
    
    addTransactionButton.style.display = 'block';
    saveTransactionButton.style.display = 'none';
    delete saveTransactionButton.dataset.editId;
    
    updateBalance();
    displayTransactions(transactions);
}

function updateBalance() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const balance = transactions.reduce((acc, transaction) => {
        return transaction.type === 'income' 
            ? acc + transaction.amount 
            : acc - transaction.amount;
    }, 0);
    
    balanceElement.textContent = `$${balance.toFixed(2)}`;
    balanceElement.className = `balance-display fs-2 fw-bold ${balance >= 0 ? 'positive' : 'negative'}`;
}

function exportToCSV() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    if (transactions.length === 0) {
        alert('No transactions to export');
        return;
    }
    
    const csvContent = [
        ['Date', 'Description', 'Category', 'Type', 'Amount'],
        ...transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.description,
            getCategoryName(t.category),
            t.type,
            t.type === 'income' ? t.amount : -t.amount
        ])
    ]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Event Listeners
addTransactionButton.addEventListener('click', addTransaction);
saveTransactionButton.addEventListener('click', saveEdit);
clearDataButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all transactions? This cannot be undone.')) {
        localStorage.removeItem('transactions');
        updateBalance();
        displayTransactions([]);
    }
});

exportDataButton.addEventListener('click', exportToCSV);

toggleHistoryButton.addEventListener('click', () => {
    const isHidden = historySection.style.display === 'none';
    historySection.style.display = isHidden ? 'block' : 'none';
    toggleHistoryButton.innerHTML = `<i class="bi bi-chevron-${isHidden ? 'up' : 'down'}"></i> ${isHidden ? 'Hide' : 'Show'}`;
});

historyList.addEventListener('click', (e) => {
    const listItem = e.target.closest('.list-group-item');
    if (!listItem) return;
    
    if (e.target.closest('.delete-btn')) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            deleteTransaction(parseInt(listItem.dataset.id));
        }
    } else if (e.target.closest('.edit-btn')) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const transaction = transactions.find(t => t.id === parseInt(listItem.dataset.id));
        if (transaction) startEdit(transaction);
    }
});

categorySelect.addEventListener('change', () => {
    const isIncome = categorySelect.value.includes('salary') || 
                    categorySelect.value.includes('freelance') || 
                    categorySelect.value.includes('investments') ||
                    categorySelect.value.includes('other-income');
    
    document.getElementById(isIncome ? 'incomeRadio' : 'expenseRadio').checked = true;
});

categoryFilter.addEventListener('change', filterTransactions);

darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', darkModeToggle.checked);
});

mobileAddButton.addEventListener('click', () => {
    document.querySelector('.input-section').scrollIntoView({ behavior: 'smooth' });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const darkMode = localStorage.getItem('darkMode') === 'true';
    
    updateBalance();
    displayTransactions(transactions);
    
    if (darkMode) {
        darkModeToggle.checked = true;
        document.body.classList.add('dark-mode');
    }
});
const toggleHistoryButton = document.getElementById('toggle-history');
const exportDataButton = document.getElementById('export-data');

// Category Management
const getCategoryColor = (categoryValue) => {
    const option = categorySelect.querySelector(`option[value="${categoryValue}"]`);
    return option ? option.dataset.color : '#6c757d';
};

const getCategoryName = (categoryValue) => {
    const option = categorySelect.querySelector(`option[value="${categoryValue}"]`);
    return option ? option.textContent : 'Uncategorized';
};

const filterTransactions = () => {
    const selectedCategory = categoryFilter.value;
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    const filteredTransactions = selectedCategory
        ? transactions.filter(t => t.category === selectedCategory)
        : transactions;
    
    displayTransactions(filteredTransactions);
};

// Event Listeners
categorySelect.addEventListener('change', () => {
    const isIncome = categorySelect.value.includes('salary') || 
                    categorySelect.value.includes('freelance') || 
                    categorySelect.value.includes('investments') ||
                    categorySelect.value.includes('other-income');
    
    document.getElementById(isIncome ? 'incomeRadio' : 'expenseRadio').checked = true;
});

categoryFilter.addEventListener('change', filterTransactions);
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
