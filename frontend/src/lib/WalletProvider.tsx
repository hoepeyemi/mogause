'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  StellarWalletsKit,
  Networks,
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
export type { WalletContextType };
const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [kit, setKit] = useState<StellarWalletsKit | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize the kit on mount (client-side only)
    const initializeKit = async () => {
      // Set network first (static method)
      StellarWalletsKit.setNetwork(Networks.TESTNET);
      
      // Create new kit instance
      const newKit = new StellarWalletsKit();
      setKit(newKit);
      setMounted(true);

      // Check if wallet was previously connected
      const savedWalletId = localStorage.getItem('synergi_wallet_id');
      if (savedWalletId) {
        try {
          // Set the wallet using static method
          await StellarWalletsKit.setWallet(savedWalletId);
          const addr = await StellarWalletsKit.getAddress();
          if (addr && addr.address) {
            setAddress(addr.address);
          }
        } catch {
          // Wallet not available, clear saved selection
          localStorage.removeItem('synergi_wallet_id');
        }
      }
    };

    initializeKit();
  }, []);

  const connect = useCallback(async () => {
    if (!kit) return;

    try {
      // Since static methods are failing, we use the instance 'kit'
      // and a fallback to 'freighter' if the SDK doesn't provide a list
      const walletId = 'freighter';
      
      await StellarWalletsKit.setWallet(walletId);
      localStorage.setItem('synergi_wallet_id', walletId);
      
      const addr = await StellarWalletsKit.getAddress();
      if (addr && typeof addr === 'object' && 'address' in addr) {
        setAddress((addr as any).address);
      } else if (typeof addr === 'string') {
        setAddress(addr);
      }
    } catch (error) {
      console.error("Connection failed:", error);
    }
  }, [kit]);

  const disconnect = useCallback(() => {
    setAddress(null);
    localStorage.removeItem('synergi_wallet_id');
    // Reset to default wallet
    StellarWalletsKit.setWallet('freighter');
  }, []);

  const signTransaction = useCallback(async (transactionXdr: string): Promise<string> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await StellarWalletsKit.signTransaction(transactionXdr, {
        address,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      });
      
      // Handle both string and object return types
      if (typeof result === 'string') {
        return result;
      }
      // If result is an object, extract the signedTxXdr property
      if (result && typeof result === 'object' && 'signedTxXdr' in result) {
        return (result as { signedTxXdr: string }).signedTxXdr;
      }
      // Fallback: return empty string if no valid result
      return '';
    } catch (error) {
      console.error("Transaction signing failed:", error);
      throw error;
    }
  }, [address]);

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
