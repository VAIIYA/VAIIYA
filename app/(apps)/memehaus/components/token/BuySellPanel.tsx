'use client';

import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ArrowUpDown, Settings } from 'lucide-react';
import { useSwap } from '../../hooks/useSwap';
import { SwapToken } from '../../hooks/useSwap';

interface BuySellPanelProps {
  tokenMint: string;
  tokenSymbol: string;
  tokenName: string;
  tokenDecimals: number;
}

export const BuySellPanel: React.FC<BuySellPanelProps> = ({
  tokenMint,
  tokenSymbol,
  tokenName,
  tokenDecimals,
}) => {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const {
    swapState,
    setFromToken,
    setToToken,
    setFromAmount,
    setSlippage,
    executeSwap,
    canSwap,
    isExecuting,
    formatPrice,
    formatBalance,
    loadUserTokens,
    loadMemeHausTokens,
    userTokens,
    memeHausTokens,
  } = useSwap();

  // Load MemeHaus tokens when component mounts to ensure token is available for swapping
  React.useEffect(() => {
    loadMemeHausTokens();
  }, [loadMemeHausTokens]);

  // Set tokens based on buy/sell
  React.useEffect(() => {
    if (connected) {
      loadUserTokens();
    }
  }, [connected, loadUserTokens]);

  // Setup tokens when tab or token changes
  React.useEffect(() => {
    if (!connected) return;

    const setupTokens = async () => {
      try {
        // Ensure tokens are loaded
        if (userTokens.length === 0) {
          await loadUserTokens();
        }
        
        // Find SOL token from loaded user tokens (has actual balance)
        const solTokenFromUser = userTokens.find(
          t => t.mint === 'So11111111111111111111111111111111111111112'
        );
        
        console.log('SOL token from userTokens:', solTokenFromUser);
        
        // Use actual SOL token if found, otherwise create default
        const SOL_TOKEN: SwapToken = solTokenFromUser || {
          mint: 'So11111111111111111111111111111111111111112',
          symbol: 'SOL',
          name: 'Solana',
          balance: '0',
          price: 0,
          priceChange24h: 0,
          decimals: 9,
        };

        // Find the target token from MemeHaus tokens or user tokens
        const targetTokenFromMemeHaus: SwapToken | undefined = memeHausTokens.find((t: SwapToken) => t.mint === tokenMint);
        const targetTokenFromUser: SwapToken | undefined = userTokens.find((t: SwapToken) => t.mint === tokenMint);
        
        // Use token from MemeHaus list (has price) or user tokens (has balance), or create default
        const userBalance = targetTokenFromUser ? targetTokenFromUser.balance : '0';
        const memeHausPrice = targetTokenFromMemeHaus ? targetTokenFromMemeHaus.price : 0;
        const memeHausPriceChange = targetTokenFromMemeHaus ? targetTokenFromMemeHaus.priceChange24h : 0;
        
        const TOKEN: SwapToken = targetTokenFromMemeHaus || targetTokenFromUser || {
          mint: tokenMint,
          symbol: tokenSymbol,
          name: tokenName,
          balance: userBalance,
          price: memeHausPrice,
          priceChange24h: memeHausPriceChange,
          decimals: tokenDecimals,
        };
        
        console.log('Setting up tokens - SOL balance:', SOL_TOKEN.balance, 'Token:', TOKEN.symbol);
        
        if (activeTab === 'buy') {
          // Buying: SOL -> Token
          setFromToken(SOL_TOKEN);
          setToToken(TOKEN);
        } else {
          // Selling: Token -> SOL
          setFromToken(TOKEN);
          setToToken(SOL_TOKEN);
        }
      } catch (error) {
        console.error('Error setting up tokens:', error);
      }
    };

    setupTokens();
  }, [activeTab, tokenMint, tokenSymbol, tokenName, tokenDecimals, connected, setFromToken, setToToken, loadUserTokens, userTokens, memeHausTokens]);

  // Update SOL balance when userTokens updates (in case balance loads after initial setup)
  React.useEffect(() => {
    if (!connected || activeTab !== 'buy') return;
    
    const solTokenFromUser = userTokens.find(
      t => t.mint === 'So11111111111111111111111111111111111111112'
    );
    
    if (solTokenFromUser && swapState.fromToken?.mint === 'So11111111111111111111111111111111111111112') {
      // Update the fromToken (SOL) with the actual balance
      if (swapState.fromToken.balance !== solTokenFromUser.balance) {
        console.log('Updating SOL balance from', swapState.fromToken.balance, 'to', solTokenFromUser.balance);
        setFromToken(solTokenFromUser);
      }
    }
  }, [userTokens, connected, activeTab, swapState.fromToken, setFromToken]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setFromAmount(value);
  };

  const handleSwap = async () => {
    if (!canSwap) return;
    const result = await executeSwap();
    if (result.success) {
      setAmount('');
      // Show success message
    }
  };

  const slippage = swapState.slippageBps / 100;

  if (!connected) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 text-center">
        <p className="text-gray-400 mb-4">Connect your wallet to buy or sell</p>
        <WalletMultiButton className="px-6 py-3 bg-gradient-to-r from-neon-pink to-neon-purple rounded-lg font-semibold hover:shadow-glow-pink transition-all duration-300 flex items-center justify-center mx-auto text-white border-none" />
      </div>
    );
  }

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('buy')}
            className={`px-4 py-2 rounded-md font-semibold transition-all ${
              activeTab === 'buy'
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`px-4 py-2 rounded-md font-semibold transition-all ${
              activeTab === 'sell'
                ? 'bg-red-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sell
          </button>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <label className="block text-sm text-gray-400 mb-2">Slippage Tolerance</label>
          <div className="flex space-x-2">
            {[0.1, 0.5, 1.0].map((value) => (
              <button
                key={value}
                onClick={() => setSlippage(value * 100)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                  slippage === value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {value}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* From Token */}
      <div className="bg-gray-800/30 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">From</span>
          {swapState.fromToken && (
            <span className="text-sm text-gray-400">
              Balance: {formatBalance(parseFloat(swapState.fromToken.balance), swapState.fromToken.decimals)}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-neon-pink to-neon-purple rounded-full flex items-center justify-center font-bold">
            {swapState.fromToken?.symbol?.[0] || '?'}
          </div>
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="flex-1 bg-transparent text-2xl font-bold outline-none"
            min="0"
            step="any"
          />
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <div>
                <div className="font-semibold">{swapState.fromToken?.symbol || 'Select'}</div>
                <div className="text-sm text-gray-400">
                  ${swapState.fromToken ? formatPrice(swapState.fromToken.price, swapState.fromToken.decimals) : '0.00'}
                </div>
              </div>
              {swapState.fromToken && parseFloat(swapState.fromToken.balance) > 0 && (
                <button
                  onClick={() => {
                    const maxBalance = parseFloat(swapState.fromToken!.balance);
                    handleAmountChange(maxBalance.toString());
                  }}
                  className="px-2 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                  title="Use maximum balance"
                >
                  MAX
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Swap Arrow */}
      <div className="flex justify-center mb-4">
        <div className="p-2 bg-gray-800/50 rounded-full">
          <ArrowUpDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* To Token */}
      <div className="bg-gray-800/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">To</span>
          {swapState.toToken && (
            <span className="text-sm text-gray-400">
              Balance: {formatBalance(parseFloat(swapState.toToken.balance), swapState.toToken.decimals)}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-neon-pink to-neon-purple rounded-full flex items-center justify-center font-bold">
            {swapState.toToken?.symbol?.[0] || '?'}
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold">
              {swapState.toAmount ? formatBalance(parseFloat(swapState.toAmount), swapState.toToken?.decimals || 9) : '0.0'}
            </div>
            <div className="text-sm text-gray-400">
              ${swapState.toToken ? formatPrice(swapState.toToken.price, swapState.toToken.decimals) : '0.00'}
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{swapState.toToken?.symbol || 'Select'}</div>
          </div>
        </div>
      </div>

      {/* Exchange Rate */}
      {swapState.exchangeRate > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-3 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Exchange Rate</span>
            <span className="font-semibold">
              1 {swapState.fromToken?.symbol} = {swapState.exchangeRate.toFixed(6)} {swapState.toToken?.symbol}
            </span>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={!canSwap || isExecuting}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          canSwap && !isExecuting
            ? activeTab === 'buy'
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:shadow-green-500/50'
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/50'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isExecuting
          ? 'Processing...'
          : !canSwap
          ? 'Enter an amount'
          : activeTab === 'buy'
          ? `Buy ${tokenSymbol}`
          : `Sell ${tokenSymbol}`}
      </button>
    </div>
  );
};

