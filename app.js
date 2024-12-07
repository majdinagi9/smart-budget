// Get references to the DOM elements
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
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

function renderTransactions() {
    historyList.innerHTML = '';
    transactions.forEach((transaction, index) => {
        const transactionItem = document.createElement('li');
        transactionItem.className = `list-group-item d-flex justify-content-between align-items-center ${transaction.amount < 0 ? 'list-group-item-danger' : 'list-group-item-success'}`;
        transactionItem.innerHTML = `
            <span>
                <strong>${transaction.description}</strong><br>
                <small>${new Date(transaction.dateModified).toLocaleString()}</small>
            </span>
            <span>$${transaction.amount.toFixed(2)}</span>
            <div>
                <button class="btn btn-sm btn-primary me-2 edit-transaction">Edit</button>
                <button class="btn btn-sm btn-danger delete-transaction">Delete</button>
            </div>
        `;

        // Edit button functionality
        transactionItem.querySelector('.edit-transaction').addEventListener('click', () => {
            currentEditIndex = index;
            descriptionInput.value = transaction.description;
            amountInput.value = transaction.amount;
            addTransactionButton.style.display = 'none';
            saveTransactionButton.style.display = 'block';
        });

        // Delete button functionality
        transactionItem.querySelector('.delete-transaction').addEventListener('click', () => {
            transactions.splice(index, 1);
            saveTransactionsToLocalStorage();
            renderTransactions();
            updateBalance();
        });

        historyList.appendChild(transactionItem);
    });
}

function updateBalance() {
    const balance = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    balanceElement.textContent = `$${balance.toFixed(2)}`;
}

function saveTransactionsToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

addTransactionButton.addEventListener('click', () => {
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (description && !isNaN(amount)) {
        transactions.push({
            description,
            amount,
            dateModified: new Date().toISOString()
        });
        saveTransactionsToLocalStorage();
        renderTransactions();
        updateBalance();

        descriptionInput.value = '';
        amountInput.value = '';
    }
});

saveTransactionButton.addEventListener('click', () => {
    if (currentEditIndex !== null) {
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);

        if (description && !isNaN(amount)) {
            transactions[currentEditIndex] = {
                description,
                amount,
                dateModified: new Date().toISOString()
            };
            saveTransactionsToLocalStorage();
            renderTransactions();
            updateBalance();

            descriptionInput.value = '';
            amountInput.value = '';
            addTransactionButton.style.display = 'block';
            saveTransactionButton.style.display = 'none';
            currentEditIndex = null;
        }
    }
});

toggleHistoryButton.addEventListener('click', () => {
    const isVisible = historySection.style.display === 'block';
    historySection.style.display = isVisible ? 'none' : 'block';
    toggleHistoryButton.textContent = isVisible ? 'Show Transaction History' : 'Hide Transaction History';
});

exportDataButton.addEventListener('click', () => {
    const csvContent = 'data:text/csv;charset=utf-8,Description,Amount,Date Modified\n' +
        transactions.map(t => `${t.description},${t.amount},${new Date(t.dateModified).toLocaleString()}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

clearDataButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all transactions?')) {
        transactions = [];
        saveTransactionsToLocalStorage();
        renderTransactions();
        updateBalance();
    }
});

// Initial render
renderTransactions();
updateBalance();
