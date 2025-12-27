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
const inputSection = document.getElementById('input-section');
const toggleInputButton = document.getElementById('toggle-input');
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
const sharedParticipantList = document.getElementById('shared-participant-list');
const sharedParticipantForm = document.getElementById('shared-participant-form');
const sharedParticipantInput = document.getElementById('shared-participant-input');
const sharedExpenseForm = document.getElementById('shared-expense-form');
const sharedExpenseDescription = document.getElementById('shared-expense-description');
const sharedExpenseAmount = document.getElementById('shared-expense-amount');
const sharedExpensePayer = document.getElementById('shared-expense-payer');
const sharedExpenseParticipants = document.getElementById('shared-expense-participants');
const sharedExpenseHistory = document.getElementById('shared-expense-history');
const sharedExpenseSummary = document.getElementById('shared-expense-summary');
const resetSharedBalancesButton = document.getElementById('reset-shared-balances');
const communicationForm = document.getElementById('communication-form');
const communicationTitleInput = document.getElementById('communication-title');
const communicationImageInput = document.getElementById('communication-image');
const communicationEmojiInput = document.getElementById('communication-emoji');
const communicationPreview = document.getElementById('communication-preview');
const communicationGrid = document.getElementById('communication-grid');
const communicationRecordButton = document.getElementById('communication-record');
const communicationPlayRecordingButton = document.getElementById('communication-play-recording');
const communicationStopButton = document.getElementById('communication-stop');
const communicationRecordingStatus = document.getElementById('communication-recording-status');
const communicationSubmitButton = document.getElementById('communication-submit');
const communicationCancelButton = document.getElementById('communication-cancel');
const THEME_STORAGE_KEY = 'themeMode';
const ACCENT_STORAGE_KEY = 'accentColor';
const TODO_STORAGE_KEY = 'organizerTodos';
const SHARED_PARTICIPANTS_KEY = 'sharedParticipants';
const SHARED_EXPENSES_KEY = 'sharedExpenses';
const COMMUNICATION_ITEMS_KEY = 'communicationItems';

let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
let editTransactionId = null;
let todos = JSON.parse(localStorage.getItem(TODO_STORAGE_KEY) || '[]');
let sharedParticipants = JSON.parse(localStorage.getItem(SHARED_PARTICIPANTS_KEY) || '[]');
let sharedExpenses = JSON.parse(localStorage.getItem(SHARED_EXPENSES_KEY) || '[]');
let communicationItems = JSON.parse(localStorage.getItem(COMMUNICATION_ITEMS_KEY) || '[]');
let editingCommunicationId = null;
let communicationAudioData = '';
let recordingChunks = [];
let mediaRecorder = null;
let recordingStream = null;
let activeAudioElement = null;
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
const DEFAULT_COMMUNICATION_ITEMS = [
    {
        id: 'comm-drink',
        title: 'I want a drink',
        phrase: 'I would like a drink, please.',
        emoji: '🧃',
        color: '#0d6efd',
        isCustom: false,
        audioData: ''
    },
    {
        id: 'comm-snack',
        title: 'I am hungry',
        phrase: 'I am hungry. Can I have something to eat?',
        emoji: '🍎',
        color: '#fd7e14',
        isCustom: false,
        audioData: ''
    },
    {
        id: 'comm-bathroom',
        title: 'Bathroom',
        phrase: 'I need to use the bathroom.',
        emoji: '🚻',
        color: '#20c997',
        isCustom: false,
        audioData: ''
    },
    {
        id: 'comm-help',
        title: 'Help me',
        phrase: 'Please help me.',
        emoji: '🆘',
        color: '#dc3545',
        isCustom: false,
        audioData: ''
    },
    {
        id: 'comm-break',
        title: 'I need a break',
        phrase: 'I need a break.',
        emoji: '🧸',
        color: '#6f42c1',
        isCustom: false,
        audioData: ''
    },
    {
        id: 'comm-spanish-greeting',
        title: 'Hola',
        phrase: 'Hola, ¿puedo tener esto?',
        emoji: '😊',
        color: '#17a2b8',
        isCustom: false,
        audioData: ''
    },
    {
        id: 'comm-ar-hello',
        title: 'مرحبا',
        phrase: 'مرحباً، كيف حالك اليوم؟',
        emoji: '👋',
        color: '#0d6efd',
        isCustom: false,
        audioData: ''
    },
    {
        id: 'comm-ar-thanks',
        title: 'شكراً',
        phrase: 'شكراً جزيلاً على مساعدتك.',
        emoji: '🙏',
        color: '#20c997',
        isCustom: false,
        audioData: ''
    }
];

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

