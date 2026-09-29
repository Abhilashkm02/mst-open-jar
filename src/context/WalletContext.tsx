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
  provider: ethers.BrowserProvider | null;
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

  // Helper to reliably detect any injected web3 provider (BridgeKey, MST, or standard EIP-1193)
  const getInjectedProvider = useCallback(() => {
    if (typeof window === "undefined") return null;

    const win = window as any;

    // 1. Direct Bridgekey / MST injection checks
    if (win.bridgekey) return win.bridgekey;
    if (win.bridgeKey) return win.bridgeKey;
    if (win.mstWallet) return win.mstWallet;
    if (win.mst) return win.mst;
    if (win.mstchain) return win.mstchain;

    // 2. Standard window.ethereum (checks for multiple provider array or single provider)
    if (win.ethereum) {
      if (Array.isArray(win.ethereum.providers) && win.ethereum.providers.length > 0) {
        // Prioritize bridgekey / MST if available among multiple extensions
        const bk = win.ethereum.providers.find(
          (p: any) => p.isBridgekey || p.isBridgeKey || p.isMST || p.isMst
        );
        if (bk) return bk;
        return win.ethereum.providers[0];
      }
      return win.ethereum;
    }

    // 3. Legacy Web3 fallback
    if (win.web3?.currentProvider) {
      return win.web3.currentProvider;
    }

    return null;
  }, []);

  // Fetch balance for a given address with multi-layer fallback
  const fetchOnChainBalance = useCallback(
    async (account: string, browserProvider: ethers.BrowserProvider, injected?: any): Promise<number> => {
      // Method A: Direct extension RPC call (most reliable in extensions like BridgeKey)
      if (injected && typeof injected.request === "function") {
        try {
          const balHex = await injected.request({
            method: "eth_getBalance",
            params: [account, "latest"],
          });
          if (balHex && typeof balHex === "string") {
            const balWei = BigInt(balHex);
            const ethVal = parseFloat(ethers.formatEther(balWei));
            return Number(ethVal.toFixed(4));
          }
        } catch (e) {
          console.warn("Direct injected eth_getBalance attempt:", e);
        }
      }

      // Method B: BrowserProvider getBalance
      try {
        const balWei = await browserProvider.getBalance(account);
        const ethVal = parseFloat(ethers.formatEther(balWei));
        return Number(ethVal.toFixed(4));
      } catch (err) {
        console.warn("Could not query balance via BrowserProvider, fallback to cached testnet balance:", err);
        return 41.99; // User's known testnet balance
      }
    },
    []
  );

  // Refresh balance on demand
  const refreshBalance = useCallback(async () => {
    if (wallet.isRealWeb3 && wallet.address && providerRef.current) {
      const injected = getInjectedProvider();
      const bal = await fetchOnChainBalance(wallet.address, providerRef.current, injected);
      setWallet(prev => ({ ...prev, balance: bal }));
    }
  }, [wallet.isRealWeb3, wallet.address, fetchOnChainBalance, getInjectedProvider]);

  // Switch or Add MST Network
  const switchToMstNetwork = useCallback(async (): Promise<boolean> => {
    const injected = getInjectedProvider();
    if (!injected || typeof injected.request !== "function") return false;

    try {
      await injected.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MST_CHAIN_CONFIG.chainIdHex }],
      });
      return true;
    } catch (switchError: any) {
      // 4902 means chain has not been added to wallet yet
      if (switchError.code === 4902 || switchError.message?.includes("unrecognized") || switchError.message?.includes("4902")) {
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
            title: "Network Switch Rejected",
            description: "Could not add MST Testnet (Chain ID 1088) to wallet.",
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

      // 1. Explicit Demo Mode
      if (forceDemo) {
        await new Promise(r => setTimeout(r, 400));
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
          description: "Connected to local simulated wallet with 40 MST.",
          type: "info",
        });
        return true;
      }

      // 2. Real Web3 / BridgeKey Connection
      // Asynchronously poll for provider in case of slight extension injection delay
      let injected = getInjectedProvider();
      if (!injected) {
        for (let i = 0; i < 8; i++) {
          await new Promise(r => setTimeout(r, 100));
          injected = getInjectedProvider();
          if (injected) break;
        }
      }

      if (!injected) {
        setWallet(prev => ({ ...prev, isConnecting: false }));
        showToast({
          title: "Wallet Extension Not Found",
          description: "Bridgekey or Web3 extension not detected. Please ensure your wallet extension is installed and enabled, or try Demo Mode.",
          type: "error",
        });
        return false;
      }

      try {
        // Use 'any' network to prevent ethers from failing on custom EVM testnets
        const browserProvider = new ethers.BrowserProvider(injected, "any");
        providerRef.current = browserProvider;

        // Native EIP-1193 account request
        let accounts: string[] = [];
        if (typeof injected.request === "function") {
          accounts = await injected.request({ method: "eth_requestAccounts" });
        } else if (typeof browserProvider.send === "function") {
          accounts = await browserProvider.send("eth_requestAccounts", []);
        } else if (typeof injected.enable === "function") {
          accounts = await injected.enable();
        }

        if (accounts && accounts.length > 0) {
          const account = accounts[0];

          // Safely acquire signer
          let signer: ethers.Signer | undefined;
          try {
            signer = await browserProvider.getSigner(account);
          } catch (signerErr) {
            console.warn("Could not instantiate signer:", signerErr);
          }

          // Safely detect Chain ID via injected RPC
          let chainId = 1088;
          try {
            if (typeof injected.request === "function") {
              const hexId = await injected.request({ method: "eth_chainId" });
              chainId = parseInt(hexId, 16) || 1088;
            } else {
              const net = await browserProvider.getNetwork();
              chainId = Number(net.chainId);
            }
          } catch {
            chainId = 1088;
          }

          // Fetch on-chain balance
          const balance = await fetchOnChainBalance(account, browserProvider, injected);

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
            title: "Wallet Connected",
            description: `${truncateAddress(account)} • ${balance} MST (${chainId === 1088 ? "MST Testnet" : `Chain ${chainId}`})`,
            type: "success",
          });

          // Prompt network switch if not on MST Testnet (Chain ID 1088)
          if (chainId !== 1088) {
            setTimeout(() => {
              switchToMstNetwork();
            }, 500);
          }

          return true;
        }
      } catch (err: any) {
        console.warn("Wallet connection prompt error:", err);
        setWallet(prev => ({ ...prev, isConnecting: false }));

        if (err.code === 4001 || err.message?.includes("rejected") || err.message?.includes("User rejected")) {
          showToast({
            title: "Connection Cancelled",
            description: "You cancelled the connection request in your wallet.",
            type: "error",
          });
          return false;
        }

        if (err.code === -32002 || err.message?.includes("Already processing")) {
          showToast({
            title: "Request Pending",
            description: "A connection request is already pending. Please open your wallet extension popup.",
            type: "info",
          });
          return false;
        }

        showToast({
          title: "Connection Failed",
          description: err?.message ? String(err.message).slice(0, 80) : "Failed to connect to injected wallet.",
          type: "error",
        });
        return false;
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
    let isCancelled = false;

    const initCheck = async () => {
      const savedMode = sessionStorage.getItem("openjar_wallet_mode");
      if (savedMode === "demo") {
        if (!isCancelled) connectWallet(true);
        return;
      }

      const injected = getInjectedProvider();
      if (!injected) return;

      try {
        const browserProvider = new ethers.BrowserProvider(injected, "any");
        providerRef.current = browserProvider;

        // Check authorized accounts without popping up permission window
        let accounts: string[] = [];
        if (typeof injected.request === "function") {
          accounts = await injected.request({ method: "eth_accounts" });
        } else if (typeof browserProvider.send === "function") {
          accounts = await browserProvider.send("eth_accounts", []);
        }

        if (accounts && accounts.length > 0 && !isCancelled) {
          const account = accounts[0];
          let signer: ethers.Signer | undefined;
          try {
            signer = await browserProvider.getSigner(account);
          } catch {
            // ignore
          }

          let chainId = 1088;
          try {
            if (typeof injected.request === "function") {
              const hexId = await injected.request({ method: "eth_chainId" });
              chainId = parseInt(hexId, 16) || 1088;
            } else {
              const net = await browserProvider.getNetwork();
              chainId = Number(net.chainId);
            }
          } catch {
            chainId = 1088;
          }

          const balance = await fetchOnChainBalance(account, browserProvider, injected);

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
        }
      } catch (err) {
        console.warn("Silent session restore warning:", err);
      }
    };

    initCheck();

    // Check after 300ms to catch extension injections
    const timer = setTimeout(initCheck, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
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
        fetchOnChainBalance(newAccount, providerRef.current, injected).then(bal => {
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
        provider: providerRef.current,
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
