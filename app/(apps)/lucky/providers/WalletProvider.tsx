'use client';

import React, { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css');

interface Props {
  children: ReactNode;
}

export const WalletContextProvider: FC<Props> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Mainnet;

  // Use a reliable RPC endpoint for mainnet operations
  const endpoint = useMemo(() => {
    if (network === WalletAdapterNetwork.Mainnet) {
      // Use reliable RPC endpoints with multiple fallbacks for maximum reliability
      const reliableEndpoints = [
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
        'https://mainnet.helius-rpc.com/?api-key=aa28c427-247b-4b24-a813-fffc8e07219c', // Your Helius RPC (primary - most reliable)
        'https://lb.drpc.live/solana/Apd_88bM5k7qmsQ65YOV768FnI8wo2AR8IFjwg8TMB_n', // Your DRPC RPC (backup - high performance)
        'https://api.mainnet-beta.solana.com', // Official Solana RPC (free fallback)
        'https://solana-mainnet.g.alchemy.com/v2/demo', // Alchemy demo (free fallback)
        'https://rpc.ankr.com/solana' // Ankr (last resort)
      ];
      
      // Return the first available endpoint, default to Helius RPC
      const selectedEndpoint = reliableEndpoints.find(url => url) || 'https://mainnet.helius-rpc.com/?api-key=aa28c427-247b-4b24-a813-fffc8e07219c';
      
      // Log which endpoint is being used for debugging
      if (selectedEndpoint.includes('helius')) {
        console.log('🔗 Using Helius RPC (primary):', selectedEndpoint);
      } else if (selectedEndpoint.includes('drpc')) {
        console.log('🔗 Using DRPC RPC (backup):', selectedEndpoint);
      } else {
        console.log('🔗 Using fallback RPC:', selectedEndpoint);
      }
      
      return selectedEndpoint;
    }
    return clusterApiUrl(network);
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}; 