let currentKeypair = null;
let currentNetwork = 'testnet';
let transactionHistoryPage = null;

// DOM Elements
const secretKeyInput = document.getElementById('secret-key');
const toggleSecretBtn = document.getElementById('toggle-secret');
const loadWalletBtn = document.getElementById('load-wallet');
const generateWalletBtn = document.getElementById('generate-wallet');
const walletInfo = document.getElementById('wallet-info');
const walletFeedback = document.getElementById('wallet-feedback');
const publicKeyDisplay = document.getElementById('public-key');
const secretKeyDisplay = document.getElementById('secret-key-display');
const balancesContainer = document.getElementById('balances');
const refreshBalancesBtn = document.getElementById('refresh-balances');
const destinationInput = document.getElementById('destination');
const amountInput = document.getElementById('amount');
const sendPaymentBtn = document.getElementById('send-payment');
const transactionResult = document.getElementById('transaction-result');
const transactionHistoryContainer = document.getElementById('transaction-history');
const refreshHistoryBtn = document.getElementById('refresh-history');
const loadMoreHistoryBtn = document.getElementById('load-more-history');
const networkSelect = document.getElementById('network-select');

// Toggle secret key visibility
toggleSecretBtn.addEventListener('click', () => {
    if (secretKeyInput.type === 'password') {
        secretKeyInput.type = 'text';
        toggleSecretBtn.textContent = 'Hide';
    } else {
        secretKeyInput.type = 'password';
        toggleSecretBtn.textContent = 'Show';
    }
});

// Network change
networkSelect.addEventListener('change', (e) => {
    currentNetwork = e.target.value;
    if (currentKeypair) {
        loadBalances();
        loadTransactionHistory();
    }
});

// Load wallet
loadWalletBtn.addEventListener('click', () => {
    const secret = secretKeyInput.value.trim();
    if (!secret) {
        renderMessage(walletFeedback, 'error', 'Missing secret key', 'Please enter a secret key or generate a new wallet.');
        return;
    }

    try {
        currentKeypair = StellarSdk.Keypair.fromSecret(secret);
        showWalletInfo();
        renderMessage(walletFeedback, 'success', 'Wallet loaded', 'Balances will refresh shortly.');
        loadBalances();
        loadTransactionHistory();
    } catch (e) {
        renderMessage(walletFeedback, 'error', 'Invalid secret key', e.message || 'The secret key could not be parsed.');
    }
});

// Generate new wallet
generateWalletBtn.addEventListener('click', () => {
    currentKeypair = StellarSdk.Keypair.random();
    secretKeyInput.value = currentKeypair.secret();
    showWalletInfo();
    renderMessage(walletFeedback, 'success', 'Wallet generated', 'Save the secret key somewhere safe.');
    loadBalances();
    loadTransactionHistory();
});

refreshBalancesBtn.addEventListener('click', () => {
    if (!currentKeypair) {
        renderMessage(walletFeedback, 'error', 'No wallet loaded', 'Load or generate a wallet before refreshing balances.');
        return;
    }

    loadBalances({ manualRefresh: true });
});

refreshHistoryBtn.addEventListener('click', () => {
    if (!currentKeypair) {
        renderMessage(walletFeedback, 'error', 'No wallet loaded', 'Load or generate a wallet before refreshing transaction history.');
        return;
    }

    loadTransactionHistory({ manualRefresh: true });
});

loadMoreHistoryBtn.addEventListener('click', () => {
    if (!transactionHistoryPage) return;

    loadTransactionHistory({ append: true });
});

function setRefreshButtonState(isLoading) {
    if (!refreshBalancesBtn) return;

    refreshBalancesBtn.disabled = isLoading;
    refreshBalancesBtn.classList.toggle('is-loading', isLoading);
    refreshBalancesBtn.innerHTML = isLoading
        ? '<span class="refresh-icon" aria-hidden="true">⟳</span><span class="refresh-label">Refreshing…</span>'
        : '<span class="refresh-icon" aria-hidden="true">↻</span><span class="refresh-label">Refresh</span>';
}

