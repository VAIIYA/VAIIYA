'use client';

import React, { useState, useMemo, useCallback } from 'react';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpDown,
  Settings,
  Info,
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  DollarSign,
  Percent,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  X,
  Search,
  Star,
  Filter
} from 'lucide-react';
import { NetworkIndicator } from '@/app/components/shared/NetworkIndicator';
import { WalletConnectButton } from '@/app/components/shared/WalletConnectButton';
import { useSwap, SwapToken } from '../hooks/useSwap';
import { useDca } from '../hooks/useDca';
import { useWallet } from '@solana/wallet-adapter-react';

export default function SwapPage() {
  const [activeTab, setActiveTab] = useState<'swap' | 'recurring'>('swap');

  // Token selection modal state
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenModalType, setTokenModalType] = useState<'from' | 'to'>('from');
  const [searchQuery, setSearchQuery] = useState('');
  const { connected, publicKey } = useWallet();
  const {
    swapState,
    userTokens,
    memeHausTokens,
    isExecuting: isSwapExecuting,
    setFromToken: setSwapFromToken,
    setToToken: setSwapToToken,
    setFromAmount: setSwapFromAmount,
    setSlippage: setSwapSlippage,
    swapTokens: switchSwapTokens,
    executeSwap,
    loadUserTokens,
    loadMemeHausTokens,
    canSwap,
    formatPrice,
    formatBalance
  } = useSwap();

  const {
    dcaState,
    setDcaState,
    createOrder: dcaCreateOrder,
    cancelOrder: dcaCancelOrder
  } = useDca();

  // Unified token setters
  const setFromToken = (token: SwapToken) => {
    if (activeTab === 'swap') {
      setSwapFromToken(token);
    } else {
      setDcaState(prev => ({ ...prev, fromToken: token }));
    }
  };

  const setToToken = (token: SwapToken) => {
    if (activeTab === 'swap') {
      setSwapToToken(token);
    } else {
      setDcaState(prev => ({ ...prev, toToken: token }));
    }
  };

  const fromToken = activeTab === 'swap' ? swapState.fromToken : dcaState.fromToken;
  const toToken = activeTab === 'swap' ? swapState.toToken : dcaState.toToken;

  const [showSettings, setShowSettings] = useState(false);
  const [swapResult, setSwapResult] = useState<{ success: boolean; signature?: string; error?: string } | null>(null);

  const handleSwapTokens = () => {
    if (activeTab === 'swap') {
      switchSwapTokens();
    } else {
      setDcaState(prev => ({
        ...prev,
        fromToken: prev.toToken,
        toToken: prev.fromToken
      }));
    }
  };

  const handleFromAmountChange = (value: string) => {
    if (activeTab === 'swap') {
      setSwapFromAmount(value);
    } else {
      setDcaState(prev => ({ ...prev, totalAmount: value }));
    }
  };

  const handleSwap = async () => {
    if (!canSwap) return;

    const result = await executeSwap();
    setSwapResult({
      success: result.success,
      signature: result.transactionSignature,
      error: result.error
    });
  };

  const openTokenModal = (type: 'from' | 'to') => {
    setTokenModalType(type);
    setShowTokenModal(true);
    setSearchQuery('');
    // Reload MemeHaus tokens when opening modal
    if (type === 'to') {
      loadMemeHausTokens();
    }
  };

  const selectToken = (token: SwapToken) => {
    if (tokenModalType === 'from') {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    setShowTokenModal(false);
  };

  // Filter tokens based on modal type and search query
  const filteredTokens = useMemo(() => {
    if (tokenModalType === 'from') {
      // For "from" token, show user's tokens (SOL + tokens they own)
      let tokens = [...userTokens];

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        tokens = tokens.filter(token =>
          token.symbol.toLowerCase().includes(query) ||
          token.name.toLowerCase().includes(query) ||
          token.mint.toLowerCase().includes(query)
        );
      }

      return tokens;
    } else {
      // For "to" token, ONLY show MemeHaus tokens
      let tokens = [...memeHausTokens];

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        tokens = tokens.filter(token =>
          token.symbol.toLowerCase().includes(query) ||
          token.name.toLowerCase().includes(query) ||
          token.mint.toLowerCase().includes(query)
        );
      }

      return tokens;
    }
  }, [tokenModalType, searchQuery, userTokens, memeHausTokens]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Check if user is not connected and show connect wallet screen
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-2xl">U</span>
            </div>
            <h1 className="text-3xl font-bold">Connect Your Wallet</h1>
            <p className="text-gray-400 max-w-md">
              You need to connect your wallet to swap tokens. Connect your Solana wallet to get started.
            </p>
            <WalletConnectButton />
            <Link href="/" className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-4 py-6 md:px-8">
          <nav className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <Link href="/" className="flex items-center space-x-2 md:space-x-3">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-neon-cyan" />
                <h1 className="text-lg md:text-2xl font-orbitron font-bold bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent">
                  VAIIYA
                </h1>
              </Link>
              <div className="hidden sm:block">
                <NetworkIndicator />
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
                Home
              </Link>
              <Link href="/memehaus/swap" className="text-white font-inter font-medium">
                Swap
              </Link>
              <Link href="/memehaus/create" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
                Create
              </Link>
              <Link href="/memehaus/liquidity" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
                Liquidity
              </Link>
              <Link href="/memehaus/autostake" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
                Auto-Stake
              </Link>
              <Link href="/memehaus/profile" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
                Profile
              </Link>
              <a
                href="/luckyhaus"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors font-inter font-medium"
              >
                LuckyHaus
              </a>
              <a
                href="https://x.com/i/communities/1955936302764855712"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors font-inter font-medium flex items-center space-x-1"
              >
                <span>Community</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>

            <WalletConnectButton />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/" className="flex items-center space-x-2 text-gray-400 hover:text-electric-blue transition-all duration-300">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Swap</h1>
            <p className="text-gray-400">Trade tokens instantly with the best rates</p>
          </div>
        </div>

        {/* Swap Card */}
        <div className="max-w-md mx-auto px-4 sm:px-0 relative">
          {/* Background Decorative element */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-neon-blue/20 blur-[80px] rounded-full -z-10 animate-pulse-slow"></div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-neon-pink/20 blur-[80px] rounded-full -z-10 animate-pulse-slow"></div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden relative group transition-all duration-300 hover:border-white/20">
            {/* Top glass reflection */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            {/* Tab Switcher & Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setActiveTab('swap')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'swap'
                    ? 'bg-white/10 text-white shadow-lg border border-white/10'
                    : 'text-gray-500 hover:text-white'
                    }`}
                >
                  Swap
                </button>
                <button
                  onClick={() => setActiveTab('recurring')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'recurring'
                    ? 'bg-white/10 text-white shadow-lg border border-white/10'
                    : 'text-gray-500 hover:text-white'
                    }`}
                >
                  Recurring
                </button>
              </div>
              <div className="flex items-center space-x-2">
                {(swapState.loading || dcaState.loading) && (
                  <div className="flex items-center space-x-2 text-xs text-neon-cyan/80 font-mono tracking-wider bg-neon-cyan/10 px-2 py-1 rounded-full border border-neon-cyan/20">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>{activeTab === 'swap' ? 'FETCHING QUOTE' : 'SYNCING'}</span>
                  </div>
                )}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-400 hover:text-white transition-all duration-300 hover:rotate-90"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold mb-3">Transaction Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Slippage Tolerance</label>
                    <div className="flex space-x-2">
                      {[0.1, 0.5, 1.0].map((value) => (
                        <button
                          key={value}
                          onClick={() => setSwapSlippage(value * 100)} // Convert percentage to basis points
                          className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-300 ${swapState.slippageBps === value * 100
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-blue-500'
                            }`}
                        >
                          {value}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pay Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-2 transition-all duration-300 focus-within:border-neon-cyan/50 focus-within:bg-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                  {activeTab === 'swap' ? 'Pay' : 'Budget'}
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-mono ${(swapState.loading || dcaState.loading) ? 'text-neon-cyan animate-pulse' : 'text-gray-400'}`}>
                    Balance: {fromToken ? formatBalance(parseFloat(fromToken.balance), fromToken.decimals) : '0.00'}
                  </span>
                  {connected && (
                    <button
                      onClick={loadUserTokens}
                      className="p-1 text-gray-500 hover:text-white transition-all duration-300"
                      title="Refresh balance"
                      disabled={swapState.loading || dcaState.loading}
                    >
                      <RefreshCw className={`w-3 h-3 ${(swapState.loading || dcaState.loading) ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={activeTab === 'swap' ? swapState.fromAmount : dcaState.totalAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    className="w-full bg-transparent text-3xl font-orbitron font-bold outline-none placeholder:text-white/10"
                  />
                  <div className="text-sm text-gray-500 font-mono mt-1">
                    ≈ ${fromToken && (activeTab === 'swap' ? swapState.fromAmount : dcaState.totalAmount) ? (parseFloat(activeTab === 'swap' ? swapState.fromAmount : dcaState.totalAmount) * fromToken.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </div>
                </div>
                <button
                  onClick={() => openTokenModal('from')}
                  className="flex items-center space-x-2 px-3 py-2 bg-white/10 border border-white/10 hover:border-neon-cyan/50 hover:bg-white/20 rounded-xl transition-all duration-300 group/btn"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-inner">
                    {fromToken?.logoURI ? (
                      <img src={fromToken.logoURI} alt={fromToken.symbol} className="w-full h-full object-cover" />
                    ) : (
                      fromToken?.symbol?.[0] || '?'
                    )}
                  </div>
                  <span className="font-bold tracking-tight">{fromToken?.symbol || 'Select'}</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-500 group-hover/btn:text-white transition-colors" />
                </button>
              </div>
            </div>

            {/* Swap Button */}
            <div className="relative h-2">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <button
                  onClick={handleSwapTokens}
                  className="p-2.5 bg-gray-900 border border-white/20 hover:border-neon-cyan rounded-xl transition-all duration-500 hover:rotate-180 hover:scale-110 shadow-xl group"
                >
                  <ArrowUpDown className="w-4 h-4 text-neon-cyan group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>

            {/* Receive Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 transition-all duration-300 focus-within:border-neon-pink/50 focus-within:bg-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                  {activeTab === 'swap' ? 'Receive' : 'Buy'}
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-mono ${(swapState.loading || dcaState.loading) ? 'text-neon-pink animate-pulse' : 'text-gray-400'}`}>
                    Balance: {toToken ? formatBalance(parseFloat(toToken.balance), toToken.decimals) : '0.00'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={activeTab === 'swap' ? swapState.toAmount : ''}
                    readOnly={activeTab === 'swap'}
                    onChange={activeTab === 'recurring' ? (e) => {/* Handle target amount logic if needed */ } : undefined}
                    className={`w-full bg-transparent text-3xl font-orbitron font-bold outline-none placeholder:text-white/10 ${activeTab === 'swap' ? 'text-neon-pink' : 'text-white'}`}
                  />
                  {activeTab === 'swap' && (
                    <div className="text-sm text-gray-500 font-mono mt-1">
                      ≈ ${toToken && swapState.toAmount ? (parseFloat(swapState.toAmount) * toToken.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openTokenModal('to')}
                  className="flex items-center space-x-2 px-3 py-2 bg-white/10 border border-white/10 hover:border-neon-pink/50 hover:bg-white/20 rounded-xl transition-all duration-300 group/btn"
                  disabled={memeHausTokens.length === 0}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-inner">
                    {toToken?.logoURI ? (
                      <img src={toToken.logoURI} alt={toToken.symbol} className="w-full h-full object-cover" />
                    ) : (
                      toToken?.symbol?.[0] || '?'
                    )}
                  </div>
                  <span className="font-bold tracking-tight">{toToken?.symbol || (memeHausTokens.length === 0 ? 'No tokens' : 'Select')}</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-500 group-hover/btn:text-white transition-colors" />
                </button>
              </div>
            </div>

            {/* Recurring Settings (DCA Only) */}
            {activeTab === 'recurring' && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Every</span>
                  <select
                    value={dcaState.interval}
                    onChange={(e) => setDcaState(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
                    className="bg-black/40 border border-white/10 rounded-lg text-sm px-2 py-1 outline-none"
                  >
                    <option value={3600}>Hourly</option>
                    <option value={86400}>Daily</option>
                    <option value={604800}>Weekly</option>
                    <option value={2592000}>Monthly</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Executions</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={dcaState.numberOfOrders}
                      onChange={(e) => setDcaState(prev => ({ ...prev, numberOfOrders: parseInt(e.target.value) || 1 }))}
                      className="w-16 bg-black/40 border border-white/10 rounded-lg text-sm px-2 py-1 text-center outline-none"
                    />
                    <span className="text-xs text-gray-500">orders</span>
                  </div>
                </div>
                {dcaState.totalAmount && (
                  <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg">
                    <p className="text-xs text-neon-cyan leading-relaxed">
                      Buying <span className="font-bold">{(parseFloat(dcaState.totalAmount) / dcaState.numberOfOrders).toFixed(4)} {fromToken?.symbol}</span> worth of <span className="font-bold">{toToken?.symbol}</span> every {dcaState.interval === 86400 ? 'day' : dcaState.interval === 3600 ? 'hour' : 'interval'}.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Exchange Rate & Price Impact */}
            {swapState.exchangeRate > 0 && (
              <div className="bg-card/30 border border-border-color rounded-xl p-3 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Exchange Rate</span>
                  <span className="font-semibold">
                    1 {swapState.fromToken?.symbol} = {swapState.exchangeRate.toFixed(6)} {swapState.toToken?.symbol}
                  </span>
                </div>
                {swapState.priceImpact > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Price Impact</span>
                    <span className={`font-semibold ${swapState.priceImpact > 2 ? 'text-red-400' : 'text-green-400'}`}>
                      {swapState.priceImpact.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Warning when quote is unavailable but tokens are selected */}
            {swapState.fromToken && swapState.toToken && swapState.fromAmount && parseFloat(swapState.fromAmount) > 0 && !swapState.quote && !swapState.loading && (
              <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400">
                    Unable to get swap quote. The swap service may be temporarily unavailable. Please try again in a moment.
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {swapState.error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">{swapState.error}</span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={activeTab === 'swap' ? handleSwap : dcaCreateOrder}
              disabled={
                activeTab === 'swap'
                  ? (!canSwap || isSwapExecuting || swapState.loading)
                  : (!dcaState.totalAmount || dcaState.loading || !dcaState.fromToken || !dcaState.toToken)
              }
              className={`w-full py-4 rounded-xl font-orbitron font-bold transition-all duration-500 relative overflow-hidden group ${(activeTab === 'swap' ? (!canSwap || isSwapExecuting || swapState.loading) : (!dcaState.totalAmount || dcaState.loading))
                ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                : 'bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-blue bg-[length:200%_100%] hover:bg-right text-white shadow-glow-blue animate-pulse-slow'
                }`}
            >
              <div className="relative z-10 flex items-center justify-center space-x-2">
                {(isSwapExecuting || dcaState.loading) ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{activeTab === 'swap' ? 'EXECUTING SWAP' : 'CREATING ORDER'}</span>
                  </>
                ) : activeTab === 'swap' && swapState.loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>LOADING QUOTE</span>
                  </>
                ) : (activeTab === 'swap' && !canSwap) || (activeTab === 'recurring' && !dcaState.totalAmount) ? (
                  <span>ENTER AN AMOUNT</span>
                ) : (
                  <>
                    <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
                    <span>{activeTab === 'swap' ? 'SWAP NOW' : 'START RECURRING BUY'}</span>
                  </>
                )}
              </div>
              {/* Button shimmer effect */}
              {((activeTab === 'swap' && canSwap) || (activeTab === 'recurring' && dcaState.totalAmount)) && !(isSwapExecuting || dcaState.loading) && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              )}
            </button>
          </div>

          {/* User DCA Orders (only shown on recurring tab if not empty) */}
          {activeTab === 'recurring' && dcaState.orders.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-xl font-orbitron font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Your Recurring Orders
              </h3>
              {dcaState.orders.map((order) => (
                <div key={order.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-neon-cyan" />
                      <span className="font-bold text-sm">DCA Order</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border ${order.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span>Buying {toToken?.symbol}</span>
                    <span>Every {order.cycleSeconds / 86400} days</span>
                  </div>
                  <button
                    onClick={() => dcaCancelOrder(order.id)}
                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg border border-red-500/20 transition-all duration-300"
                  >
                    CANCEL ORDER
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Info Cards */}
          <div className="mt-6 space-y-4">
            <div className="card">
              <div className="flex items-center space-x-2 mb-3">
                <Info className="w-5 h-5 text-electric-blue" />
                <h3 className="font-semibold">Why Swap on VAIIYA?</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-electric-blue" />
                  <span>Secure and audited smart contracts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-electric-purple" />
                  <span>Best rates from multiple DEXs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-neon-pink" />
                  <span>Instant execution</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-3">Recent Swaps</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">ETH → USDT</span>
                  <span className="text-electric-blue">+2.45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">USDC → WBTC</span>
                  <span className="text-neon-pink">-1.23%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">DAI → LINK</span>
                  <span className="text-electric-blue">+0.87%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MemeHaus Tokens Overview */}
        {memeHausTokens.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-center gradient-text">VAIIYA Tokens</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memeHausTokens.map((token, index) => (
                <div key={index} className="card card-hover">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-neon-pink to-neon-purple rounded-full flex items-center justify-center text-lg font-bold">
                      {token.symbol[0]}
                    </div>
                    <div>
                      <div className="font-semibold">{token.symbol}</div>
                      <div className="text-sm text-gray-400">{token.name}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="font-semibold">${formatPrice(token.price, token.decimals)}</span>
                    </div>
                    {(token as any).totalSupply && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Supply:</span>
                        <span className="font-semibold">{formatBalance(parseFloat((token as any).totalSupply), token.decimals)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Your Balance:</span>
                      <span className="font-semibold">{formatBalance(parseFloat(token.balance), token.decimals)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Token Selection Modal - Jupiter Style */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-gray-900/90 border border-white/10 rounded-3xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl relative">
            {/* Top glass reflection */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            {/* Header with Search */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-orbitron font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                Select Token
              </h3>
              <button
                onClick={() => setShowTokenModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder={tokenModalType === 'to'
                  ? "Search by name or address..."
                  : "Search your tokens..."}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all duration-300 font-inter"
              />
            </div>

            {/* Info message for "to" token */}
            {tokenModalType === 'to' && (
              <div className="mb-6 p-4 bg-neon-pink/10 border border-neon-pink/20 rounded-2xl flex items-start space-x-3">
                <Info className="w-5 h-5 text-neon-pink mt-0.5" />
                <p className="text-sm text-gray-400 leading-relaxed">
                  Only <span className="text-neon-pink font-bold">VAIIYA Verified</span> tokens are currently listed for buying. Swap any asset for the next big meme!
                </p>
              </div>
            )}

            {/* Token List */}
            <div className="overflow-y-auto max-h-[60vh] space-y-1">
              {filteredTokens.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>
                    {tokenModalType === 'to'
                      ? 'No MemeHaus tokens found. Be the first to create one!'
                      : tokenModalType === 'from' && userTokens.length === 0
                        ? 'Loading your tokens...'
                        : 'No tokens found'}
                  </p>
                  {tokenModalType === 'from' && userTokens.length === 0 && (
                    <button
                      onClick={loadUserTokens}
                      className="mt-4 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
                    >
                      Refresh
                    </button>
                  )}
                </div>
              )}

              {filteredTokens.map((token) => (
                <button
                  key={token.mint}
                  onClick={() => selectToken(token)}
                  className={`w-full p-4 rounded-2xl border transition-all duration-300 text-left group relative overflow-hidden ${(token as any).isMemeHausToken
                    ? 'bg-gradient-to-r from-neon-pink/5 to-neon-purple/5 border-neon-pink/20 hover:border-neon-pink/50'
                    : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-lg overflow-hidden ${(token as any).isMemeHausToken
                        ? 'bg-gradient-to-br from-neon-pink to-neon-purple'
                        : 'bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-white/10'
                        }`}>
                        {token.logoURI ? (
                          <img src={token.logoURI} alt={token.symbol} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-lg font-orbitron">{token.symbol[0]}</span>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-lg tracking-tight">{token.symbol}</span>
                          {(token as any).isMemeHausToken && (
                            <span className="text-[10px] bg-neon-pink/20 text-neon-pink px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-neon-pink/30">VAIIYA</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 font-medium truncate max-w-[150px]">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-white">{formatBalance(parseFloat(token.balance), token.decimals)}</div>
                      <div className="text-xs text-gray-500 font-mono">${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                    </div>
                  </div>
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Swap Result Modal */}
      {swapResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-6">
              {swapResult.success ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-400" />
              )}
              <h3 className="text-xl font-semibold">
                {swapResult.success ? 'Swap Successful!' : 'Swap Failed'}
              </h3>
            </div>

            {swapResult.success ? (
              <div className="space-y-4">
                <p className="text-gray-300">
                  Your swap has been completed successfully on the Solana network.
                </p>
                {swapResult.signature && (
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-sm text-gray-400 mb-1">Transaction Signature:</div>
                    <div className="font-mono text-sm break-all">{swapResult.signature}</div>
                  </div>
                )}
                <div className="flex space-x-3">
                  {swapResult.signature && (
                    <a
                      href={`https://solscan.io/tx/${swapResult.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>View on Solscan</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => setSwapResult(null)}
                    className="flex-1 px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 hover:bg-gray-500/30 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-red-400">{swapResult.error}</p>
                <button
                  onClick={() => setSwapResult(null)}
                  className="w-full px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 