'use client';

import React, { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { getEnvConfig } from '@/app/lib/core-env';

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
    const config = getEnvConfig();
    if (network === WalletAdapterNetwork.Mainnet) {
      // 1. Priority: Full Helius URL with API key from environment
      if (config.heliusRpcUrlApi) {
        return config.heliusRpcUrlApi;
      }

      // 2. Secondary: If solanaRpcUrl already contains an api-key query param
      if (config.solanaRpcUrl && config.solanaRpcUrl.includes('api-key=')) {
        return config.solanaRpcUrl;
      }

      // 3. Tertiary: Construct URL using base and key
      const heliusKey = config.heliusApiKey;
      if (heliusKey) {
        return `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`;
      }

      // 4. Final: Basic RPC URL
      return config.solanaRpcUrl;
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
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}; 