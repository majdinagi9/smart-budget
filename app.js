// DOM Elements
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const categoryFilter = document.getElementById('category-filter');
const addTransactionButton = document.getElementById('add-transaction');
const saveTransactionButton = document.getElementById('save-transaction');
const balanceElement = document.getElementById('balance');
const balanceScope = document.getElementById('balance-scope');
const historyList = document.getElementById('history-list');
const historySection = document.getElementById('history-section');
const toggleHistoryButton = document.getElementById('toggle-history');
const exportDataButton = document.getElementById('export-data');
const clearDataButton = document.getElementById('clear-data');
const mobileAddButton = document.getElementById('mobile-add-btn');
const tabButtons = document.querySelectorAll('[data-tab-target]');
const tabPanels = document.querySelectorAll('[data-tab-panel]');
const categoryPillGroup = document.getElementById('category-pill-group');
const categoryHint = document.getElementById('category-hint');
const categoryGuidance = document.getElementById('category-guidance');
const themeModeSelect = document.getElementById('themeMode');
const accentOptionsContainer = document.getElementById('accent-options');
const insightIncome = document.getElementById('insight-income');
const insightExpense = document.getElementById('insight-expense');
const insightTopCategory = document.getElementById('insight-top-category');
const insightTopCategoryAmount = document.getElementById('insight-top-category-amount');
const insightRecent = document.getElementById('insight-recent');
const categoryBalanceIndicator = document.getElementById('category-balance-indicator');
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoPriority = document.getElementById('todo-priority');
const todoList = document.getElementById('todo-list');
const todoProgress = document.getElementById('todo-progress');

let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
let editTransactionId = null;
let todos = JSON.parse(localStorage.getItem('organizerTodos') || '[]');
const THEME_STORAGE_KEY = 'themeMode';
const ACCENT_STORAGE_KEY = 'accentColor';
const TODO_STORAGE_KEY = 'organizerTodos';
const prefersDarkScheme = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : { matches: false, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {} };

const CATEGORY_CONFIG = [
    { value: 'salary', label: 'Salary', type: 'income', color: '#28a745', hint: 'Log your paycheck or recurring income.' },
    { value: 'freelance', label: 'Freelance', type: 'income', color: '#20c997', hint: 'Track side gigs and one-off projects.' },
    { value: 'investments', label: 'Investments', type: 'income', color: '#198754', hint: 'Record dividends, interest, or payouts.' },
    { value: 'other-income', label: 'Other Income', type: 'income', color: '#25ba4e', hint: 'Gifts, reimbursements, and misc gains.' },
    { value: 'food', label: 'Food & Dining', type: 'expense', color: '#dc3545', hint: 'Dining out, groceries, and coffee runs.' },
    { value: 'transport', label: 'Transport', type: 'expense', color: '#fd7e14', hint: 'Fuel, rideshares, public transit, parking.' },
    { value: 'bills', label: 'Bills & Utilities', type: 'expense', color: '#6f42c1', hint: 'Electricity, rent, subscriptions, and more.' },
    { value: 'shopping', label: 'Shopping', type: 'expense', color: '#e83e8c', hint: 'Clothes, gifts, and retail therapy.' },
    { value: 'entertainment', label: 'Entertainment', type: 'expense', color: '#0dcaf0', hint: 'Streaming, movies, concerts, and fun.' },
    { value: 'health', label: 'Healthcare', type: 'expense', color: '#20c997', hint: 'Medical, wellness, and pharmacy costs.' },
    { value: 'education', label: 'Education', type: 'expense', color: '#0d6efd', hint: 'Courses, supplies, and learning tools.' },
    { value: 'other-expense', label: 'Other Expense', type: 'expense', color: '#6c757d', hint: 'Everything that does not fit elsewhere.' }
];

const CATEGORY_LOOKUP = CATEGORY_CONFIG.reduce((acc, category) => {
    acc[category.value] = category;
    return acc;
}, {});

// Category Management
const getCategoryColor = (categoryValue) => {
    return CATEGORY_LOOKUP[categoryValue]?.color || '#6c757d';
};

const getCategoryName = (categoryValue) => {
    return CATEGORY_LOOKUP[categoryValue]?.label || 'Uncategorized';
};

