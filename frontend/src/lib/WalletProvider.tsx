'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
} from "@creit.tech/stellar-wallets-kit";
import * as StellarSdk from "@stellar/stellar-sdk";

interface WalletContextType {
  kit: StellarWalletsKit | null;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (transactionXdr: string) => Promise<string>;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [kit, setKit] = useState<StellarWalletsKit | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize the kit on mount (client-side only)
    const initializeKit = () => {
      const newKit = new StellarWalletsKit({
        network: WalletNetwork.TESTNET,
        selectedWalletId: FREIGHTER_ID,
        modules: allowAllModules(),
      });
      setKit(newKit);
      setMounted(true);

      // Check if wallet was previously connected
      const savedWalletId = localStorage.getItem('synergi_wallet_id');
      if (savedWalletId) {
        newKit.setWallet(savedWalletId);
        newKit.getAddress().then(({ address }) => {
          setAddress(address);
        }).catch(() => {
          // Wallet not available, clear saved selection
          localStorage.removeItem('synergi_wallet_id');
        });
      }
    };

    initializeKit();
  }, []);

  const connect = useCallback(async () => {
    if (!kit) return;

    try {
      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
          localStorage.setItem('synergi_wallet_id', option.id);
          
          const { address } = await kit.getAddress();
          setAddress(address);
        },
      });
    } catch (error) {
      console.error("Connection failed:", error);
    }
  }, [kit]);

  const disconnect = useCallback(() => {
    setAddress(null);
    localStorage.removeItem('synergi_wallet_id');
    if (kit) {
      // Reset to default wallet
      kit.setWallet(FREIGHTER_ID);
    }
  }, [kit]);

  const signTransaction = useCallback(async (transactionXdr: string): Promise<string> => {
    if (!kit || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      const { signedTxXdr } = await kit.signTransaction(transactionXdr, {
        address,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      });
      return signedTxXdr;
    } catch (error) {
      console.error("Transaction signing failed:", error);
      throw error;
    }
  }, [kit, address]);

  return (
    <WalletContext.Provider value={{ 
      kit, 
      address, 
      connect, 
      disconnect,
      signTransaction,
      isConnected: !!address 
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
};
