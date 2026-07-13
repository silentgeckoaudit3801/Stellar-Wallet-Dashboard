# Developer Setup Guide

This project is a static Stellar wallet dashboard. The main app is loaded from
`index.html`, styled by `styles.css`, and driven by `app.js`.

## Prerequisites

- A modern browser such as Chrome, Edge, Firefox, or Safari.
- A code editor such as VS Code.
- Git for cloning and creating branches.
- Optional: a local static file server. This is useful when your browser blocks
  local files or when you want a consistent localhost URL.

No package install is required for the current static dashboard.

## Fork and clone

1. Fork the repository on GitHub.
2. Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/Stellar-Wallet-Dashboard.git
cd Stellar-Wallet-Dashboard
```

3. Add the upstream remote:

```bash
git remote add upstream https://github.com/Dot-Voidz/Stellar-Wallet-Dashboard.git
git fetch upstream
```

4. Create a branch for your change:

```bash
git checkout -b docs/my-change
```

## Run locally

The quickest path is to open `index.html` directly in your browser.

For a localhost workflow, run any static file server from the repository root.
Examples:

```bash
python -m http.server 8000
```

or:

```bash
npx serve .
```

Then open:

```text
http://localhost:8000
```

## Manual test checklist

Use testnet while developing unless you intentionally need mainnet.

1. Open the dashboard.
2. Confirm the network selector defaults to `Testnet`.
3. Click `Generate New Wallet`.
4. Confirm a public key and secret key appear.
5. Use the Stellar testnet faucet to fund the generated account.
6. Click `Refresh` and confirm balances render.
7. Enter a testnet destination and amount.
8. Send a small test payment and confirm the result message includes a
   transaction hash or a useful error.
9. Try invalid secret keys, destination addresses, and empty amounts.
10. Check the standalone examples in `examples/README.md`.

## Submitting changes

1. Keep changes focused on the issue you are solving.
2. Re-run the manual checklist for UI or wallet-flow changes.
3. Do not commit generated wallets, real secret keys, screenshots containing
   private keys, or local editor files.
4. Commit with a clear message:

```bash
git add .
git commit -m "docs: add developer setup guide"
```

5. Push your branch:

```bash
git push origin docs/my-change
```

6. Open a pull request against `Dot-Voidz/Stellar-Wallet-Dashboard:main`.
7. In the pull request description, include:
   - The issue number.
   - What changed.
   - How you tested it.
   - Any known limitations.

## Security notes

- Use testnet accounts for development.
- Never paste a mainnet secret key into a local build you do not control.
- Never commit `.env` files, secret seeds, or funded account credentials.
- Treat browser console output as visible debugging data and avoid logging
  secrets there.
