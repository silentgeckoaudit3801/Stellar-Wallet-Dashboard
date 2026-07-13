# Stellar-Wallet-Dashboard

A user-friendly, web-based dashboard that provides an intuitive Graphical User Interface (GUI) for seamless Stellar account management. Designed for non-technical users and developers alike, this application enables wallet generation, real-time balance tracking, and secure payment processing without writing a single line of code.

Beyond its utility as a wallet, this project serves as a clean reference implementation, demonstrating architecture patterns and security best practices for building modern applications on the Stellar network.

---
## Features

- Generate new Stellar keypairs
- Load existing wallets using secret keys
- View XLM and asset balances
- Send payment transactions
- Switch between testnet and mainnet

## Getting Started

## Examples

Standalone demo pages live in [examples/README.md](examples/README.md) and cover wallet generation, balance lookups, and payment building with simple HTML and JavaScript.

### Prerequisites

You just need a web browser! No installation required.

### Usage

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Generate a new wallet or load an existing one
4. Start managing your Stellar account!

### Clone the Repository

```bash
git clone https://github.com/Dot-Voidz/Stellar-Wallet-Dashboard.git
cd Stellar-Wallet-Dashboard
```

### Testnet Faucet

To get testnet XLM for testing, visit the [Stellar Laboratory Faucet](https://laboratory.stellar.org/#account-creator?network=test).

## Security Best Practices

Stellar wallets are controlled by secret keys. Anyone with a valid secret key
can sign transactions for that account.

1. Never share a secret key, recovery phrase, or private signing material.
2. Do not paste mainnet secret keys into unfamiliar websites, demos, browser
   consoles, support chats, or screenshots.
3. Use testnet first when learning the dashboard, testing changes, or
   demonstrating payment flows.
4. Verify that links, browser tabs, and network selectors are what you expect
   before entering wallet data.
5. Treat unexpected wallet prompts, direct messages, copied URLs, and fake
   support pages as phishing risks.
6. Store production keys in a trusted wallet or secret manager instead of plain
   text files.
7. Keep a secure backup process before funding any mainnet wallet.

Official Stellar security resources:

- [Stellar security documentation](https://developers.stellar.org/docs/learn/security)
- [Stellar account and key concepts](https://developers.stellar.org/docs/learn/encyclopedia/accounts)

## Project Structure

```text
Stellar-Wallet-Dashboard/
|-- index.html
|-- app.js
|-- styles.css
|-- examples/
`-- README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

GPL-3.0
