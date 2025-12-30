'use client';

import React from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export const NetworkIndicator: React.FC = () => {
  const { connection } = useConnection();
  
  // Extract network from endpoint
  const getNetworkName = () => {
    const endpoint = connection.rpcEndpoint;
    if (endpoint.includes('devnet')) return 'Devnet';
    if (endpoint.includes('testnet')) return 'Testnet';
    if (endpoint.includes('mainnet')) return 'Mainnet';
    return 'Mainnet';
  };

  const getNetworkColor = () => {
    const network = getNetworkName();
    switch (network) {
      case 'Devnet':
        return 'text-neon-cyan';
      case 'Testnet':
        return 'text-neon-pink';
      case 'Mainnet':
        return 'text-neon-green';
      default:
        return 'text-neon-green';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`text-xs font-mono ${getNetworkColor()}`}>
        {getNetworkName()}
      </div>
      <div className={`w-2 h-2 rounded-full ${getNetworkColor().replace('text-', 'bg-')}`}></div>
    </div>
  );
}; 