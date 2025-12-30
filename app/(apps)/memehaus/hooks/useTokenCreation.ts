'use client';

import { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { TokenService, TokenCreationParams, TokenCreationResult } from '../services/tokenService';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { getBestRPCEndpoint, testCurrentConnection } from '../lib/rpcTest';

export const useTokenCreation = () => {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [isCreating, setIsCreating] = useState(false);
  const [creationResult, setCreationResult] = useState<TokenCreationResult | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  const estimateCost = useCallback(async () => {
    if (!connected) return;
    
    try {
      const tokenService = new TokenService(connection.rpcEndpoint);
      const cost = await tokenService.estimateCreationCost();
      setEstimatedCost(cost);
    } catch (error) {
      console.error('Error estimating cost:', error);
      setEstimatedCost(0.01); // Conservative fallback for mainnet
    }
  }, [connected, connection.rpcEndpoint]);

  const createToken = useCallback(async (params: TokenCreationParams): Promise<TokenCreationResult> => {
    if (!connected || !publicKey || !signTransaction) {
      return {
        success: false,
        error: 'Wallet not connected or cannot sign transactions',
      };
    }

    setIsCreating(true);
    setCreationResult(null);

    try {
      // Always try to get the best RPC endpoint first to avoid connection issues
      console.log('Finding best RPC endpoint for token creation...');
      try {
        const bestEndpoint = await getBestRPCEndpoint();
        console.log(`Using best RPC endpoint: ${bestEndpoint}`);
        
        const tokenService = new TokenService(bestEndpoint);
        const result = await tokenService.createToken(
          params,
          { publicKey, signTransaction },
        );

        // Check if component is still mounted before updating state
        if (typeof window !== 'undefined') {
          setCreationResult(result);
        }

        // Automatically trigger fee distribution after successful token creation
        if (result.success && result.mintAddress) {
          try {
            console.log('🔄 Triggering automatic fee distribution...');
            const apiUrl = typeof window !== 'undefined' 
              ? `${window.location.origin}/api/fees/distribute`
              : '/api/fees/distribute';
            
            const distributionResponse = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                tokenMint: result.mintAddress,
                excludeWallet: publicKey.toBase58(),
              }),
            });

            const distributionResult = await distributionResponse.json();
            
            if (distributionResult.success) {
              console.log('✅ Fee distribution triggered successfully:', distributionResult);
            } else {
              console.warn('⚠️ Fee distribution failed (non-critical):', distributionResult.error);
              // Don't fail token creation if distribution fails - fees can be distributed later
            }
          } catch (distributionError) {
            console.error('❌ Error triggering fee distribution (non-critical):', distributionError);
            // Don't fail token creation if distribution fails - fees can be distributed later
          }
        }

        return result;
      } catch (error) {
        console.error('Failed with best endpoint, trying current connection:', error);
        
        // Fallback to current connection
        const tokenService = new TokenService(connection.rpcEndpoint);
        
        try {
          const result = await tokenService.createToken(
            params,
            { publicKey, signTransaction },
          );

          // Check if component is still mounted before updating state
          if (typeof window !== 'undefined') {
            setCreationResult(result);
          }

          // Automatically trigger fee distribution after successful token creation
          if (result.success && result.mintAddress) {
            try {
              console.log('🔄 Triggering automatic fee distribution...');
              const apiUrl = typeof window !== 'undefined' 
                ? `${window.location.origin}/api/fees/distribute`
                : '/api/fees/distribute';
              
              const distributionResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  tokenMint: result.mintAddress,
                  excludeWallet: publicKey.toBase58(),
                }),
              });

              const distributionResult = await distributionResponse.json();
              
              if (distributionResult.success) {
                console.log('✅ Fee distribution triggered successfully:', distributionResult);
              } else {
                console.warn('⚠️ Fee distribution failed (non-critical):', distributionResult.error);
                // Don't fail token creation if distribution fails - fees can be distributed later
              }
            } catch (distributionError) {
              console.error('❌ Error triggering fee distribution (non-critical):', distributionError);
              // Don't fail token creation if distribution fails - fees can be distributed later
            }
          }

          return result;
        } catch (fallbackError) {
          console.error('Failed with current endpoint:', fallbackError);
          const errorResult: TokenCreationResult = {
            success: false,
            error: fallbackError instanceof Error ? fallbackError.message : 'Failed to create token. Please try again later.',
          };
          // Check if component is still mounted before updating state
          if (typeof window !== 'undefined') {
            setCreationResult(errorResult);
          }
          return errorResult;
        }
      }

    } catch (error) {
      const errorResult: TokenCreationResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
      
      // Check if component is still mounted before updating state
      if (typeof window !== 'undefined') {
        setCreationResult(errorResult);
      }
      return errorResult;
    } finally {
      // Check if component is still mounted before updating state
      if (typeof window !== 'undefined') {
        setIsCreating(false);
      }
    }
  }, [connected, publicKey, signTransaction, connection.rpcEndpoint]);

  const resetCreation = useCallback(() => {
    setCreationResult(null);
    setEstimatedCost(0);
  }, []);

  return {
    isCreating,
    creationResult,
    estimatedCost,
    createToken,
    estimateCost,
    resetCreation,
    canCreate: connected && !!publicKey && !!signTransaction,
  };
}; 