let currentKeypair = null;
let currentNetwork = 'testnet';
let currentAccount = null;

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
const networkSelect = document.getElementById('network-select');
const multisigInfo = document.getElementById('multisig-info');
const signerPublicKeyInput = document.getElementById('signer-public-key');
const signerWeightInput = document.getElementById('signer-weight');
const addSignerBtn = document.getElementById('add-signer');
const transactionXdrInput = document.getElementById('transaction-xdr');
const signerSecretKeyInput = document.getElementById('signer-secret-key');
const signTransactionBtn = document.getElementById('sign-transaction');
const multisigResult = document.getElementById('multisig-result');

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

function isValidPublicKey(value) {
    return typeof value === 'string' && StellarSdk.StrKey.isValidEd25519PublicKey(value);
}

function isValidSecretKey(value) {
    return typeof value === 'string' && StellarSdk.StrKey.isValidEd25519SecretSeed(value);
}

function renderMultisigInfo(account) {
    if (!multisigInfo) return;

    multisigInfo.innerHTML = '';
    if (!account) {
        multisigInfo.innerHTML = '<p class="loading">Load a wallet to view multisig details</p>';
        return;
    }

    const thresholdList = document.createElement('dl');
    thresholdList.className = 'threshold-grid';
    const thresholds = [
        ['Low', account.thresholds.low_threshold],
        ['Medium', account.thresholds.med_threshold],
        ['High', account.thresholds.high_threshold]
    ];

    thresholds.forEach(([label, value]) => {
        const term = document.createElement('dt');
        term.textContent = label;
        const detail = document.createElement('dd');
        detail.textContent = String(value);
        thresholdList.appendChild(term);
        thresholdList.appendChild(detail);
    });

    const signerTitle = document.createElement('h3');
    signerTitle.textContent = 'Signers';

    const signerList = document.createElement('div');
    signerList.className = 'signer-list';
    account.signers.forEach((signer) => {
        const row = document.createElement('div');
        row.className = 'signer-item';

        const key = document.createElement('span');
        key.textContent = signer.key;

        const weight = document.createElement('strong');
        weight.textContent = `Weight ${signer.weight}`;

        row.appendChild(key);
        row.appendChild(weight);
        signerList.appendChild(row);
    });

    multisigInfo.appendChild(thresholdList);
    multisigInfo.appendChild(signerTitle);
    multisigInfo.appendChild(signerList);
}

// Show wallet info
function showWalletInfo() {
    walletInfo.classList.remove('hidden');
    publicKeyDisplay.textContent = currentKeypair.publicKey();
    secretKeyDisplay.textContent = currentKeypair.secret();
    currentAccount = null;
    renderMultisigInfo(null);
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
        currentAccount = account;
        renderMultisigInfo(account);

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
        currentAccount = null;
        renderMultisigInfo(null);
        renderMessage(balancesContainer, 'error', 'Unable to load balances', e.message || 'The account could not be reached.');
    } finally {
        if (manualRefresh) {
            setRefreshButtonState(false);
        }
    }
}

addSignerBtn.addEventListener('click', async () => {
    if (!currentKeypair) {
        renderMessage(multisigResult, 'error', 'Wallet required', 'Load a wallet before adding a signer.');
        return;
    }

    const signerPublicKey = signerPublicKeyInput.value.trim();
    const weight = Number.parseInt(signerWeightInput.value, 10);

    if (!isValidPublicKey(signerPublicKey)) {
        renderMessage(multisigResult, 'error', 'Invalid signer', 'Enter a valid Stellar public key for the signer.');
        return;
    }

    if (!Number.isInteger(weight) || weight < 0 || weight > 255) {
        renderMessage(multisigResult, 'error', 'Invalid weight', 'Signer weight must be an integer from 0 to 255.');
        return;
    }

    renderMessage(multisigResult, 'info', 'Submitting signer update', 'The signer update transaction is being submitted.');

    try {
        const server = getServer();
        const sourceAccount = await server.loadAccount(currentKeypair.publicKey());
        const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: getNetworkPassphrase()
        })
            .addOperation(StellarSdk.Operation.setOptions({
                signer: {
                    ed25519PublicKey: signerPublicKey,
                    weight
                }
            }))
            .setTimeout(30)
            .build();

        transaction.sign(currentKeypair);
        const result = await server.submitTransaction(transaction);
        renderMessage(multisigResult, 'success', 'Signer updated', `Transaction hash: ${result.hash}`);
        loadBalances();
    } catch (e) {
        renderMessage(multisigResult, 'error', 'Signer update failed', e.message || 'The signer transaction could not be submitted.');
    }
});

signTransactionBtn.addEventListener('click', () => {
    const transactionXdr = transactionXdrInput.value.trim();
    const signerSecret = signerSecretKeyInput.value.trim();

    if (!transactionXdr) {
        renderMessage(multisigResult, 'error', 'Missing XDR', 'Paste a transaction XDR before signing.');
        return;
    }

    if (!isValidSecretKey(signerSecret)) {
        renderMessage(multisigResult, 'error', 'Invalid signer secret', 'Enter a valid Stellar secret key for the signer.');
        return;
    }

    try {
        const transaction = new StellarSdk.Transaction(transactionXdr, getNetworkPassphrase());
        transaction.sign(StellarSdk.Keypair.fromSecret(signerSecret));
        transactionXdrInput.value = transaction.toXDR();
        renderMessage(multisigResult, 'success', 'XDR signed', 'The transaction XDR now includes the provided signer signature.');
    } catch (e) {
        renderMessage(multisigResult, 'error', 'Signing failed', e.message || 'The XDR could not be parsed or signed.');
    }
});

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
