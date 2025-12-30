'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet } from 'lucide-react';
import { useWalletConnection } from '../hooks/useWalletConnection';

export const WalletConnectButton: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { balance, loading, formatAddress, formatBalance } = useWalletConnection();

  if (connected && publicKey) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-sm text-gray-300 font-inter">
            {formatAddress(publicKey.toString())}
          </div>
          {balance !== null && (
            <div className="text-xs text-neon-cyan font-mono">
              {loading ? 'Loading...' : `${formatBalance(balance)} SOL`}
            </div>
          )}
        </div>
        <WalletMultiButton className="px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-cyan rounded-full font-inter font-semibold hover:shadow-glow-blue transition-all duration-300 flex items-center space-x-2 text-white border-none text-sm" />
      </div>
    );
  }

  return (
    <WalletMultiButton className="px-6 py-2 bg-gradient-to-r from-neon-pink to-neon-purple rounded-full font-inter font-semibold hover:shadow-glow-pink transition-all duration-300 flex items-center space-x-2 text-white border-none">
      <Wallet className="w-4 h-4" />
      <span>Connect Wallet</span>
    </WalletMultiButton>
  );
}; 