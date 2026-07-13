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

Testnet XLM is practice currency for the Stellar test network. It lets you
generate wallets, refresh balances, and send payments without using real funds
on mainnet.

1. Open the dashboard and make sure the network selector is set to `Testnet`.
2. Generate a new wallet or load a testnet wallet.
3. Copy the public key that starts with `G`.
4. Visit the [Stellar Laboratory Faucet](https://laboratory.stellar.org/#account-creator?network=test).
5. Paste the public key into the account creator form.
6. Submit the form to fund the account with testnet XLM.
7. Return to the dashboard and refresh balances.

If the balance does not appear immediately, wait a few seconds and refresh
again. Testnet resets can occasionally clear funded accounts, so repeat these
steps whenever a test account needs fresh funds.

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
