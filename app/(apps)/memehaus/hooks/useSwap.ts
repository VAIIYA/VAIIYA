'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { TokenBalanceService, TokenAccount } from '../services/tokenBalanceService';
import { PriceService, SwapQuote } from '../services/priceService';
import { SwapService, SwapParams, SwapResult } from '../services/swapService';
import { TokenFromAPI, TokenResponse } from '../types/token';
// MemeHaus token service removed - using GitHub storage directly

export interface SwapToken {
  mint: string;
  symbol: string;
  name: string;
  balance: string;
  price: number;
  priceChange24h: number;
  decimals: number;
  logoURI?: string;
}

export interface SwapState {
  fromToken: SwapToken | null;
  toToken: SwapToken | null;
  fromAmount: string;
  toAmount: string;
  slippageBps: number;
  quote: SwapQuote | null;
  priceImpact: number;
  exchangeRate: number;
  loading: boolean;
  error: string | null;
}

export const useSwap = () => {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [swapState, setSwapState] = useState<SwapState>({
    fromToken: null,
    toToken: null,
    fromAmount: '',
    toAmount: '',
    slippageBps: 50, // 0.5%
    quote: null,
    priceImpact: 0,
    exchangeRate: 0,
    loading: false,
    error: null
  });

  const [userTokens, setUserTokens] = useState<SwapToken[]>([]);
  const [memeHausTokens, setMemeHausTokens] = useState<SwapToken[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Initialize services with useMemo to prevent recreation on every render
  const tokenBalanceService = useMemo(() => new TokenBalanceService(connection.rpcEndpoint), [connection.rpcEndpoint]);
  const priceService = useMemo(() => new PriceService(), []);
  const swapService = useMemo(() => new SwapService(connection.rpcEndpoint), [connection.rpcEndpoint]);

  /**
   * Shared helper function to format tokens with prices
   * Extracted to reduce duplication between loadMemeHausTokens and loadUserTokens
   */
  const formatTokensWithPrices = useCallback(async (
    tokens: Array<{
      mint: string;
      symbol: string;
      name: string;
      balance: string;
      decimals: number;
      logoURI?: string;
    }>
  ): Promise<SwapToken[]> => {
    if (tokens.length === 0) return [];

    // Get prices for all tokens
    const mintAddresses = tokens.map(t => t.mint);
    const prices = await priceService.getMultipleTokenPrices(mintAddresses);
    
    // Log if price fetching failed
    if (prices.size === 0 && mintAddresses.length > 0) {
      console.warn('Price service returned no prices. This may be due to Jupiter API being unavailable.');
    }

    // Build token list with prices
    return tokens.map(token => {
      const price = prices.get(token.mint);
      return {
        mint: token.mint,
        symbol: token.symbol,
        name: token.name,
        balance: token.balance,
        price: price?.price || 0,
        priceChange24h: price?.priceChange24h || 0,
        decimals: token.decimals,
        logoURI: token.logoURI,
      };
    });
  }, [priceService]);

  // Load MemeHaus tokens from API
  const loadMemeHausTokens = useCallback(async () => {
    try {
      console.log('Loading MemeHaus tokens from API...');
      const response = await fetch('/api/tokens?page=0&limit=100', {
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data: TokenResponse = await response.json();
      
      if (!data.success || !data.tokens || data.tokens.length === 0) {
        console.log('No MemeHaus tokens found in API. This is normal if no tokens have been created yet.');
        setMemeHausTokens([]);
        return;
      }
      
      // Convert to base token format (without prices)
      const baseTokens = data.tokens.map((token: TokenFromAPI) => ({
        mint: token.mint_address || token.mintAddress,
        symbol: token.symbol,
        name: token.name,
        balance: '0', // Default balance
        decimals: token.decimals || 9,
        logoURI: token.image_url || token.imageUrl,
      }));
      
      // Fetch prices and format tokens using shared helper
      const tokensWithPrices = await formatTokensWithPrices(baseTokens);
      
      console.log('MemeHaus tokens loaded:', tokensWithPrices.length);
      setMemeHausTokens(tokensWithPrices);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading MemeHaus tokens:', errorMessage);
      
      // Don't show error to user - just log it and continue with empty list
      // This allows the swap interface to still work for swapping other tokens
      setMemeHausTokens([]);
    }
  }, [formatTokensWithPrices]);

  // Load user's tokens (for manual refresh)
  const loadUserTokens = useCallback(async () => {
    if (!connected || !publicKey) {
      setUserTokens([]);
      return;
    }

    try {
      setSwapState(prev => ({ ...prev, loading: true, error: null }));

      console.log('Loading tokens for wallet:', publicKey.toString());
      
      // Get SOL balance
      const solBalance = await tokenBalanceService.getSOLBalance(publicKey.toString());
      console.log('SOL balance fetched:', solBalance);
      
      // Get token accounts
      const tokenAccounts = await tokenBalanceService.getTokenAccounts(publicKey.toString());
      console.log('Token accounts fetched:', tokenAccounts);

      // Build base token list (without prices)
      const baseTokens = [
        {
          mint: 'So11111111111111111111111111111111111111112', // SOL (correct mint address)
          symbol: 'SOL',
          name: 'Solana',
          balance: solBalance,
          decimals: 9,
        },
        ...tokenAccounts.map(account => ({
          mint: account.mint,
          symbol: account.symbol || 'Unknown',
          name: account.name || 'Unknown Token',
          balance: account.balance,
          decimals: account.decimals,
        })),
      ];

      // Fetch prices and format tokens using shared helper
      const tokens = await formatTokensWithPrices(baseTokens);
      
      // Filter out tokens with no price (optional - keep all tokens for now)
      // const tokensWithPrices = tokens.filter(t => t.price > 0 || t.mint === 'So11111111111111111111111111111111111111112');

      setUserTokens(tokens);
      console.log('All tokens set:', tokens.length, 'tokens');

      // Set default tokens if none selected
      setSwapState(prev => {
        if (!prev.fromToken && tokens.length > 0) {
          const newState = { 
            ...prev, 
            fromToken: tokens[0],
            toToken: tokens.length > 1 ? tokens[1] : null
          };
          console.log('Setting default tokens:', newState);
          return newState;
        }
        return prev;
      });

    } catch (error) {
      console.error('Error loading user tokens:', error);
      setSwapState(prev => ({ ...prev, error: 'Failed to load tokens' }));
    } finally {
      setSwapState(prev => ({ ...prev, loading: false }));
    }
  }, [connected, publicKey, tokenBalanceService, formatTokensWithPrices]);

  // Load tokens when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      console.log('Wallet connected, loading tokens...');
      loadUserTokens();
    } else {
      console.log('Wallet not connected, clearing tokens');
      setUserTokens([]);
      setSwapState(prev => ({
        ...prev,
        fromToken: null,
        toToken: null,
        fromAmount: '',
        toAmount: '',
        quote: null,
        priceImpact: 0,
        exchangeRate: 0,
        error: null
      }));
    }
  }, [connected, publicKey, loadUserTokens]);

  // Update quote when input changes
  const updateQuote = useCallback(async () => {
    if (!swapState.fromToken || !swapState.toToken || !swapState.fromAmount || parseFloat(swapState.fromAmount) <= 0) {
      setSwapState(prev => ({ 
        ...prev, 
        quote: null, 
        toAmount: '', 
        priceImpact: 0, 
        exchangeRate: 0 
      }));
      return;
    }

    try {
      setSwapState(prev => ({ ...prev, loading: true, error: null }));

      // Convert amount to proper decimals
      const inputAmount = (parseFloat(swapState.fromAmount) * Math.pow(10, swapState.fromToken.decimals)).toString();

      const quote = await swapService.getSwapPreview({
        inputMint: swapState.fromToken.mint,
        outputMint: swapState.toToken.mint,
        inputAmount,
        slippageBps: swapState.slippageBps,
        userPublicKey: publicKey?.toString() || ''
      });

      if (quote) {
        const toAmount = parseFloat(quote.outputAmount) / Math.pow(10, swapState.toToken.decimals);
        const priceImpact = swapService.calculatePriceImpact(quote);
        const exchangeRate = parseFloat(quote.outputAmount) / parseFloat(quote.inputAmount);

        setSwapState(prev => ({
          ...prev,
          quote,
          toAmount: toAmount.toString(),
          priceImpact,
          exchangeRate
        }));
      } else {
        setSwapState(prev => ({
          ...prev,
          quote: null,
          toAmount: '',
          priceImpact: 0,
          exchangeRate: 0
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating quote:', errorMessage);
      
      // Provide more specific error messages
      let userFriendlyError = 'Failed to get swap quote';
      if (errorMessage.includes('ERR_NAME_NOT_RESOLVED') || errorMessage.includes('Failed to fetch')) {
        userFriendlyError = 'Unable to reach swap service. Please check your internet connection or try again later.';
      } else if (errorMessage.includes('timeout')) {
        userFriendlyError = 'Swap quote request timed out. Please try again.';
      }
      
      setSwapState(prev => ({ 
        ...prev, 
        error: userFriendlyError,
        quote: null,
        toAmount: '',
        priceImpact: 0,
        exchangeRate: 0
      }));
    } finally {
      setSwapState(prev => ({ ...prev, loading: false }));
    }
  }, [swapState.fromToken, swapState.toToken, swapState.fromAmount, swapState.slippageBps, swapService, publicKey]);

  // Execute swap
  const executeSwap = useCallback(async (): Promise<SwapResult> => {
    if (!connected || !publicKey || !signTransaction || !swapState.quote) {
      return {
        success: false,
        error: 'Wallet not connected or no quote available'
      };
    }

    setIsExecuting(true);

    try {
      const inputAmount = (parseFloat(swapState.fromAmount) * Math.pow(10, swapState.fromToken!.decimals)).toString();

      const result = await swapService.executeSwap({
        inputMint: swapState.fromToken!.mint,
        outputMint: swapState.toToken!.mint,
        inputAmount,
        slippageBps: swapState.slippageBps,
        userPublicKey: publicKey.toString()
      }, signTransaction);

      if (result.success) {
        // Reload tokens after successful swap
        await loadUserTokens();
        
        // Reset amounts
        setSwapState(prev => ({
          ...prev,
          fromAmount: '',
          toAmount: '',
          quote: null,
          priceImpact: 0,
          exchangeRate: 0
        }));
      }

      return result;
    } catch (error) {
      console.error('Error executing swap:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      setIsExecuting(false);
    }
  }, [connected, publicKey, signTransaction, swapState, swapService, loadUserTokens]);

  // Set from token
  const setFromToken = useCallback((token: SwapToken) => {
    setSwapState(prev => ({ 
      ...prev, 
      fromToken: token,
      fromAmount: '',
      toAmount: '',
      quote: null,
      priceImpact: 0,
      exchangeRate: 0
    }));
  }, []);

  // Set to token
  const setToToken = useCallback((token: SwapToken) => {
    setSwapState(prev => ({ 
      ...prev, 
      toToken: token,
      toAmount: '',
      quote: null,
      priceImpact: 0,
      exchangeRate: 0
    }));
  }, []);

  // Set from amount
  const setFromAmount = useCallback((amount: string) => {
    setSwapState(prev => ({ ...prev, fromAmount: amount }));
  }, []);

  // Set slippage
  const setSlippage = useCallback((slippageBps: number) => {
    setSwapState(prev => ({ ...prev, slippageBps }));
  }, []);

  // Swap tokens
  const swapTokens = useCallback(() => {
    setSwapState(prev => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: '',
      toAmount: '',
      quote: null,
      priceImpact: 0,
      exchangeRate: 0
    }));
  }, []);

  // Load MemeHaus tokens on mount
  useEffect(() => {
    loadMemeHausTokens();
  }, [loadMemeHausTokens]);

  // Update quote when dependencies change
  useEffect(() => {
    updateQuote();
  }, [updateQuote]);

  return {
    // State
    swapState,
    userTokens,
    memeHausTokens,
    isExecuting,
    
    // Actions
    setFromToken,
    setToToken,
    setFromAmount,
    setSlippage,
    swapTokens,
    executeSwap,
    loadUserTokens,
    loadMemeHausTokens,
    
    // Computed values
    canSwap: connected && 
             !!swapState.fromToken && 
             !!swapState.toToken && 
             !!swapState.fromAmount && 
             parseFloat(swapState.fromAmount) > 0 &&
             !!swapState.quote,
    
    // Utilities
    formatPrice: priceService.formatPrice,
    formatBalance: priceService.formatBalance,
    formatSlippage: swapService.formatSlippage
  };
};
