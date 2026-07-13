let currentKeypair = null;
let currentNetwork = 'testnet';
let copySecretKeyTimer = null;

// DOM Elements
const secretKeyInput = document.getElementById('secret-key');
const toggleSecretBtn = document.getElementById('toggle-secret');
const loadWalletBtn = document.getElementById('load-wallet');
const generateWalletBtn = document.getElementById('generate-wallet');
const walletInfo = document.getElementById('wallet-info');
const walletFeedback = document.getElementById('wallet-feedback');
const publicKeyDisplay = document.getElementById('public-key');
const secretKeyDisplay = document.getElementById('secret-key-display');
const copySecretKeyBtn = document.getElementById('copy-secret-key');
const copySecretKeyStatus = document.getElementById('copy-secret-key-status');
const secretCopyModal = document.getElementById('secret-copy-modal');
const confirmCopySecretKeyBtn = document.getElementById('confirm-copy-secret-key');
const cancelCopySecretKeyBtn = document.getElementById('cancel-copy-secret-key');
const balancesContainer = document.getElementById('balances');
const refreshBalancesBtn = document.getElementById('refresh-balances');
const destinationInput = document.getElementById('destination');
const amountInput = document.getElementById('amount');
const sendPaymentBtn = document.getElementById('send-payment');
const transactionResult = document.getElementById('transaction-result');
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

copySecretKeyBtn.addEventListener('click', () => {
    if (!currentKeypair) return;
    openSecretCopyModal();
});

confirmCopySecretKeyBtn.addEventListener('click', async () => {
    if (!currentKeypair) return;

    try {
        await copyText(currentKeypair.secret());
        closeSecretCopyModal();
        showCopySecretKeyStatus('Secret key copied. Keep it private.');
    } catch (e) {
        closeSecretCopyModal();
        showCopySecretKeyStatus('Unable to copy secret key.', true);
    }
});

cancelCopySecretKeyBtn.addEventListener('click', closeSecretCopyModal);

secretCopyModal.addEventListener('click', (event) => {
    if (event.target === secretCopyModal) {
        closeSecretCopyModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !secretCopyModal.classList.contains('hidden')) {
        closeSecretCopyModal();
    }
});

// Network change
networkSelect.addEventListener('change', (e) => {
    currentNetwork = e.target.value;
    if (currentKeypair) {
        loadBalances();
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
});

refreshBalancesBtn.addEventListener('click', () => {
    if (!currentKeypair) {
        renderMessage(walletFeedback, 'error', 'No wallet loaded', 'Load or generate a wallet before refreshing balances.');
        return;
    }

    loadBalances({ manualRefresh: true });
});

async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (!copied) {
        throw new Error('Copy command failed');
    }
}

function openSecretCopyModal() {
    secretCopyModal.classList.remove('hidden');
    confirmCopySecretKeyBtn.focus();
}

function closeSecretCopyModal() {
    secretCopyModal.classList.add('hidden');
    copySecretKeyBtn.focus();
}

function showCopySecretKeyStatus(message, isError = false) {
    clearTimeout(copySecretKeyTimer);
    copySecretKeyStatus.textContent = message;
    copySecretKeyStatus.classList.toggle('copy-status-error', isError);

    copySecretKeyTimer = setTimeout(() => {
        copySecretKeyStatus.textContent = '';
        copySecretKeyStatus.classList.remove('copy-status-error');
    }, 2000);
}

function setRefreshButtonState(isLoading) {
    if (!refreshBalancesBtn) return;

    refreshBalancesBtn.disabled = isLoading;
    refreshBalancesBtn.classList.toggle('is-loading', isLoading);
    refreshBalancesBtn.innerHTML = isLoading
        ? '<span class="refresh-icon" aria-hidden="true">âŸ³</span><span class="refresh-label">Refreshingâ€¦</span>'
        : '<span class="refresh-icon" aria-hidden="true">â†»</span><span class="refresh-label">Refresh</span>';
}

function renderMessage(container, type, title, message) {
    if (!container) return;

    container.innerHTML = '';
    container.classList.remove('hidden');

    const messageBox = document.createElement('div');
    messageBox.className = `message message-${type}`;

    const icon = document.createElement('span');
    icon.className = 'message-icon';
    icon.textContent = type === 'error' ? 'âš ' : type === 'success' ? 'âœ“' : 'â„¹';

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
    dismissButton.textContent = 'Ã—';
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
    copySecretKeyBtn.disabled = false;
    showCopySecretKeyStatus('');
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
    } catch (e) {
        renderMessage(transactionResult, 'error', 'Payment failed', e.message || 'The payment could not be submitted.');
    }
});