const stripLeadingEmoji = (text = '', emoji = '') => {
    if (!text) return '';
    const trimmedText = text.trimStart();
    if (!emoji) return trimmedText;
    const normalizedEmoji = emoji.trim();
    return normalizedEmoji && trimmedText.startsWith(normalizedEmoji)
        ? trimmedText.slice(normalizedEmoji.length).trimStart()
        : trimmedText;
};

const normalizeEmojiValue = (value = '', fallback = '🗣️') => {
    const normalized = Array.from((value || '').trim()).slice(0, 2).join('');
    return normalized || fallback;
};

const calculateNet = (list = []) => list.reduce((sum, transaction) => {
    const amount = Math.abs(transaction.amount);
    return transaction.type === 'income' ? sum + amount : sum - amount;
}, 0);

const escapeHtml = (value = '') => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');

const getFilteredTransactions = () => {
    if (!activeCategoryFilter) return transactions;
    return transactions.filter(t => t.category === activeCategoryFilter);
};

const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

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
sharedParticipants = Array.isArray(sharedParticipants)
    ? sharedParticipants.map((participant, index) => ({
        id: typeof participant.id === 'number' ? participant.id : generateId() + index,
        name: participant.name || `Member ${index + 1}`
    }))
    : [];
sharedExpenses = Array.isArray(sharedExpenses)
    ? sharedExpenses.map(expense => ({
        ...expense,
        id: typeof expense.id === 'number' ? expense.id : generateId(),
        amount: Number(expense.amount) || 0,
        participantIds: Array.isArray(expense.participantIds) ? expense.participantIds : [],
        date: expense.date || new Date().toISOString()
    }))
    : [];
communicationItems = Array.isArray(communicationItems)
    ? communicationItems.map((item, index) => ({
        id: item.id || `comm-${generateId() + index}`,
        title: item.title || 'New card',
        emoji: item.emoji || '💬',
        color: item.color || '#0d6efd',
        imageData: item.imageData || '',
        isCustom: item.isCustom ?? true
    }))
    : [];
if (!communicationItems.length) {
    communicationItems = DEFAULT_COMMUNICATION_ITEMS.map(item => ({ ...item }));
    localStorage.setItem(COMMUNICATION_ITEMS_KEY, JSON.stringify(communicationItems));
}
if (!sharedParticipants.length) {
    const baseId = Date.now();
    sharedParticipants = [
        { id: baseId, name: 'You' }
    ];
    localStorage.setItem(SHARED_PARTICIPANTS_KEY, JSON.stringify(sharedParticipants));
}

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

const saveSharedParticipants = () => {
    localStorage.setItem(SHARED_PARTICIPANTS_KEY, JSON.stringify(sharedParticipants));
};

const saveSharedExpenses = () => {
    localStorage.setItem(SHARED_EXPENSES_KEY, JSON.stringify(sharedExpenses));
};

