let currentKeypair = null;
let currentNetwork = 'testnet';

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
const trustlinesContainer = document.getElementById('trustlines');
const trustlineForm = document.getElementById('trustline-form');
const trustlineAssetCodeInput = document.getElementById('trustline-asset-code');
const trustlineIssuerInput = document.getElementById('trustline-issuer');
const trustlineResult = document.getElementById('trustline-result');
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

function setRefreshButtonState(isLoading) {
    if (!refreshBalancesBtn) return;

    refreshBalancesBtn.disabled = isLoading;
    refreshBalancesBtn.classList.toggle('is-loading', isLoading);
    refreshBalancesBtn.innerHTML = isLoading
        ? '<span class="refresh-icon" aria-hidden="true">⟳</span><span class="refresh-label">Refreshing…</span>'
        : '<span class="refresh-icon" aria-hidden="true">↻</span><span class="refresh-label">Refresh</span>';
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

function getIssuedAsset(balance) {
    return new StellarSdk.Asset(balance.asset_code, balance.asset_issuer);
}

function validateAssetCode(assetCode) {
    return /^[A-Z0-9]{1,12}$/.test(assetCode);
}

function renderTrustlines(balances = []) {
    const trustlines = balances.filter(balance => balance.asset_type !== 'native');
    trustlinesContainer.innerHTML = '';

    if (!currentKeypair) {
        trustlinesContainer.innerHTML = '<p class="loading">Load a wallet to view trustlines</p>';
        return;
    }

    if (!trustlines.length) {
        trustlinesContainer.innerHTML = '<p class="empty-state">No trustlines found for this wallet.</p>';
        return;
    }

    trustlines.forEach(balance => {
        const item = document.createElement('div');
        item.className = 'trustline-item';

        const details = document.createElement('div');
        details.className = 'trustline-details';

        const title = document.createElement('strong');
        title.textContent = balance.asset_code;

        const issuer = document.createElement('span');
        issuer.textContent = `Issuer: ${balance.asset_issuer}`;

        const balanceText = document.createElement('span');
        balanceText.textContent = `Balance: ${balance.balance}`;

        details.appendChild(title);
        details.appendChild(issuer);
        details.appendChild(balanceText);

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'danger-button';
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => removeTrustline(balance));

        item.appendChild(details);
        item.appendChild(removeButton);
        trustlinesContainer.appendChild(item);
    });
}

async function submitChangeTrust(asset, limit) {
    const server = getServer();
    const sourceAccount = await server.loadAccount(currentKeypair.publicKey());
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: getNetworkPassphrase()
    })
        .addOperation(StellarSdk.Operation.changeTrust({
            asset,
            limit
        }))
        .setTimeout(30)
        .build();

    transaction.sign(currentKeypair);
    return server.submitTransaction(transaction);
}

async function removeTrustline(balance) {
    if (!currentKeypair) return;

    try {
        renderMessage(trustlineResult, 'info', 'Removing trustline', `Submitting removal for ${balance.asset_code}.`);
        const result = await submitChangeTrust(getIssuedAsset(balance), '0');
        renderMessage(trustlineResult, 'success', 'Trustline removed', `Transaction hash: ${result.hash}`);
        loadBalances();
    } catch (e) {
        renderMessage(trustlineResult, 'error', 'Trustline removal failed', e.message || 'The trustline could not be removed.');
    }
}

trustlineForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!currentKeypair) {
        renderMessage(trustlineResult, 'error', 'Wallet required', 'Load or generate a wallet before adding a trustline.');
        return;
    }

    const assetCode = trustlineAssetCodeInput.value.trim().toUpperCase();
    const issuer = trustlineIssuerInput.value.trim();

    if (!validateAssetCode(assetCode)) {
        renderMessage(trustlineResult, 'error', 'Invalid asset code', 'Use 1 to 12 uppercase letters or numbers.');
        return;
    }

    try {
        StellarSdk.Keypair.fromPublicKey(issuer);
    } catch (e) {
        renderMessage(trustlineResult, 'error', 'Invalid issuer', 'Enter a valid Stellar issuer public key.');
        return;
    }

    try {
        renderMessage(trustlineResult, 'info', 'Adding trustline', `Submitting trustline for ${assetCode}.`);
        const result = await submitChangeTrust(new StellarSdk.Asset(assetCode, issuer));
        renderMessage(trustlineResult, 'success', 'Trustline added', `Transaction hash: ${result.hash}`);
        trustlineForm.reset();
        loadBalances();
    } catch (e) {
        renderMessage(trustlineResult, 'error', 'Trustline failed', e.message || 'The trustline could not be added.');
    }
});

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
            renderTrustlines([]);
            return;
        }

        renderTrustlines(account.balances);
        account.balances.forEach(balance => {
            const div = document.createElement('div');
            div.className = 'balance-item';
            const asset = balance.asset_type === 'native' ? 'XLM' : balance.asset_code;
            div.innerHTML = `<span>${asset}</span><span>${balance.balance}</span>`;
            balancesContainer.appendChild(div);
        });
    } catch (e) {
        renderTrustlines([]);
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
