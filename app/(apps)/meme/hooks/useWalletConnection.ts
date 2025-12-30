'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';

export const useWalletConnection = () => {
  const { connected, publicKey, disconnect } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getBalance = async () => {
      if (connected && publicKey) {
        try {
          setLoading(true);
          const balance = await connection.getBalance(publicKey);
          setBalance(balance / 1e9); // Convert lamports to SOL
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance(null);
        } finally {
          setLoading(false);
        }
      } else {
        setBalance(null);
      }
    };

    getBalance();
  }, [connected, publicKey, connection]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatBalance = (sol: number) => {
    return sol.toFixed(4);
  };

  return {
    connected,
    publicKey,
    balance,
    loading,
    disconnect,
    formatAddress,
    formatBalance,
  };
}; 