const saveSharedTodos = () => {
    localStorage.setItem(SHARED_TODOS_KEY, JSON.stringify(sharedTodos));
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

const getSharedBalances = () => {
    const balances = {};
    sharedParticipants.forEach(participant => { balances[participant.id] = 0; });
    sharedExpenses.forEach(expense => {
        const participants = expense.participantIds.length ? expense.participantIds : sharedParticipants.map(p => p.id);
        const share = participants.length ? expense.amount / participants.length : 0;
        participants.forEach(id => {
            if (id === expense.payerId) {
                balances[id] += expense.amount - share;
            } else {
                balances[id] -= share;
            }
        });
    });
    return balances;
};

const updateSharedExpenseControls = () => {
    if (!sharedExpensePayer || !sharedExpenseParticipants) return;
    sharedExpensePayer.innerHTML = sharedParticipants
        .map(participant => `<option value="${participant.id}">${participant.name}</option>`)
        .join('');
    
    sharedExpenseParticipants.innerHTML = sharedParticipants
        .map(participant => `
            <label class="form-check form-check-inline d-flex align-items-center gap-1">
                <input class="form-check-input" type="checkbox" value="${participant.id}" checked>
                <span>${participant.name}</span>
            </label>
        `).join('');
};

const renderSharedParticipants = () => {
    if (!sharedParticipantList) return;
    const balances = getSharedBalances();
    
    if (!sharedParticipants.length) {
        sharedParticipantList.innerHTML = '<li class="text-muted">Add someone to get started</li>';
        return;
    }
    
    sharedParticipantList.innerHTML = sharedParticipants
        .map(participant => {
            const balance = balances[participant.id] || 0;
            const balanceClass = balance >= 0 ? 'text-success' : 'text-danger';
            return `
                <li class="shared-balance" data-id="${participant.id}">
                    <strong>${participant.name}</strong>
                    <div class="d-flex align-items-center gap-2">
                        <span class="${balanceClass}">${formatCurrency(balance, { includePlus: true })}</span>
                        <button class="btn btn-sm btn-outline-danger" data-shared-action="delete-participant">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                </li>
            `;
        })
        .join('');
};

const renderSharedExpenseHistory = () => {
    if (!sharedExpenseHistory) return;
    if (!sharedExpenses.length) {
        sharedExpenseHistory.innerHTML = '<li class="list-group-item text-center text-muted py-4">No shared expenses yet</li>';
        sharedExpenseSummary.textContent = 'No expenses yet';
        return;
    }
    
    const total = sharedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    sharedExpenseSummary.textContent = `${sharedExpenses.length} expenses · ${formatCurrency(total)}`;
    
    sharedExpenseHistory.innerHTML = sharedExpenses
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(expense => {
            const payer = sharedParticipants.find(p => p.id === expense.payerId);
            const participants = expense.participantIds
                .map(id => sharedParticipants.find(p => p.id === id)?.name || 'Unknown')
                .join(', ');
            return `
                <li class="list-group-item" data-id="${expense.id}">
                    <div>
                        <div class="fw-semibold">${expense.description}</div>
                        <div class="text-muted small">Paid by ${payer?.name || 'Unknown'} · Split with ${participants}</div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="shared-expense-chip">${formatCurrency(expense.amount)}</span>
                        <button class="btn btn-sm btn-outline-danger" data-shared-action="delete-expense">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </li>
            `;
        })
        .join('');
};

const addSharedParticipant = (name) => {
    if (!name) return;
    sharedParticipants.push({ id: generateId(), name });
    saveSharedParticipants();
    updateSharedExpenseControls();
    renderSharedParticipants();
};

const deleteSharedParticipant = (participantId) => {
    const hasExpenses = sharedExpenses.some(expense => expense.payerId === participantId || expense.participantIds.includes(participantId));
    if (hasExpenses) {
        alert('Please delete expenses involving this person before removing them.');
        return;
    }
    sharedParticipants = sharedParticipants.filter(participant => participant.id !== participantId);
    saveSharedParticipants();
    updateSharedExpenseControls();
    renderSharedParticipants();
};

const addSharedExpense = (description, amount, payerId, participantIds) => {
    const expenseParticipants = participantIds.length ? participantIds : sharedParticipants.map(p => p.id);
    if (!expenseParticipants.includes(payerId)) {
        expenseParticipants.push(payerId);
    }
    sharedExpenses.push({
        id: generateId(),
        description,
        amount,
        payerId,
        participantIds: expenseParticipants,
        date: new Date().toISOString()
    });
    saveSharedExpenses();
    renderSharedExpenseHistory();
    renderSharedParticipants();
};

const resetSharedExpenses = () => {
    sharedExpenses = [];
    saveSharedExpenses();
    renderSharedExpenseHistory();
    renderSharedParticipants();
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

// Communication helper functions
const saveCommunicationItems = () => {
    localStorage.setItem(COMMUNICATION_ITEMS_KEY, JSON.stringify(communicationItems));
};

const nextCommunicationColor = (index) => {
    const palette = ['#0d6efd', '#20c997', '#fd7e14', '#e83e8c', '#6f42c1'];
    return palette[index % palette.length];
};

const normalizeCommunicationItems = () => {
    communicationItems = communicationItems.map((item, index) => {
        const { voiceId, ...rest } = item;
        return {
            ...rest,
            phrase: item.phrase || '',
            audioData: item.audioData || '',
            color: rest.color || nextCommunicationColor(index),
            emoji: normalizeEmojiValue(rest.emoji || rest.title?.charAt(0) || '')
        };
    });
    saveCommunicationItems();
};

const setRecordingStatus = (message, tone = 'muted') => {
    if (!communicationRecordingStatus) return;
    communicationRecordingStatus.textContent = message;
    communicationRecordingStatus.classList.toggle('text-danger', tone === 'error');
    communicationRecordingStatus.classList.toggle('text-success', tone === 'success');
    communicationRecordingStatus.classList.toggle('text-muted', tone === 'muted');
};

const updateRecordingButton = (isRecording = false) => {
    if (!communicationRecordButton) return;
    communicationRecordButton.innerHTML = isRecording
        ? '<i class="bi bi-stop-circle"></i> Stop recording'
        : '<i class="bi bi-mic"></i> Start recording';
    communicationRecordButton.classList.toggle('btn-danger', isRecording);
    communicationRecordButton.classList.toggle('btn-outline-primary', !isRecording);
};

const resetRecordingState = () => {
    communicationAudioData = '';
    recordingChunks = [];
    updateRecordingButton(false);
    communicationPlayRecordingButton?.classList.add('d-none');
    setRecordingStatus('No recording yet. Please record yourself saying the phrase above.');
};

const applyRecordingFromItem = (item = null) => {
    communicationAudioData = item?.audioData || '';
    const hasAudio = Boolean(communicationAudioData);
    communicationPlayRecordingButton?.classList.toggle('d-none', !hasAudio);
    setRecordingStatus(
        hasAudio
            ? 'Recording ready. Tap play to preview or record again.'
            : 'No recording yet. Please record yourself saying the phrase above.',
        hasAudio ? 'success' : 'muted'
    );
    updateRecordingButton(false);
};

const stopRecordingStream = () => {
    if (recordingStream) {
        recordingStream.getTracks().forEach((track) => track.stop());
        recordingStream = null;
    }
};

const stopCommunicationAudio = () => {
    if (activeAudioElement) {
        activeAudioElement.pause();
        activeAudioElement.currentTime = 0;
        activeAudioElement = null;
    }
};

const playAudioData = (audioData) => {
    if (!audioData) {
        alert('Please record yourself saying this phrase first.');
        return;
    }
    stopCommunicationAudio();
    activeAudioElement = new Audio(audioData);
    activeAudioElement.onended = () => {
        activeAudioElement = null;
    };
    activeAudioElement.play().catch(() => {
        alert('Unable to play your recording. Please try re-recording.');
    });
};

const playFormRecording = () => playAudioData(communicationAudioData);

const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
        alert('Recording is not supported in this browser.');
        return;
    }
    if (typeof MediaRecorder === 'undefined') {
        alert('Recording is not available in this browser.');
        return;
    }

    try {
        communicationAudioData = '';
        communicationPlayRecordingButton?.classList.add('d-none');
        stopCommunicationAudio();
        recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recordingChunks = [];
        mediaRecorder = new MediaRecorder(recordingStream);
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) recordingChunks.push(event.data);
        };
        mediaRecorder.onstop = () => {
            const mimeType = recordingChunks[0]?.type || mediaRecorder.mimeType || 'audio/webm';
            const blob = new Blob(recordingChunks, { type: mimeType });
            const reader = new FileReader();
            reader.onloadend = () => {
                communicationAudioData = reader.result;
                communicationPlayRecordingButton?.classList.toggle('d-none', !communicationAudioData);
                setRecordingStatus(
                    'Recording ready. Tap play to preview or record again.',
                    communicationAudioData ? 'success' : 'muted'
                );
            };
            reader.readAsDataURL(blob);
            stopRecordingStream();
            updateRecordingButton(false);
        };
        mediaRecorder.start();
        updateRecordingButton(true);
        setRecordingStatus('Recording... tap stop when you are done.', 'success');
    } catch (error) {
        setRecordingStatus('Microphone permission is needed to record your voice.', 'error');
        stopRecordingStream();
    }
};