const getCategoryConfig = (categoryValue) => CATEGORY_LOOKUP[categoryValue];

const hexToRgba = (hex, alpha = 1) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const sanitized = hex.replace('#', '');
    const bigint = parseInt(sanitized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const DEFAULT_CATEGORY_HINT = 'Choose a category to see smart tips.';
const DEFAULT_GUIDANCE = 'Picking a category will auto-select the right type.';
let activeCategoryFilter = categoryFilter?.value || '';
const TODO_PRIORITY_META = {
    high: { label: 'High', className: 'bg-danger' },
    normal: { label: 'Normal', className: 'bg-secondary' },
    low: { label: 'Low', className: 'bg-success' }
};
const TODO_PRIORITY_ORDER = { high: 3, normal: 2, low: 1 };
const MAX_ORDER_VALUE = 100;

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const formatCurrency = (value, { includePlus = false } = {}) => {
    const base = currencyFormatter.format(Math.abs(value));
    if (value < 0) return `-${base}`;
    if (value > 0 && includePlus) return `+${base}`;
    return base;
};

const calculateNet = (list = []) => list.reduce((sum, transaction) => {
    const amount = Math.abs(transaction.amount);
    return transaction.type === 'income' ? sum + amount : sum - amount;
}, 0);

const getFilteredTransactions = () => {
    if (!activeCategoryFilter) return transactions;
    return transactions.filter(t => t.category === activeCategoryFilter);
};

const filterTransactions = () => {
    activeCategoryFilter = categoryFilter.value;
    displayTransactions();
    updateBalance();
};

const normalizeTodo = (todo, index = 0) => ({
    ...todo,
    order: typeof todo.order === 'number' ? todo.order : Math.min((index + 1) * 10, MAX_ORDER_VALUE),
    subtasks: Array.isArray(todo.subtasks) ? todo.subtasks : []
});

const sortTodos = (list) => list
    .slice()
    .sort((a, b) => {
        const priorityDiff = (TODO_PRIORITY_ORDER[b.priority] || 0) - (TODO_PRIORITY_ORDER[a.priority] || 0);
        if (priorityDiff !== 0) return priorityDiff;
        const orderDiff = (a.order ?? 50) - (b.order ?? 50);
        if (orderDiff !== 0) return orderDiff;
        return new Date(a.createdAt) - new Date(b.createdAt);
    });

todos = Array.isArray(todos) ? todos.map((todo, index) => normalizeTodo(todo, index)) : [];

const setActiveTab = (target) => {
    tabButtons.forEach(button => {
        const isActive = button.dataset.tabTarget === target;
        button.classList.toggle('active', isActive);
    });
    tabPanels.forEach(panel => {
        const isActive = panel.dataset.tabPanel === target;
        panel.classList.toggle('active', isActive);
    });
};

const setupTabs = () => {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => setActiveTab(button.dataset.tabTarget));
    });
};

const saveTodos = () => {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
};

const updateTodoProgress = () => {
    if (!todoProgress) return;
    const completed = todos.filter(todo => todo.completed).length;
    todoProgress.textContent = `${completed} of ${todos.length} complete`;
};

