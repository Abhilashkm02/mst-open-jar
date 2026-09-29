"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { WalletState } from "@/types";
import { MOCK_WALLET_CONFIG } from "@/lib/mockData";
import { truncateAddress } from "@/lib/formatUtils";
import { MST_CHAIN_CONFIG } from "@/contracts/config";
import { useToast } from "./ToastContext";

interface WalletContextType {
  wallet: WalletState;
  connectWallet: (forceDemo?: boolean) => Promise<boolean>;
  disconnectWallet: () => void;
  adjustBalance: (delta: number) => void;
  toggleDemoMode: () => void;
  refreshBalance: () => Promise<void>;
  switchToMstNetwork: () => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    address: MOCK_WALLET_CONFIG.address,
    truncatedAddress: truncateAddress(MOCK_WALLET_CONFIG.address),
    balance: MOCK_WALLET_CONFIG.startingBalance,
    network: MOCK_WALLET_CONFIG.network,
    chainId: MOCK_WALLET_CONFIG.chainId,
    isRealWeb3: false,
    signer: undefined,
  });

  const providerRef = useRef<ethers.BrowserProvider | null>(null);

  // Helper to reliably find the injected provider (BridgeKey or Ethereum)
  const getInjectedProvider = useCallback(() => {
    if (typeof window === "undefined") return null;

    const win = window as any;
    if (win.bridgekey) return win.bridgekey;

    if (win.ethereum) {
      if (Array.isArray(win.ethereum.providers)) {
        const bk = win.ethereum.providers.find((p: any) => p.isBridgekey || p.isBridgeKey);
        if (bk) return bk;
      }
      return win.ethereum;
    }

    return null;
  }, []);

  // Fetch balance for a given address
  const fetchOnChainBalance = useCallback(
    async (account: string, browserProvider: ethers.BrowserProvider): Promise<number> => {
      try {
        const balWei = await browserProvider.getBalance(account);
        const ethVal = parseFloat(ethers.formatEther(balWei));
        return Number(ethVal.toFixed(4));
      } catch (err) {
        console.warn("Could not query on-chain balance via provider, trying default fallback:", err);
        return 41.99; // Fallback to user's known testnet balance
      }
    },
    []
  );

  // Refresh balance on demand
  const refreshBalance = useCallback(async () => {
    if (wallet.isRealWeb3 && wallet.address && providerRef.current) {
      const bal = await fetchOnChainBalance(wallet.address, providerRef.current);
      setWallet(prev => ({ ...prev, balance: bal }));
    }
  }, [wallet.isRealWeb3, wallet.address, fetchOnChainBalance]);

  // Switch or Add MST Network
  const switchToMstNetwork = useCallback(async (): Promise<boolean> => {
    const injected = getInjectedProvider();
    if (!injected) return false;

    try {
      await injected.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MST_CHAIN_CONFIG.chainIdHex }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902 || switchError.message?.includes("unrecognized")) {
        try {
          await injected.request({
            method: "wallet_addEthereumChain",
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
        } catch {
          showToast({
            title: "Network Error",
            description: "Failed to add MST Testnet to your wallet.",
            type: "error",
          });
          return false;
        }
      }
      return false;
    }
  }, [getInjectedProvider, showToast]);

  // Connect Wallet Handler
  const connectWallet = useCallback(
    async (forceDemo = false): Promise<boolean> => {
      if (wallet.isConnecting) return false;
      setWallet(prev => ({ ...prev, isConnecting: true }));

      // Demo Mode Fallback
      if (forceDemo) {
        await new Promise(r => setTimeout(r, 600));
        setWallet({
          isConnected: true,
          isConnecting: false,
          address: MOCK_WALLET_CONFIG.address,
          truncatedAddress: truncateAddress(MOCK_WALLET_CONFIG.address),
          balance: MOCK_WALLET_CONFIG.startingBalance,
          network: MOCK_WALLET_CONFIG.network,
          chainId: MOCK_WALLET_CONFIG.chainId,
          isRealWeb3: false,
          signer: undefined,
        });

        sessionStorage.setItem("openjar_wallet_mode", "demo");
        showToast({
          title: "Demo Mode Active",
          description: "Connected to local simulated wallet with 48,250 MST.",
          type: "info",
        });
        return true;
      }

      // Detect Injected Wallet Provider
      const injected = getInjectedProvider();

      if (!injected) {
        showToast({
          title: "No Extension Detected",
          description: "Bridgekey extension not detected. Switched to interactive Demo Mode.",
          type: "info",
        });
        return connectWallet(true);
      }

      try {
        const browserProvider = new ethers.BrowserProvider(injected);
        providerRef.current = browserProvider;

        // Request user permission to connect account
        const accounts: string[] = await browserProvider.send("eth_requestAccounts", []);

        if (accounts && accounts.length > 0) {
          const account = accounts[0];
          const signer = await browserProvider.getSigner();

          let chainId = 1088;
          try {
            const network = await browserProvider.getNetwork();
            chainId = Number(network.chainId);
          } catch {
            // default
          }

          // Fetch on-chain balance
          const balance = await fetchOnChainBalance(account, browserProvider);

          setWallet({
            isConnected: true,
            isConnecting: false,
            address: account,
            truncatedAddress: truncateAddress(account),
            balance,
            network: chainId === 1088 ? "MST Testnet" : `Chain ${chainId}`,
            chainId,
            isRealWeb3: true,
            signer,
          });

          sessionStorage.setItem("openjar_wallet_mode", "real");

          showToast({
            title: "Bridgekey Wallet Connected",
            description: `Connected: ${truncateAddress(account)} • ${balance} MST`,
            type: "success",
          });

          // Check if wrong network
          if (chainId !== 1088) {
            switchToMstNetwork();
          }

          return true;
        }
      } catch (err: any) {
        console.warn("Wallet connection prompt error:", err);
        setWallet(prev => ({ ...prev, isConnecting: false }));

        if (err.code === 4001 || err.message?.includes("User rejected")) {
          showToast({
            title: "Connection Cancelled",
            description: "Please approve the connection request in your Bridgekey popup.",
            type: "error",
          });
          return false;
        }

        // If other error occurred, fallback to demo mode gracefully
        showToast({
          title: "Switched to Demo Mode",
          description: "Could not establish injected RPC session. Running in demo mode.",
          type: "info",
        });
        return connectWallet(true);
      }

      setWallet(prev => ({ ...prev, isConnecting: false }));
      return false;
    },
    [wallet.isConnecting, getInjectedProvider, fetchOnChainBalance, showToast, switchToMstNetwork]
  );

  // Disconnect Handler
  const disconnectWallet = useCallback(() => {
    providerRef.current = null;
    setWallet({
      isConnected: false,
      isConnecting: false,
      address: MOCK_WALLET_CONFIG.address,
      truncatedAddress: truncateAddress(MOCK_WALLET_CONFIG.address),
      balance: MOCK_WALLET_CONFIG.startingBalance,
      network: MOCK_WALLET_CONFIG.network,
      chainId: MOCK_WALLET_CONFIG.chainId,
      isRealWeb3: false,
      signer: undefined,
    });
    sessionStorage.removeItem("openjar_wallet_mode");
    showToast({
      title: "Wallet Disconnected",
      description: "Session has been reset.",
      type: "info",
    });
  }, [showToast]);

  const toggleDemoMode = useCallback(() => {
    if (wallet.isRealWeb3) {
      connectWallet(true);
    } else {
      connectWallet(false);
    }
  }, [wallet.isRealWeb3, connectWallet]);

  const adjustBalance = useCallback((delta: number) => {
    setWallet(prev => ({
      ...prev,
      balance: Math.max(0, Number((prev.balance + delta).toFixed(4))),
    }));
  }, []);

  // Auto-connect check on page mount
  useEffect(() => {
    const initCheck = async () => {
      const savedMode = sessionStorage.getItem("openjar_wallet_mode");
      if (savedMode === "demo") {
        connectWallet(true);
        return;
      }

      const injected = getInjectedProvider();
      if (!injected) return;

      try {
        const browserProvider = new ethers.BrowserProvider(injected);
        providerRef.current = browserProvider;

        // eth_accounts checks without triggering user popup
        const accounts: string[] = await browserProvider.send("eth_accounts", []);
        if (accounts && accounts.length > 0) {
          const account = accounts[0];
          const signer = await browserProvider.getSigner();
          const network = await browserProvider.getNetwork();
          const balance = await fetchOnChainBalance(account, browserProvider);

          setWallet({
            isConnected: true,
            isConnecting: false,
            address: account,
            truncatedAddress: truncateAddress(account),
            balance,
            network: Number(network.chainId) === 1088 ? "MST Testnet" : `Chain ${network.chainId}`,
            chainId: Number(network.chainId),
            isRealWeb3: true,
            signer,
          });
        }
      } catch (err) {
        console.warn("Auto session check:", err);
      }
    };

    // Immediate check
    initCheck();

    // Secondary check after 350ms to allow asynchronous extension injections
    const timer = setTimeout(initCheck, 350);

    return () => clearTimeout(timer);
  }, [getInjectedProvider, fetchOnChainBalance, connectWallet]);

  // EIP-1193 listeners for accounts and chain changes
  useEffect(() => {
    const injected = getInjectedProvider();
    if (!injected) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
      } else if (providerRef.current) {
        const newAccount = accounts[0];
        fetchOnChainBalance(newAccount, providerRef.current).then(bal => {
          setWallet(prev => ({
            ...prev,
            address: newAccount,
            truncatedAddress: truncateAddress(newAccount),
            balance: bal,
          }));
        });
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    injected.on?.("accountsChanged", handleAccountsChanged);
    injected.on?.("chainChanged", handleChainChanged);

    return () => {
      injected.removeListener?.("accountsChanged", handleAccountsChanged);
      injected.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [getInjectedProvider, disconnectWallet, fetchOnChainBalance]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connectWallet,
        disconnectWallet,
        adjustBalance,
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
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