const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    } else {
        stopRecordingStream();
        updateRecordingButton(false);
    }
};

const toggleRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording();
    } else {
        startRecording();
    }
};

const playCommunicationItemAudio = (item) => {
    if (!item.audioData) {
        alert('Please add your own recording for this card before playing it.');
        return;
    }
    playAudioData(item.audioData);
};

const focusCommunicationItem = (id) => {
    if (!communicationGrid || !id) return;
    const targetCard = communicationGrid.querySelector(`[data-communication-id="${id}"]`);
    if (!targetCard) return;
    targetCard.classList.add('communication-card--focused');
    targetCard.focus({ preventScroll: true });
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => {
        targetCard.classList.remove('communication-card--focused');
    }, 1800);
};

const renderCommunicationItems = () => {
    if (!communicationGrid) return;
    communicationGrid.innerHTML = '';

    communicationItems.forEach((item) => {
        const emoji = normalizeEmojiValue(item.emoji);
        const cleanTitle = stripLeadingEmoji(item.title || '', emoji);
        const cleanPhrase = stripLeadingEmoji(item.phrase || '', emoji);
        const displayTitle = cleanTitle || item.title || 'Communication card';
        const displayPhrase = cleanPhrase || item.phrase || '';
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'communication-card text-start';
        card.dataset.communicationId = item.id;
        card.style.background = `linear-gradient(145deg, ${hexToRgba(item.color, 0.18)}, var(--card-bg))`;
        card.setAttribute('aria-label', `${displayTitle}: ${displayPhrase}`);
        const recordingMessage = item.audioData
            ? '<span class="text-primary small fw-semibold">Tap card to play your recording</span>'
            : '<span class="text-warning small fw-semibold">Recording needed</span>';
        const fallbackEmoji = escapeHtml(emoji);
        const safeTitle = escapeHtml(displayTitle);
        const safePhrase = escapeHtml(displayPhrase || 'Tap to play your recording');

        card.innerHTML = `
            <div class="communication-image" style="border-color: ${hexToRgba(item.color, 0.4)};">
                ${item.imageData
                    ? `<img src="${item.imageData}" alt="${item.title}">`
                    : `<div class="communication-placeholder" aria-hidden="true">
                        <span class="communication-emoji">${fallbackEmoji}</span>
                    </div>`}
            </div>
            <div class="fw-semibold">${safeTitle}</div>
            <div class="text-muted small">${safePhrase}</div>
            <div class="communication-meta">
                <div>${recordingMessage}</div>
                <div class="communication-actions">
                    <button class="btn btn-outline-danger btn-sm" data-action="delete-communication"><i class="bi bi-trash"></i></button>
                    <button class="btn btn-outline-primary btn-sm" data-action="edit-communication"><i class="bi bi-pencil"></i></button>
                </div>
            </div>
        `;

        communicationGrid.appendChild(card);
    });
};

