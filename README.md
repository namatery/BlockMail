# BlockMail

A decentralized email system built on Ethereum blockchain with IPFS storage. Send and receive messages between Ethereum addresses with content stored on IPFS and metadata recorded on-chain.

## Features

- **Decentralized Messaging**: Send messages directly between Ethereum addresses
- **IPFS Storage**: Message content stored on IPFS via Pinata for permanent, decentralized storage
- **On-Chain Records**: Message metadata (sender, recipient, timestamp, IPFS CID) recorded on Ethereum
- **Desktop Application**: Native Electron app with modern React UI
- **Real-Time Updates**: WebSocket-based event polling for instant message notifications
- **Wallet Integration**: Connect via MetaMask or use development accounts

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Electron App  │────▶│  Smart Contract │────▶│    Ethereum     │
│   (React + TS)  │     │   (Solidity)    │     │   Blockchain    │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│   IPFS/Pinata   │
│  (Message Data) │
└─────────────────┘
```

## Project Structure

```
blockmail/
├── packages/
│   ├── app/              # Electron desktop application
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── config/       # Configuration & constants
│   │   │   ├── types/        # TypeScript types
│   │   │   └── utils/        # Helper utilities
│   │   └── ...
│   └── contracts/        # Solidity smart contracts
│       ├── contracts/        # Solidity source files
│       ├── ignition/         # Deployment modules
│       ├── scripts/          # Deployment scripts
│       └── test/             # Contract tests
├── docker-compose.yml    # Run local blockchain in Docker
├── package.json          # Root workspace config
└── README.md
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MetaMask browser extension (for production use)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create environment files for the app:

```bash
cp packages/app/.env.example packages/app/.env
```

Edit `packages/app/.env` with your configuration:

```env
# Contract address (use default for local development)
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# KeyRegistry contract - use the "KeyRegistry deployed to: 0x..." address from deploy script
VITE_KEY_REGISTRY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

# RPC URLs
VITE_RPC_URL=http://127.0.0.1:8545
VITE_WS_URL=ws://127.0.0.1:8545

# Pinata IPFS Configuration (get from https://app.pinata.cloud)
VITE_PINATA_JWT=your_pinata_jwt_here
VITE_PINATA_GATEWAY=your_gateway_subdomain.mypinata.cloud
```

### 3. Start Local Blockchain

In one terminal, start the Hardhat local node:

```bash
npm run contracts:node
```

### 4. Deploy Smart Contract

In another terminal, deploy the contract to your local node:

```bash
npm run contracts:deploy:local
```

### 5. Start the Application

```bash
npm run app:start
```

Or run everything together:

```bash
npm run dev
```

### Running with Docker

Run the local Hardhat blockchain and deploy the contract in containers:

```bash
docker compose up -d
```

This starts:

- **blockchain** – Hardhat node at `http://localhost:8545`
- **deploy** – One-off job that deploys the BlockMail contract once the node is ready

Then start the app on your host (the app is a desktop GUI, so it runs outside Docker):

```bash
npm run app:start
```

Ensure `packages/app/.env` uses `VITE_RPC_URL=http://127.0.0.1:8545` and `VITE_WS_URL=ws://127.0.0.1:8545`. The deploy job prints the contract address; if it differs from your default, set `VITE_CONTRACT_ADDRESS` in `.env` to match.

Stop the stack:

```bash
docker compose down
```

Or use npm scripts: `npm run docker:up`, `npm run docker:down`, `npm run docker:logs`.

#### Building the client app in Docker

You can build the Electron app (Linux `.deb`, `.rpm`, etc.) inside Docker for reproducible or CI builds:

```bash
docker compose run --rm app-build
```

Artifacts are written to `packages/app/out/`. The desktop app itself is intended to run on your host (it’s a GUI); use this when you want to produce installers in a container.

## Tech Stack

### Application
- **Electron** - Desktop application framework
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **ethers.js** - Ethereum library
- **Pinata SDK** - IPFS pinning service

### Smart Contracts
- **Solidity** - Smart contract language
- **Hardhat** - Development framework
- **Hardhat Ignition** - Deployment system

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Ethereum](https://ethereum.org/) - Blockchain platform
- [IPFS](https://ipfs.io/) - Distributed storage
- [Pinata](https://pinata.cloud/) - IPFS pinning service
- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [Electron](https://www.electronjs.org/) - Desktop application framework
