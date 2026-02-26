// --- 1. Initial Data and State Management ---
// Holds the application's global state: balance, income, and transaction history
let state = {
    balance: 2450.75,
    income: 4200.00,
    transactions: [
        { id: 1, title: 'Supermercado Extra', date: 'Hoje, 10:30', amount: -240.50, icon: 'fa-shopping-cart' },
        { id: 2, title: 'Recebimento Pix', date: 'Ontem, 14:20', amount: 150.00, icon: 'brands fa-pix' },
        { id: 3, title: 'Netflix', date: '15 Jul', amount: -55.90, icon: 'fa-play' },
        { id: 4, title: 'Uber Viagem', date: '14 Jul', amount: -19.90, icon: 'fa-car' },
        { id: 5, title: 'Padaria', date: '14 Jul', amount: -12.50, icon: 'fa-bread-slice' }
    ]
};

// DOM Elements selection
const balanceEl = document.getElementById('displayBalance');
const incomeEl = document.getElementById('incomeDisplay');
const listEl = document.getElementById('transactionList');
const greetingEl = document.getElementById('greeting');
let isBalanceVisible = true;

// --- 2. Rendering Functions ---
// Formats numerical values into Brazilian Real (BRL) currency string
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Updates the User Interface based on the current state
function updateUI() {
    // Balance visibility logic
    balanceEl.textContent = isBalanceVisible ? formatCurrency(state.balance) : '•••••••';
    balanceEl.classList.toggle('hidden', !isBalanceVisible);
    incomeEl.textContent = formatCurrency(state.income);

    // Clear and rebuild the transaction list
    listEl.innerHTML = '';
    state.transactions.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.style.animationDelay = `${index * 0.05}s`; // Staggered animation effect
        
        const isIncome = item.amount > 0;
        const colorClass = isIncome ? 'income' : 'expense';
        const sign = isIncome ? '+' : '';

        li.innerHTML = `
            <div class="t-left">
                <div class="t-icon"><i class="fas ${item.icon}"></i></div>
                <div class="t-info">
                    <h4>${item.title}</h4>
                    <p>${item.date}</p>
                </div>
            </div>
            <span class="t-amount ${colorClass}">${sign}${formatCurrency(item.amount)}</span>
        `;
        listEl.appendChild(li);
    });
}

// --- 3. Utility Functions ---
// Sets a dynamic greeting based on the current time of day
function setGreeting() {
    const hour = new Date().getHours();
    greetingEl.textContent = (hour < 12 ? 'Bom dia,' : hour < 18 ? 'Boa tarde,' : 'Boa noite,');
}

// Event listener for toggling balance visibility
document.getElementById('toggleBalance').addEventListener('click', (e) => {
    isBalanceVisible = !isBalanceVisible;
    e.target.classList.toggle('fa-eye');
    e.target.classList.toggle('fa-eye-slash');
    updateUI();
});

// Switches between Light and Dark themes
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('theme-icon');
    // Swap icons based on the active theme
    icon.classList.replace(
        document.body.classList.contains('dark-mode') ? 'fa-moon' : 'fa-sun', 
        document.body.classList.contains('dark-mode') ? 'fa-sun' : 'fa-moon'
    );
}

// --- 4. Modal and Transaction Logic ---
const modal = document.getElementById('transactionModal');
let currentTransactionType = '';

// Opens the modal and configures labels based on transaction type (Pix, Loan, etc.)
function openModal(type) {
    currentTransactionType = type;
    document.getElementById('modalTitle').textContent = `Realizar ${type}`;
    
    const descLabel = document.getElementById('descLabel');
    const descInput = document.getElementById('descInput');
    const btn = document.getElementById('confirmBtn');

    if (type === 'Recarga') {
        descLabel.textContent = 'Número do Celular';
        descInput.placeholder = '(11) 99999-9999';
        btn.textContent = 'Confirmar Recarga';
    } else if (type === 'Empréstimo') {
        descLabel.textContent = 'Motivo do Empréstimo';
        descInput.placeholder = 'Ex: Viagem, Reforma...';
        btn.textContent = 'Solicitar Valor';
    } else {
        descLabel.textContent = 'Descrição';
        descInput.placeholder = 'Ex: Mercado, Aluguel...';
        btn.textContent = 'Confirmar Transação';
    }
    modal.classList.add('active');
}

// Closes the modal and resets input fields
function closeModal() {
    modal.classList.remove('active');
    document.getElementById('descInput').value = '';
    document.getElementById('amountInput').value = '';
}

// Validates and executes the transaction, updating the state and UI
function processTransaction() {
    const desc = document.getElementById('descInput').value;
    const amountVal = parseFloat(document.getElementById('amountInput').value);

    // Basic validation
    if (!desc || isNaN(amountVal) || amountVal <= 0) {
        showToast('Preencha os dados corretamente!', true);
        return;
    }

    let newTransaction = {
        id: Date.now(),
        title: desc,
        date: 'Agora',
        amount: 0,
        icon: ''
    };

    // Business logic for different transaction types
    if (currentTransactionType === 'Empréstimo') {
        state.balance += amountVal;
        state.income += amountVal;
        newTransaction.amount = amountVal;
        newTransaction.icon = 'fa-hand-holding-dollar';
        showToast(`Empréstimo de ${formatCurrency(amountVal)} recebido!`);
    } else {
        // Check for insufficient funds
        if (amountVal > state.balance) {
            showToast('Saldo insuficiente!', true);
            return;
        }
        state.balance -= amountVal;
        newTransaction.amount = -amountVal;
        
        // Icon assignment based on type
        if(currentTransactionType === 'Recarga') {
            newTransaction.icon = 'fa-mobile-alt';
            newTransaction.title = `Recarga: ${desc}`;
        } else if (currentTransactionType === 'Pix') {
            newTransaction.icon = 'brands fa-pix';
        } else {
            newTransaction.icon = 'fa-barcode';
        }
        showToast(`Transação realizada!`);
    }

    // Add new transaction to the beginning of the list
    state.transactions.unshift(newTransaction);
    updateUI();
    closeModal();
}

// Displays temporary feedback notifications to the user
function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.style.background = isError ? '#ff3b30' : 'var(--text-primary)';
    toast.classList.add('show');
    // Auto-hide after 3 seconds
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Initializing the application
setGreeting();
updateUI();