const resetCommunicationPreview = () => {
    if (!communicationPreview) return;
    communicationPreview.textContent = 'No image selected';
    communicationPreview.dataset.imageData = '';
};

const setCommunicationFormMode = (item = null) => {
    const isEditing = Boolean(item);
    editingCommunicationId = item?.id || null;

    if (isEditing) {
        communicationTitleInput.value = item.title;
        if (communicationEmojiInput) {
            communicationEmojiInput.value = item.emoji || '';
        }
        applyRecordingFromItem(item);
        if (item.imageData) {
            communicationPreview.innerHTML = `<img src="${item.imageData}" alt="${item.title}">`;
            communicationPreview.dataset.imageData = item.imageData;
        } else {
            resetCommunicationPreview();
        }
    } else {
        communicationForm.reset();
        if (communicationEmojiInput) {
            communicationEmojiInput.value = '';
        }
        resetCommunicationPreview();
        resetRecordingState();
    }

    if (communicationSubmitButton) {
        communicationSubmitButton.innerHTML = isEditing
            ? '<i class="bi bi-save"></i> Update button'
            : '<i class="bi bi-plus-circle"></i> Save button';
    }

    communicationCancelButton?.classList.toggle('d-none', !isEditing);
};

const handleCommunicationFormSubmit = (e) => {
    e.preventDefault();
    const title = communicationTitleInput.value.trim();
    const audioData = communicationAudioData;
    const currentItem = editingCommunicationId
        ? communicationItems.find((item) => item.id === editingCommunicationId)
        : null;
    const phrase = currentItem?.phrase || title;
    const emoji = normalizeEmojiValue(
        (communicationEmojiInput?.value || '').trim() || currentItem?.emoji || title.charAt(0),
        '🗣️'
    );

    if (!title) return;
    if (!audioData) {
        alert('Please record yourself saying this phrase before saving the button.');
        return;
    }

    const createItem = (imageData = '') => {
        let focusId = editingCommunicationId;
        if (editingCommunicationId) {
            communicationItems = communicationItems.map((item) => (
                item.id === editingCommunicationId
                    ? {
                        ...item,
                        title,
                        phrase,
                        audioData,
                        imageData,
                        emoji
                    }
                    : item
            ));
        } else {
            const newItem = {
                id: `comm-${generateId()}`,
                title,
                phrase,
                audioData,
                imageData,
                emoji,
                color: nextCommunicationColor(communicationItems.length),
                isCustom: true
            };
            communicationItems.push(newItem);
            focusId = newItem.id;
        }
        saveCommunicationItems();
        renderCommunicationItems();
        setCommunicationFormMode();
        focusCommunicationItem(focusId);
    };

    const file = communicationImageInput.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => createItem(reader.result);
        reader.readAsDataURL(file);
    } else {
        createItem(communicationPreview?.dataset?.imageData || '');
    }
};

