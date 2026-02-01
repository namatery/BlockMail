import { HardhatAccount } from '../types';

// Contract ABI
export const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "Message",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      }
    ],
    "name": "sendMessage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

// Contract address (from environment variables)
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// RPC URLs (from environment variables)
export const RPC_URL = import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8545';

// Pinata IPFS (from environment variables)
export const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';
export const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || '';

// Hardhat default accounts
export const HARDHAT_ACCOUNTS: HardhatAccount[] = [
  { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', name: 'Account #0' },
  { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', name: 'Account #1' },
  { address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', name: 'Account #2' },
];