function setHistoryButtonState(isLoading) {
    if (!refreshHistoryBtn) return;

    refreshHistoryBtn.disabled = isLoading;
    refreshHistoryBtn.classList.toggle('is-loading', isLoading);
    refreshHistoryBtn.innerHTML = isLoading
        ? '<span class="refresh-icon" aria-hidden="true">⟳</span><span class="refresh-label">Refreshing...</span>'
        : '<span class="refresh-icon" aria-hidden="true">↻</span><span class="refresh-label">Refresh</span>';

    if (loadMoreHistoryBtn) {
        loadMoreHistoryBtn.disabled = isLoading;
    }
}

function renderMessage(container, type, title, message) {
    if (!container) return;

    container.innerHTML = '';
    container.classList.remove('hidden');

    const messageBox = document.createElement('div');
    messageBox.className = `message message-${type}`;

    const icon = document.createElement('span');
    icon.className = 'message-icon';
    icon.textContent = type === 'error' ? '⚠' : type === 'success' ? '✓' : 'ℹ';

    const body = document.createElement('div');
    body.className = 'message-body';
    const titleEl = document.createElement('strong');
    titleEl.textContent = title;
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    body.appendChild(titleEl);
    body.appendChild(messageEl);

    const dismissButton = document.createElement('button');
    dismissButton.type = 'button';
    dismissButton.className = 'message-dismiss';
    dismissButton.setAttribute('aria-label', 'Dismiss message');
    dismissButton.textContent = '×';
    dismissButton.addEventListener('click', () => {
        messageBox.remove();
        if (!container.hasChildNodes()) {
            container.classList.add('hidden');
        }
    });

    messageBox.appendChild(icon);
    messageBox.appendChild(body);
    messageBox.appendChild(dismissButton);
    container.appendChild(messageBox);
}

// Show wallet info
function showWalletInfo() {
    walletInfo.classList.remove('hidden');
    publicKeyDisplay.textContent = currentKeypair.publicKey();
    secretKeyDisplay.textContent = currentKeypair.secret();
}

// Get server based on network
function getServer() {
    return currentNetwork === 'public'
        ? new StellarSdk.Server('https://horizon.stellar.org')
        : new StellarSdk.Server('https://horizon-testnet.stellar.org');
}

// Get network passphrase
function getNetworkPassphrase() {
    return currentNetwork === 'public'
        ? StellarSdk.Networks.PUBLIC
        : StellarSdk.Networks.TESTNET;
}

function formatHistoryAsset(payment) {
    if (payment.asset_type === 'native') return 'XLM';

    return [payment.asset_code, payment.asset_issuer]
        .filter(Boolean)
        .join(':');
}

function formatHistoryAmount(payment) {
    const amount = payment.amount || payment.starting_balance;
    if (!amount) return 'N/A';

    return `${amount} ${formatHistoryAsset(payment)}`;
}

function getHistoryDirection(payment) {
    const publicKey = currentKeypair.publicKey();

    if (payment.from === publicKey) return 'Sent';
    if (payment.to === publicKey) return 'Received';
    return payment.type_i === 0 ? 'Created' : payment.type.replace(/_/g, ' ');
}

function formatHistoryDate(value) {
    if (!value) return 'Unknown date';

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(value));
}

async function enrichPaymentWithTransaction(payment) {
    if (!payment.transaction_hash) {
        return { payment, transaction: null };
    }

    try {
        const transaction = await getServer()
            .transactions()
            .transaction(payment.transaction_hash)
            .call();
        return { payment, transaction };
    } catch (e) {
        return { payment, transaction: null };
    }
}

function renderHistoryItem(item) {
    const { payment, transaction } = item;
    const row = document.createElement('article');
    row.className = 'history-item';

    const memo = transaction && transaction.memo
        ? `${transaction.memo_type}: ${transaction.memo}`
        : 'None';
    const date = transaction && transaction.created_at
        ? transaction.created_at
        : payment.created_at;

    const main = document.createElement('div');
    main.className = 'history-main';

    const direction = document.createElement('strong');
    direction.textContent = getHistoryDirection(payment);

    const amount = document.createElement('span');
    amount.textContent = formatHistoryAmount(payment);

    main.appendChild(direction);
    main.appendChild(amount);

    const details = document.createElement('dl');
    details.className = 'history-details';

    [
        ['Type', payment.type.replace(/_/g, ' ')],
        ['Date', formatHistoryDate(date)],
        ['Memo', memo]
    ].forEach(([label, value]) => {
        const item = document.createElement('div');
        const term = document.createElement('dt');
        const description = document.createElement('dd');

        term.textContent = label;
        description.textContent = value;
        item.appendChild(term);
        item.appendChild(description);
        details.appendChild(item);
    });

    row.appendChild(main);
    row.appendChild(details);

    return row;
}