const handleCommunicationImageChange = () => {
    if (!communicationImageInput || !communicationPreview) return;
    const file = communicationImageInput.files?.[0];
    if (!file) {
        resetCommunicationPreview();
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        communicationPreview.innerHTML = `<img src="${reader.result}" alt="Selected">`;
        communicationPreview.dataset.imageData = reader.result;
    };
    reader.readAsDataURL(file);
};

const deleteCommunicationItem = (id) => {
    const item = communicationItems.find(entry => entry.id === id);
    if (!item) return;
    if (!confirm(`Delete "${item.title || 'this card'}"?`)) return;
    stopCommunicationAudio();
    communicationItems = communicationItems.filter(entry => entry.id !== id);
    saveCommunicationItems();
    renderCommunicationItems();
};

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

const setInputSectionVisibility = (shouldShow) => {
    if (!inputSection || !toggleInputButton) return;
    inputSection.style.display = shouldShow ? 'block' : 'none';
    toggleInputButton.innerHTML = `<i class="bi bi-chevron-${shouldShow ? 'up' : 'down'}"></i> ${shouldShow ? 'Hide' : 'Show'}`;
};

toggleInputButton?.addEventListener('click', () => {
    const isHidden = inputSection?.style.display === 'none';
    setInputSectionVisibility(isHidden);
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

sharedParticipantForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = sharedParticipantInput.value.trim();
    if (!name) return;
    addSharedParticipant(name);
    sharedParticipantForm.reset();
});

