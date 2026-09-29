'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
import { MST_CHAIN_CONFIG, DEFAULT_DEMO_WALLET } from '@/contracts/config';
import { useToast } from './ToastContext';

interface WalletContextType {
  address: string | null;
  balance: string; // Formatted MST
  rawBalance: bigint;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  isDemoMode: boolean;
  walletName: string;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  connectWallet: (isDemo?: boolean) => Promise<boolean>;
  disconnectWallet: () => void;
  toggleDemoMode: () => void;
  refreshBalance: () => Promise<void>;
  switchToMstNetwork: () => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [rawBalance, setRawBalance] = useState<bigint>(BigInt(0));
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [walletName, setWalletName] = useState<string>('Bridgekey Wallet');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const { showSuccess, showError, showInfo } = useToast();

  // Helper to fetch balance for an account
  const fetchBalance = useCallback(async (account: string, currentProvider: ethers.BrowserProvider | null, demo = false) => {
    if (demo) {
      // Demo balance stored or default to 125,000 MST
      const savedBalance = localStorage.getItem('sme_demo_balance');
      const val = savedBalance ? savedBalance : '125000.00';
      setBalance(val);
      setRawBalance(ethers.parseEther(val.replace(/,/g, '')));
      return;
    }

    if (!currentProvider || !account) return;

    try {
      const bal = await currentProvider.getBalance(account);
      setRawBalance(bal);
      const formatted = ethers.formatEther(bal);
      const parsed = parseFloat(formatted);
      setBalance(parsed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } catch (err) {
      console.warn('Failed to fetch on-chain balance:', err);
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (address) {
      await fetchBalance(address, provider, isDemoMode);
    }
  }, [address, provider, isDemoMode, fetchBalance]);

  // Network Switcher
  const switchToMstNetwork = useCallback(async (): Promise<boolean> => {
    const ethereum = typeof window !== 'undefined' ? (window as any).ethereum || (window as any).bridgekey : null;
    if (!ethereum) return false;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MST_CHAIN_CONFIG.chainIdHex }],
      });
      return true;
    } catch (switchError: any) {
      // Chain not added error code 4902
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: MST_CHAIN_CONFIG.chainIdHex,
                chainName: MST_CHAIN_CONFIG.chainName,
                nativeCurrency: MST_CHAIN_CONFIG.nativeCurrency,
                rpcUrls: MST_CHAIN_CONFIG.rpcUrls,
                blockExplorerUrls: MST_CHAIN_CONFIG.blockExplorerUrls,
              },
            ],
          });
          return true;
        } catch (addError) {
          showError('Failed to add MST Network to wallet');
          return false;
        }
      }
      return false;
    }
  }, [showError]);

  // Connect Wallet
  const connectWallet = useCallback(async (forceDemo = false): Promise<boolean> => {
    setIsConnecting(true);

    if (forceDemo) {
      setIsDemoMode(true);
      setAddress(DEFAULT_DEMO_WALLET);
      setWalletName('Bridgekey (Demo Mode)');
      setChainId(MST_CHAIN_CONFIG.chainId);
      setSigner(null);
      setProvider(null);
      
      const savedBalance = localStorage.getItem('sme_demo_balance') || '125000.00';
      setBalance(savedBalance);
      setRawBalance(ethers.parseEther(savedBalance.replace(/,/g, '')));
      
      setIsConnecting(false);
      showSuccess('Connected to Bridgekey Demo Wallet', 'Instant test wallet loaded with 125,000 MST tokens.');
      return true;
    }

    const ethereum = typeof window !== 'undefined' ? (window as any).bridgekey || (window as any).ethereum : null;

    if (!ethereum) {
      showInfo('No Web3 wallet extension detected', 'Switched to Bridgekey Interactive Demo Mode with 125,000 MST.');
      return connectWallet(true);
    }

    try {
      const browserProvider = new ethers.BrowserProvider(ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        const browserSigner = await browserProvider.getSigner();
        const network = await browserProvider.getNetwork();

        setProvider(browserProvider);
        setSigner(browserSigner);
        setAddress(account);
        setChainId(Number(network.chainId));
        setIsDemoMode(false);
        setWalletName((window as any).bridgekey ? 'Bridgekey Wallet' : 'Injected Web3 Wallet');

        await fetchBalance(account, browserProvider, false);
        showSuccess('Bridgekey Wallet Connected', `Account: ${account.slice(0, 6)}...${account.slice(-4)}`);
        setIsConnecting(false);
        return true;
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      if (err.code === 4001) {
        showError('Connection Cancelled', 'Please approve the wallet connection request.');
      } else {
        showInfo('Fallback to Demo Mode', 'Using Bridgekey simulated environment.');
        return connectWallet(true);
      }
    } finally {
      setIsConnecting(false);
    }
    return false;
  }, [fetchBalance, showSuccess, showError, showInfo]);

  // Disconnect
  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setBalance('0.00');
    setRawBalance(BigInt(0));
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setIsDemoMode(false);
    showInfo('Wallet Disconnected', 'Your wallet session has been cleared.');
  }, [showInfo]);

  // Toggle Demo Mode
  const toggleDemoMode = useCallback(() => {
    if (isDemoMode) {
      disconnectWallet();
    } else {
      connectWallet(true);
    }
  }, [isDemoMode, connectWallet, disconnectWallet]);

  // Auto-connect if already authorized in BridgeKey / Injected
  useEffect(() => {
    const ethereum = typeof window !== 'undefined' ? (window as any).bridgekey || (window as any).ethereum : null;
    if (!ethereum) return;

    const checkExistingSession = async () => {
      try {
        const browserProvider = new ethers.BrowserProvider(ethereum);
        const accounts = await browserProvider.send('eth_accounts', []);
        if (accounts && accounts.length > 0) {
          const account = accounts[0];
          const browserSigner = await browserProvider.getSigner();
          const network = await browserProvider.getNetwork();

          setProvider(browserProvider);
          setSigner(browserSigner);
          setAddress(account);
          setChainId(Number(network.chainId));
          setIsDemoMode(false);
          setWalletName((window as any).bridgekey ? 'BridgeKey Wallet' : 'Injected Web3 Wallet');

          await fetchBalance(account, browserProvider, false);
        }
      } catch (err) {
        console.warn('Auto connection check:', err);
      }
    };

    checkExistingSession();
  }, [fetchBalance]);

  // Listen to EIP-1193 events
  useEffect(() => {
    const ethereum = typeof window !== 'undefined' ? (window as any).bridgekey || (window as any).ethereum : null;
    if (!ethereum || isDemoMode) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAddress(accounts[0]);
        if (provider) {
          fetchBalance(accounts[0], provider, false);
        }
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    ethereum.on?.('accountsChanged', handleAccountsChanged);
    ethereum.on?.('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      ethereum.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [provider, isDemoMode, disconnectWallet, fetchBalance]);

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        rawBalance,
        chainId,
        isConnected: !!address,
        isConnecting,
        isDemoMode,
        walletName,
        provider,
        signer,
        connectWallet,
        disconnectWallet,
        toggleDemoMode,
        refreshBalance,
        switchToMstNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
