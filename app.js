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

let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
let editTransactionId = null;

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
    const filteredTransactions = selectedCategory
        ? transactions.filter(t => t.category === selectedCategory)
        : transactions;
    
    displayTransactions(filteredTransactions);
};

// Transaction Management
function addTransaction(e) {
    if (e) e.preventDefault();
    
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = document.querySelector('input[name="transactionType"]:checked').value;
    const category = categorySelect.value;
    
    if (!description) {
        showAlert('Please enter a description', 'warning');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showAlert('Please enter a valid amount greater than 0', 'warning');
        return;
    }

    if (!category) {
        showAlert('Please choose a category', 'warning');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        description,
        amount: Math.abs(amount),
        type,
        category,
        date: new Date().toISOString()
    };

    transactions.push(transaction);
    saveTransactions();

    descriptionInput.value = '';
    amountInput.value = '';
    categorySelect.value = '';
    document.getElementById('incomeRadio').checked = true;
    editTransactionId = null;
    addTransactionButton.style.display = 'block';
    saveTransactionButton.style.display = 'none';

    updateBalance();
    displayTransactions();
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

function displayTransactions(list = transactions) {
    historyList.innerHTML = '';
    
    if (list.length === 0) {
        historyList.innerHTML = '<li class="list-group-item text-center py-4 text-muted">No transactions to show</li>';
    } else {
        list
            .slice()
            .sort((a, b) => b.id - a.id)
            .forEach(transaction => {
                const element = createTransactionElement(transaction);
                historyList.appendChild(element);
            });
    }

    const hasTransactions = transactions.length > 0;
    const userToggled = historySection.dataset.userToggled === 'true';
    
    if (!hasTransactions) {
        historySection.style.display = 'none';
        toggleHistoryButton.innerHTML = '<i class="bi bi-chevron-down"></i> Show';
        delete historySection.dataset.userToggled;
        return;
    }

    if (!userToggled) {
        historySection.style.display = 'block';
        toggleHistoryButton.innerHTML = '<i class="bi bi-chevron-up"></i> Hide';
        return;
    }

    const isHidden = historySection.style.display === 'none';
    toggleHistoryButton.innerHTML = `<i class="bi bi-chevron-${isHidden ? 'down' : 'up'}"></i> ${isHidden ? 'Show' : 'Hide'}`;
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    
    updateBalance();
    displayTransactions();
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function startEdit(transaction) {
    descriptionInput.value = transaction.description;
    amountInput.value = transaction.amount;
    categorySelect.value = transaction.category;
    document.querySelector(`input[value="${transaction.type}"]`).checked = true;
    
    addTransactionButton.style.display = 'none';
    saveTransactionButton.style.display = 'block';
    editTransactionId = transaction.id;
}

function saveEdit(e) {
    e.preventDefault();
    
    if (editTransactionId === null) return;
    const transactionIndex = transactions.findIndex(t => t.id === editTransactionId);
    
    if (transactionIndex === -1) return;
    
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = document.querySelector('input[name="transactionType"]:checked').value;
    const category = categorySelect.value;

    if (!description) {
        showAlert('Please enter a description', 'warning');
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        showAlert('Please enter a valid amount greater than 0', 'warning');
        return;
    }

    if (!category) {
        showAlert('Please choose a category', 'warning');
        return;
    }
    
    transactions[transactionIndex] = {
        ...transactions[transactionIndex],
        description,
        amount: Math.abs(amount),
        type,
        category,
        date: new Date().toISOString()
    };
    
    saveTransactions();
    
    descriptionInput.value = '';
    amountInput.value = '';
    categorySelect.value = '';
    document.getElementById('incomeRadio').checked = true;
    
    addTransactionButton.style.display = 'block';
    saveTransactionButton.style.display = 'none';
    editTransactionId = null;
    
    updateBalance();
    displayTransactions();
}

function updateBalance() {
    const balance = transactions.reduce((acc, transaction) => {
        return transaction.type === 'income' 
            ? acc + transaction.amount 
            : acc - transaction.amount;
    }, 0);
    
    balanceElement.textContent = `$${balance.toFixed(2)}`;
    balanceElement.className = `balance-display fs-2 fw-bold ${balance >= 0 ? 'positive' : 'negative'}`;
}

function exportToCSV() {
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

function showAlert(message, type = 'warning') {
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

// Event Listeners
addTransactionButton.addEventListener('click', addTransaction);
saveTransactionButton.addEventListener('click', saveEdit);
clearDataButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all transactions? This cannot be undone.')) {
        transactions = [];
        saveTransactions();
        updateBalance();
        displayTransactions();
    }
});

exportDataButton.addEventListener('click', exportToCSV);

toggleHistoryButton.addEventListener('click', () => {
    const isHidden = historySection.style.display === 'none';
    historySection.style.display = isHidden ? 'block' : 'none';
    historySection.dataset.userToggled = 'true';
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
    transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const darkMode = localStorage.getItem('darkMode') === 'true';

    updateBalance();
    displayTransactions();

    if (!transactions.length) {
        historySection.style.display = 'none';
        toggleHistoryButton.innerHTML = '<i class="bi bi-chevron-down"></i> Show';
    }

    if (darkMode) {
        darkModeToggle.checked = true;
        document.body.classList.add('dark-mode');
    }
});