async function loadTransactionHistory(options = {}) {
    if (!currentKeypair) return;

    const { append = false, manualRefresh = false } = options;
    setHistoryButtonState(true);

    if (!append) {
        transactionHistoryContainer.innerHTML = '<p class="loading">Loading recent transactions...</p>';
        transactionHistoryPage = null;
        loadMoreHistoryBtn.classList.add('hidden');
    }

    try {
        const page = append && transactionHistoryPage
            ? await transactionHistoryPage.next()
            : await getServer()
                .payments()
                .forAccount(currentKeypair.publicKey())
                .order('desc')
                .limit(20)
                .call();

        const paymentRecords = page.records.filter(record =>
            record.type === 'payment' || record.type === 'create_account'
        );
        const historyItems = await Promise.all(paymentRecords.map(enrichPaymentWithTransaction));

        if (!append) {
            transactionHistoryContainer.innerHTML = '';
        }

        if (!historyItems.length && !append) {
            transactionHistoryContainer.innerHTML = '<p class="empty-state">No recent transactions found for this wallet.</p>';
        } else {
            historyItems.forEach(item => {
                transactionHistoryContainer.appendChild(renderHistoryItem(item));
            });
        }

        transactionHistoryPage = page;
        loadMoreHistoryBtn.classList.toggle('hidden', page.records.length < 20);
    } catch (e) {
        renderMessage(transactionHistoryContainer, 'error', 'Unable to load transaction history', e.message || 'Horizon transaction history could not be reached.');
        loadMoreHistoryBtn.classList.add('hidden');
    } finally {
        setHistoryButtonState(false);
    }
}

// Load balances
async function loadBalances(options = {}) {
    if (!currentKeypair) return;

    const { manualRefresh = false } = options;
    if (manualRefresh) {
        setRefreshButtonState(true);
    }

    balancesContainer.innerHTML = '<p class="loading">Loading balances...</p>';

    try {
        const server = getServer();
        const account = await server.loadAccount(currentKeypair.publicKey());

        balancesContainer.innerHTML = '';
        if (!account.balances.length) {
            balancesContainer.innerHTML = '<p class="empty-state">This account does not have any balances yet.</p>';
            return;
        }

        account.balances.forEach(balance => {
            const div = document.createElement('div');
            div.className = 'balance-item';
            const asset = balance.asset_type === 'native' ? 'XLM' : balance.asset_code;
            div.innerHTML = `<span>${asset}</span><span>${balance.balance}</span>`;
            balancesContainer.appendChild(div);
        });
    } catch (e) {
        renderMessage(balancesContainer, 'error', 'Unable to load balances', e.message || 'The account could not be reached.');
    } finally {
        if (manualRefresh) {
            setRefreshButtonState(false);
        }
    }
}

// Send payment
sendPaymentBtn.addEventListener('click', async () => {
    if (!currentKeypair) {
        renderMessage(transactionResult, 'error', 'Wallet required', 'Please load or generate a wallet first.');
        return;
    }

    const destination = destinationInput.value.trim();
    const amount = amountInput.value.trim();

    if (!destination || !amount) {
        renderMessage(transactionResult, 'error', 'Missing details', 'Please enter both a destination address and amount.');
        return;
    }

    renderMessage(transactionResult, 'info', 'Sending payment', 'The transaction is being submitted.');

    try {
        const server = getServer();
        const sourceAccount = await server.loadAccount(currentKeypair.publicKey());

        const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: getNetworkPassphrase()
        })
            .addOperation(StellarSdk.Operation.payment({
                destination: destination,
                asset: StellarSdk.Asset.native(),
                amount: amount
            }))
            .setTimeout(30)
            .build();

        transaction.sign(currentKeypair);
        const result = await server.submitTransaction(transaction);

        renderMessage(transactionResult, 'success', 'Payment sent', `Transaction hash: ${result.hash}`);
        loadBalances();
        loadTransactionHistory();
    } catch (e) {
        renderMessage(transactionResult, 'error', 'Payment failed', e.message || 'The payment could not be submitted.');
    }
});