sharedParticipantList?.addEventListener('click', (e) => {
    const button = e.target.closest('[data-shared-action="delete-participant"]');
    if (!button) return;
    const item = button.closest('li[data-id]');
    if (!item) return;
    deleteSharedParticipant(parseInt(item.dataset.id));
});

sharedExpenseForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = sharedExpenseDescription.value.trim();
    const amount = parseFloat(sharedExpenseAmount.value);
    const payerId = parseInt(sharedExpensePayer.value);
    const selected = Array.from(sharedExpenseParticipants.querySelectorAll('input[type="checkbox"]:checked'))
        .map(input => parseInt(input.value));
    
    if (!description || isNaN(amount) || amount <= 0 || !payerId) {
        alert('Please complete the shared expense form');
        return;
    }
    
    addSharedExpense(description, amount, payerId, selected);
    sharedExpenseForm.reset();
    updateSharedExpenseControls();
});

sharedExpenseHistory?.addEventListener('click', (e) => {
    const item = e.target.closest('li[data-id]');
    if (!item) return;
    if (!e.target.closest('[data-shared-action="delete-expense"]')) return;
    const id = parseInt(item.dataset.id);
    sharedExpenses = sharedExpenses.filter(expense => expense.id !== id);
    saveSharedExpenses();
    renderSharedExpenseHistory();
    renderSharedParticipants();
});

resetSharedBalancesButton?.addEventListener('click', () => {
    if (confirm('Clear all shared expenses?')) {
        resetSharedExpenses();
    }
});

communicationForm?.addEventListener('submit', handleCommunicationFormSubmit);
communicationImageInput?.addEventListener('change', handleCommunicationImageChange);
communicationRecordButton?.addEventListener('click', toggleRecording);
communicationPlayRecordingButton?.addEventListener('click', playFormRecording);
communicationGrid?.addEventListener('click', (e) => {
    const card = e.target.closest('[data-communication-id]');
    if (!card) return;
    const id = card.dataset.communicationId;
    const item = communicationItems.find(entry => entry.id === id);
    if (!item) return;

    if (e.target.closest('[data-action="delete-communication"]')) {
        deleteCommunicationItem(id);
        return;
    }

    if (e.target.closest('[data-action="edit-communication"]')) {
        setCommunicationFormMode(item);
        communicationTitleInput.focus();
        return;
    }

    playCommunicationItemAudio(item);
});
communicationStopButton?.addEventListener('click', () => {
    stopCommunicationAudio();
    stopRecording();
});
communicationCancelButton?.addEventListener('click', () => setCommunicationFormMode());

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
    setInputSectionVisibility(true);
    inputSection?.scrollIntoView({ behavior: 'smooth' });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderCategoryPills();
    initializeThemeControls();
    setupTabs();
    setActiveTab('finance');
    renderTodos();
    renderSharedParticipants();
    updateSharedExpenseControls();
    renderSharedExpenseHistory();
    normalizeCommunicationItems();
    renderCommunicationItems();

    transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    updateBalance();
    displayTransactions();
    setCommunicationFormMode();
    setInputSectionVisibility(true);
});