const renderTodos = () => {
    if (!todoList) return;
    todoList.innerHTML = '';
    
    if (todos.length === 0) {
        todoList.innerHTML = '<li class="list-group-item text-center text-muted py-4">No tasks yet</li>';
        updateTodoProgress();
        return;
    }
    
    sortTodos(todos).forEach(todo => {
        const meta = TODO_PRIORITY_META[todo.priority] || TODO_PRIORITY_META.normal;
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.dataset.id = todo.id;

        const subtaskMarkup = todo.subtasks.length
            ? `<ul class="list-group list-group-flush small ms-4 mt-2">
                ${todo.subtasks.map(subtask => `
                    <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                        <div class="d-flex align-items-center gap-2">
                            <input class="form-check-input" type="checkbox" data-role="subtodo-toggle" data-subtask-id="${subtask.id}" ${subtask.completed ? 'checked' : ''}>
                            <span class="${subtask.completed ? 'text-decoration-line-through text-muted' : ''}">${subtask.text}</span>
                        </div>
                        <button class="btn btn-sm btn-outline-danger" data-action="delete-subtask" data-subtask-id="${subtask.id}">
                            <i class="bi bi-x"></i>
                        </button>
                    </li>
                `).join('')}
            </ul>`
            : '';

        li.innerHTML = `
            <div class="flex-grow-1">
                <div class="todo-meta">
                    <input class="form-check-input me-2" type="checkbox" data-role="todo-toggle" ${todo.completed ? 'checked' : ''}>
                    <span class="${todo.completed ? 'text-decoration-line-through text-muted' : ''}">${todo.text}</span>
                    <span class="badge ${meta.className}">${meta.label}</span>
                </div>
                ${subtaskMarkup}
                <div class="d-flex align-items-center gap-2 mt-2">
                    <i class="bi bi-arrows-move text-muted"></i>
                    <input type="range" class="form-range todo-order-slider" min="0" max="${MAX_ORDER_VALUE}" value="${todo.order ?? 50}">
                </div>
            </div>
            <div class="todo-actions d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary" data-action="add-subtask">
                    <i class="bi bi-node-plus"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" data-action="delete">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        todoList.appendChild(li);
    });
    
    updateTodoProgress();
};

const addTodo = (text, priority) => {
    const todo = {
        id: Date.now(),
        text,
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
        order: Math.min((todos.length + 1) * 10, MAX_ORDER_VALUE),
        subtasks: []
    };
    todos.push(todo);
    saveTodos();
    renderTodos();
};

const toggleTodo = (id) => {
    todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
    saveTodos();
    renderTodos();
};

const deleteTodo = (id) => {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
};

const updateTodoOrder = (id, order) => {
    todos = todos.map(todo => todo.id === id ? { ...todo, order } : todo);
    saveTodos();
    renderTodos();
};

const addSubtask = (todoId, text) => {
    if (!text) return;
    const newSubtask = {
        id: Date.now(),
        text,
        completed: false
    };
    todos = todos.map(todo => todo.id === todoId
        ? { ...todo, subtasks: [...todo.subtasks, newSubtask] }
        : todo
    );
    saveTodos();
    renderTodos();
};

const toggleSubtask = (todoId, subtaskId) => {
    todos = todos.map(todo => todo.id === todoId
        ? {
            ...todo,
            subtasks: todo.subtasks.map(subtask =>
                subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
            )
        }
        : todo
    );
    saveTodos();
    renderTodos();
};

const deleteSubtask = (todoId, subtaskId) => {
    todos = todos.map(todo => todo.id === todoId
        ? { ...todo, subtasks: todo.subtasks.filter(subtask => subtask.id !== subtaskId) }
        : todo
    );
    saveTodos();
    renderTodos();
};

const renderCategoryPills = () => {
    if (!categoryPillGroup) return;
    categoryPillGroup.innerHTML = '';
    
    CATEGORY_CONFIG.forEach(category => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'category-pill';
        pill.dataset.value = category.value;
        pill.dataset.color = category.color;
        pill.dataset.type = category.type;
        pill.title = category.label;
        pill.setAttribute('aria-pressed', 'false');
        pill.setAttribute('aria-label', `${category.label} category`);
        pill.style.backgroundColor = hexToRgba(category.color, 0.08);
        pill.style.color = category.color;
        pill.textContent = category.label;
        categoryPillGroup.appendChild(pill);
    });
    
    const currentCategory = categorySelect ? categorySelect.value : '';
    setActiveCategory(currentCategory || null);
};

const setActiveCategory = (categoryValue) => {
    categoryPillGroup?.querySelectorAll('.category-pill').forEach(pill => {
        const isActive = pill.dataset.value === categoryValue;
        pill.classList.toggle('active', isActive);
        pill.style.backgroundColor = isActive 
            ? pill.dataset.color 
            : hexToRgba(pill.dataset.color, 0.08);
        pill.style.color = isActive ? '#ffffff' : pill.dataset.color;
        if (isActive) {
            pill.style.borderColor = pill.dataset.color;
        } else {
            pill.style.borderColor = 'transparent';
        }
        pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    
    if (categorySelect) {
        categorySelect.value = categoryValue || '';
    }
    updateCategoryHint(categoryValue);
    
    const config = getCategoryConfig(categoryValue);
    if (config) {
        document.getElementById(config.type === 'income' ? 'incomeRadio' : 'expenseRadio').checked = true;
    }
};

const updateCategoryHint = (categoryValue) => {
    if (!categoryHint || !categoryGuidance) return;
    
    if (!categoryValue) {
        categoryHint.textContent = DEFAULT_CATEGORY_HINT;
        categoryGuidance.textContent = DEFAULT_GUIDANCE;
        return;
    }
    
    const config = getCategoryConfig(categoryValue);
    categoryHint.textContent = config?.hint || DEFAULT_CATEGORY_HINT;
    categoryGuidance.textContent = config?.type === 'income'
        ? 'Great! Gains add to your balance.'
        : 'Heads up: owes reduce your balance.';
};

const applyTheme = (mode) => {
    const resolvedMode = mode === 'auto'
        ? (prefersDarkScheme.matches ? 'dark' : 'light')
        : mode;
    document.body.classList.toggle('dark-mode', resolvedMode === 'dark');
};

const applyAccent = (color) => {
    if (!color) return;
    document.documentElement.style.setProperty('--primary-color', color);
    document.documentElement.style.setProperty('--accent-color', color);
    document.documentElement.style.setProperty('--accent-color-soft', hexToRgba(color, 0.15));
};

const setAccent = (color) => {
    localStorage.setItem(ACCENT_STORAGE_KEY, color);
    applyAccent(color);
    accentOptionsContainer?.querySelectorAll('.accent-swatch').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.accent === color);
    });
};

const initializeThemeControls = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'auto';
    if (themeModeSelect) {
        themeModeSelect.value = savedTheme;
    }
    applyTheme(savedTheme);
    
    const savedAccent = localStorage.getItem(ACCENT_STORAGE_KEY) || '#0d6efd';
    setAccent(savedAccent);
};

const handleSystemThemeChange = () => {
    if ((localStorage.getItem(THEME_STORAGE_KEY) || 'auto') === 'auto') {
        applyTheme('auto');
    }
};

if (prefersDarkScheme.addEventListener) {
    prefersDarkScheme.addEventListener('change', handleSystemThemeChange);
} else if (prefersDarkScheme.addListener) {
    prefersDarkScheme.addListener(handleSystemThemeChange);
}

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
    document.getElementById('incomeRadio').checked = true;
    setActiveCategory(null);
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
    li.dataset.transaction = 'true';

    const normalizedAmount = Math.abs(transaction.amount);
    const signedAmount = transaction.type === 'income'
        ? normalizedAmount
        : -normalizedAmount;
    const transactionAmount = formatCurrency(signedAmount, { includePlus: true });

    const categoryColor = getCategoryColor(transaction.category);
    const categoryName = getCategoryName(transaction.category);
    const transactionDate = new Date(transaction.date || transaction.dateModified || transaction.id);

    li.innerHTML = `
        <div class="transaction-details">
            <div class="transaction-info">
                <div class="fw-bold">${transaction.description}</div>
                <div class="transaction-meta">
                    <span class="category-badge" style="background-color: ${categoryColor}">${categoryName}</span>
                    <span>${transactionDate.toLocaleDateString()}</span>
                </div>
            </div>
            <div class="d-flex gap-2 align-items-center">
                <span class="${transaction.type === 'income' ? 'positive' : 'negative'} fw-bold">${transactionAmount}</span>
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

function displayTransactions(list) {
    historyList.innerHTML = '';
    const data = Array.isArray(list) ? list : getFilteredTransactions();
    
    if (data.length === 0) {
        const message = transactions.length === 0 
            ? 'No transactions yet'
            : 'No transactions match this view';
        historyList.innerHTML = `<li class="list-group-item text-center py-4 text-muted">${message}</li>`;
    } else {
        const grouped = data.reduce((acc, transaction) => {
            const sourceDate = transaction.date || transaction.dateModified || new Date().toISOString();
            const isoKey = sourceDate.split('T')[0];
            const timestamp = new Date(sourceDate).getTime();
            
            if (!acc[isoKey]) {
                acc[isoKey] = { label: formatGroupLabel(isoKey), timestamp, items: [] };
            }
            
            acc[isoKey].items.push(transaction);
            return acc;
        }, {});
        
        Object.values(grouped)
            .sort((a, b) => b.timestamp - a.timestamp)
            .forEach(group => {
                const header = document.createElement('li');
                header.className = 'list-group-item group-header';
                header.textContent = group.label;
                historyList.appendChild(header);
                
                group.items
                    .sort((a, b) => parseTransactionDate(b) - parseTransactionDate(a))
                    .forEach(transaction => {
                        const element = createTransactionElement(transaction);
                        historyList.appendChild(element);
                    });
            });
    }

    const hasTransactions = transactions.length > 0;
    if (!hasTransactions) {
        historySection.style.display = 'none';
        toggleHistoryButton.innerHTML = '<i class="bi bi-chevron-down"></i> Show';
        delete historySection.dataset.userToggled;
        return;
    }

    if (historySection.dataset.userToggled !== 'true') {
        historySection.style.display = 'block';
        toggleHistoryButton.innerHTML = '<i class="bi bi-chevron-up"></i> Hide';
        return;
    }

    const isHidden = historySection.style.display === 'none';
    toggleHistoryButton.innerHTML = `<i class="bi bi-chevron-${isHidden ? 'down' : 'up'}"></i> ${isHidden ? 'Show' : 'Hide'}`;
}

const parseTransactionDate = (transaction) => {
    const source = transaction.date || transaction.dateModified || transaction.id;
    return new Date(source);
};

const formatGroupLabel = (isoDate) => {
    const target = new Date(isoDate);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (isSameDay(target, today)) return 'Today';
    if (isSameDay(target, yesterday)) return 'Yesterday';
    
    return target.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const isSameDay = (a, b) => 
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

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
    amountInput.value = Math.abs(transaction.amount);
    categorySelect.value = transaction.category;
    setActiveCategory(transaction.category);
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
    document.getElementById('incomeRadio').checked = true;
    setActiveCategory(null);
    
    addTransactionButton.style.display = 'block';
    saveTransactionButton.style.display = 'none';
    editTransactionId = null;
    
    updateBalance();
    displayTransactions();
}

function updateBalance() {
    const filteredList = getFilteredTransactions();
    const totalNet = calculateNet(transactions);
    const filteredNet = calculateNet(filteredList);
    const valueToShow = activeCategoryFilter ? filteredNet : totalNet;
    
    balanceElement.textContent = formatCurrency(valueToShow);
    balanceElement.className = `balance-display fs-2 fw-bold ${valueToShow >= 0 ? 'positive' : 'negative'}`;
    
    if (balanceScope) {
        balanceScope.textContent = activeCategoryFilter
            ? `${getCategoryName(activeCategoryFilter)} · ${formatCurrency(filteredNet)}`
            : `All categories · ${formatCurrency(totalNet)}`;
    }
    
    updateCategoryBalanceIndicator(filteredList);
    updateInsights();
}

function updateCategoryBalanceIndicator(list = []) {
    if (!categoryBalanceIndicator) return;
    const label = activeCategoryFilter ? getCategoryName(activeCategoryFilter) : 'All categories';
    const net = calculateNet(list);
    const formatted = formatCurrency(net, { includePlus: true });
    categoryBalanceIndicator.textContent = `${label} · Balance ${formatted}`;
    categoryBalanceIndicator.classList.toggle('text-success', net >= 0);
    categoryBalanceIndicator.classList.toggle('text-danger', net < 0);
}

function updateInsights() {
    if (!insightIncome || !insightExpense || !insightTopCategory || !insightRecent || !insightTopCategoryAmount) return;
    
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    
    insightIncome.textContent = formatCurrency(totalIncome);
    insightExpense.textContent = formatCurrency(-totalExpense);
    
    const expenseByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, transaction) => {
            acc[transaction.category] = (acc[transaction.category] || 0) + Math.abs(transaction.amount);
            return acc;
        }, {});
    
    const topCategoryEntry = Object.entries(expenseByCategory)
        .sort((a, b) => b[1] - a[1])[0];
    
    if (topCategoryEntry) {
        insightTopCategory.textContent = getCategoryName(topCategoryEntry[0]);
        insightTopCategoryAmount.textContent = formatCurrency(-topCategoryEntry[1]);
    } else {
        insightTopCategory.textContent = 'No data yet';
        insightTopCategoryAmount.textContent = formatCurrency(0);
    }
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    
    const recentExpense = transactions
        .filter(t => t.type === 'expense')
        .filter(t => parseTransactionDate(t) >= sevenDaysAgo)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    insightRecent.textContent = formatCurrency(-recentExpense);
}

function exportToCSV() {
    if (transactions.length === 0) {
        alert('No transactions to export');
        return;
    }
    
    const csvContent = [
        ['Date', 'Description', 'Category', 'Type', 'Amount'],
        ...transactions.map(t => [
            parseTransactionDate(t).toLocaleDateString(),
            t.description,
            getCategoryName(t.category),
            t.type,
            t.type === 'income' ? Math.abs(t.amount) : -Math.abs(t.amount)
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
        setActiveCategory(null);
    }
});

exportDataButton.addEventListener('click', exportToCSV);

toggleHistoryButton.addEventListener('click', () => {
    const isHidden = historySection.style.display === 'none';
    historySection.style.display = isHidden ? 'block' : 'none';
    if (transactions.length) {
        historySection.dataset.userToggled = 'true';
    }
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

categoryFilter.addEventListener('change', filterTransactions);

categoryPillGroup?.addEventListener('click', (e) => {
    const pill = e.target.closest('.category-pill');
    if (!pill) return;
    setActiveCategory(pill.dataset.value);
});

todoForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;
    addTodo(text, todoPriority.value);
    todoForm.reset();
    todoInput.focus();
});

todoList?.addEventListener('change', (e) => {
    const checkbox = e.target.closest('input[type="checkbox"]');
    if (!checkbox) return;
    const todoItem = checkbox.closest('li[data-id]');
    if (!todoItem) return;
    const todoId = parseInt(todoItem.dataset.id);
    
    if (checkbox.dataset.role === 'todo-toggle') {
        toggleTodo(todoId);
    } else if (checkbox.dataset.role === 'subtodo-toggle') {
        const subtaskId = parseInt(checkbox.dataset.subtaskId);
        toggleSubtask(todoId, subtaskId);
    }
});

todoList?.addEventListener('input', (e) => {
    const slider = e.target.closest('.todo-order-slider');
    if (!slider) return;
    const todoItem = slider.closest('li[data-id]');
    if (!todoItem) return;
    updateTodoOrder(parseInt(todoItem.dataset.id), parseInt(slider.value, 10));
});

todoList?.addEventListener('click', (e) => {
    const todoItem = e.target.closest('li[data-id]');
    if (!todoItem) return;
    const todoId = parseInt(todoItem.dataset.id);
    
    if (e.target.closest('[data-action="delete"]')) {
        deleteTodo(todoId);
        return;
    }
    
    if (e.target.closest('[data-action="add-subtask"]')) {
        const text = prompt('Sub-task description');
        if (text && text.trim()) {
            addSubtask(todoId, text.trim());
        }
        return;
    }
    
    const deleteSubtaskBtn = e.target.closest('[data-action="delete-subtask"]');
    if (deleteSubtaskBtn) {
        const subtaskId = parseInt(deleteSubtaskBtn.dataset.subtaskId);
        deleteSubtask(todoId, subtaskId);
    }
});

themeModeSelect?.addEventListener('change', () => {
    const mode = themeModeSelect.value;
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    applyTheme(mode);
});

accentOptionsContainer?.addEventListener('click', (e) => {
    const swatch = e.target.closest('.accent-swatch');
    if (!swatch) return;
    setAccent(swatch.dataset.accent);
});

mobileAddButton.addEventListener('click', () => {
    document.querySelector('.input-section').scrollIntoView({ behavior: 'smooth' });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderCategoryPills();
    initializeThemeControls();
    setupTabs();
    setActiveTab('finance');
    renderTodos();
    
    transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    updateBalance();
    displayTransactions();
});
