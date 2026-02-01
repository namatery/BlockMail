import { useState, useCallback, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { Email } from '../types';
import { CONTRACT_ABI, CONTRACT_ADDRESS, WS_URL } from '../config/constants';

// Storage key for persisting connection
const STORAGE_KEY = 'blockmail_connection';

interface ConnectionInfo {
  type: 'hardhat';
  accountIndex: number;
}

interface UseWalletReturn {
  isConnected: boolean;
  contract: ethers.Contract | null;
  userAddress: string;
  networkName: string;
  emails: Email[];
  isReconnecting: boolean;
  connectHardhat: (accountIndex: number) => Promise<void>;
  disconnect: () => void;
  addEmail: (email: Email) => void;
  markAsRead: (emailId: string) => void;
}

export function useWallet(
  showToast: (message: string, type: 'success' | 'error') => void
): UseWalletReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [userAddress, setUserAddress] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [emails, setEmails] = useState<Email[]>([]);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const hasAttemptedReconnect = useRef(false)

  // Connect to local Hardhat node
  const connectHardhat = useCallback(async (accountIndex: number) => {
    try {
      // Use WebSocket provider for real-time event subscriptions
      const provider = new ethers.WebSocketProvider(WS_URL);
      
      // Get account from hardhat's default accounts
      const accounts = await provider.send('eth_accounts', []);
      const address = accounts[accountIndex];
      
      // Create a signer using the account
      const signer = await provider.getSigner(address);

      const blockMail = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setContract(blockMail);
      setUserAddress(address);
      setNetworkName('Hardhat Local');
      setIsConnected(true);

      // Save connection info for auto-reconnect
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        type: 'hardhat', 
        accountIndex 
      } as ConnectionInfo));

      showToast('Connected to Hardhat!', 'success');
    } catch (err) {
      console.error('Connection failed:', err);
      showToast('Failed to connect. Is Hardhat running?', 'error');
    }
  }, [showToast]);

  // Disconnect
  const disconnect = useCallback(async () => {
    if (contract) {
      contract.removeAllListeners();
      // Close WebSocket connection if exists
      const provider = contract.runner?.provider;
      if (provider && 'destroy' in provider) {
        await (provider as ethers.WebSocketProvider).destroy();
      }
    }
    // Clear saved connection
    localStorage.removeItem(STORAGE_KEY);
    
    setIsConnected(false);
    setContract(null);
    setUserAddress('');
    setNetworkName('');
    setEmails([]);
  }, [contract]);

  // Auto-reconnect on mount
  useEffect(() => {
    if (hasAttemptedReconnect.current) return;
    hasAttemptedReconnect.current = true;

    const savedConnection = localStorage.getItem(STORAGE_KEY);
    if (!savedConnection) return;

    try {
      const connectionInfo: ConnectionInfo = JSON.parse(savedConnection);
      setIsReconnecting(true);

      if (connectionInfo.type === 'hardhat' && connectionInfo.accountIndex !== undefined) {
        connectHardhat(connectionInfo.accountIndex).finally(() => {
          setIsReconnecting(false);
        });
      } else {
        setIsReconnecting(false);
      }
    } catch (err) {
      console.error('Failed to restore connection:', err);
      localStorage.removeItem(STORAGE_KEY);
      setIsReconnecting(false);
    }
  }, [connectHardhat]);

  // Add email
  const addEmail = useCallback((email: Email) => {
    setEmails(prev => [email, ...prev]);
  }, []);

  // Mark email as read
  const markAsRead = useCallback((emailId: string) => {
    setEmails(prev =>
      prev.map(e => e.id === emailId ? { ...e, read: true } : e)
    );
  }, []);

  return {
    isConnected,
    contract,
    userAddress,
    networkName,
    emails,
    isReconnecting,
    connectHardhat,
    disconnect,
    addEmail,
    markAsRead,
  };
}
