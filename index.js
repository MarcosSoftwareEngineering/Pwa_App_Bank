// --- 1. Dados Iniciais ---
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

        const balanceEl = document.getElementById('displayBalance');
        const incomeEl = document.getElementById('incomeDisplay');
        const listEl = document.getElementById('transactionList');
        const greetingEl = document.getElementById('greeting');
        let isBalanceVisible = true;

        // --- 2. Renderização ---
        function formatCurrency(value) {
            return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }

        function updateUI() {
            balanceEl.textContent = isBalanceVisible ? formatCurrency(state.balance) : '•••••••';
            balanceEl.classList.toggle('hidden', !isBalanceVisible);
            incomeEl.textContent = formatCurrency(state.income);

            listEl.innerHTML = '';
            state.transactions.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'transaction-item';
                li.style.animationDelay = `${index * 0.05}s`; // Delay menor para lista maior
                
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

        // --- 3. Funções Utilitárias ---
        function setGreeting() {
            const hour = new Date().getHours();
            greetingEl.textContent = (hour < 12 ? 'Bom dia,' : hour < 18 ? 'Boa tarde,' : 'Boa noite,');
        }

        document.getElementById('toggleBalance').addEventListener('click', (e) => {
            isBalanceVisible = !isBalanceVisible;
            e.target.classList.toggle('fa-eye');
            e.target.classList.toggle('fa-eye-slash');
            updateUI();
        });

        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            const icon = document.getElementById('theme-icon');
            icon.classList.replace(document.body.classList.contains('dark-mode') ? 'fa-moon' : 'fa-sun', document.body.classList.contains('dark-mode') ? 'fa-sun' : 'fa-moon');
        }

        // --- 4. Modal e Lógica ---
        const modal = document.getElementById('transactionModal');
        let currentTransactionType = '';

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

        function closeModal() {
            modal.classList.remove('active');
            document.getElementById('descInput').value = '';
            document.getElementById('amountInput').value = '';
        }

        function processTransaction() {
            const desc = document.getElementById('descInput').value;
            const amountVal = parseFloat(document.getElementById('amountInput').value);

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

            if (currentTransactionType === 'Empréstimo') {
                state.balance += amountVal;
                state.income += amountVal;
                newTransaction.amount = amountVal;
                newTransaction.icon = 'fa-hand-holding-dollar';
                showToast(`Empréstimo de ${formatCurrency(amountVal)} recebido!`);
            } else {
                if (amountVal > state.balance) {
                    showToast('Saldo insuficiente!', true);
                    return;
                }
                state.balance -= amountVal;
                newTransaction.amount = -amountVal;
                
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

            state.transactions.unshift(newTransaction);
            updateUI();
            closeModal();
        }

        function showToast(msg, isError = false) {
            const toast = document.getElementById('toast');
            document.getElementById('toastMsg').textContent = msg;
            toast.style.background = isError ? '#ff3b30' : 'var(--text-primary)';
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        setGreeting();
        updateUI();