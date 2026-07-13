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

### Developer Setup

New contributors can follow the step-by-step setup guide in
[docs/developer-setup.md](docs/developer-setup.md). It covers prerequisites,
forking, cloning, running the static dashboard locally, manual test steps, and
pull request submission.

### Testnet Faucet

To get testnet XLM for testing, visit the [Stellar Laboratory Faucet](https://laboratory.stellar.org/#account-creator?network=test).

## Project Structure

```text
Stellar-Wallet-Dashboard/
|-- index.html
|-- app.js
|-- styles.css
|-- examples/
|-- docs/
`-- README.md
```

## Contributing

Contributions are welcome! Please read the [developer setup guide](docs/developer-setup.md) before submitting a Pull Request.

## License

GPL-3.0
