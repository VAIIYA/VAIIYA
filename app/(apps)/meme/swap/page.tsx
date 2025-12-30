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
import { NetworkIndicator } from '../components/NetworkIndicator';
import { WalletConnectButton } from '../components/WalletConnectButton';
import { useSwap, SwapToken } from '../hooks/useSwap';
import { useWallet } from '@solana/wallet-adapter-react';

export default function SwapPage() {

  // Token selection modal state
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenModalType, setTokenModalType] = useState<'from' | 'to'>('from');
  const [searchQuery, setSearchQuery] = useState('');
  const { connected } = useWallet();
  const {
    swapState,
    userTokens,
    memeHausTokens,
    isExecuting,
    setFromToken,
    setToToken,
    setFromAmount,
    setSlippage,
    swapTokens,
    executeSwap,
    loadUserTokens,
    loadMemeHausTokens,
    canSwap,
    formatPrice,
    formatBalance
  } = useSwap();
  
  // Extract slippage from swapState for easier access
  const slippage = swapState.slippageBps / 100; // Convert from basis points to percentage
  
  const [showSettings, setShowSettings] = useState(false);
  const [swapResult, setSwapResult] = useState<{ success: boolean; signature?: string; error?: string } | null>(null);

  const handleSwapTokens = () => {
    swapTokens();
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
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
                  MemeHaus
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
              <Link href="/swap" className="text-white font-inter font-medium">
                Swap
              </Link>
              <Link href="/create" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
                Create
              </Link>
              <Link href="/liquidity" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
                Liquidity
              </Link>
              <Link href="/autostake" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
                Auto-Stake
              </Link>
              <Link href="/profile" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
                Profile
              </Link>
              <a 
                href="https://luckyhaus.vercel.app/" 
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
        <div className="max-w-md mx-auto px-4 sm:px-0">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Swap</h2>
              <div className="flex items-center space-x-2">
                {swapState.loading && (
                  <div className="flex items-center space-x-2 text-sm text-neon-cyan">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                )}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
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
                          onClick={() => setSlippage(value * 100)} // Convert percentage to basis points
                          className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-300 ${
                            slippage === value
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

            {/* From Token */}
            <div className="bg-card/50 border border-border-color rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">From</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${swapState.loading ? 'text-neon-cyan' : 'text-gray-400'}`}>
                    Balance: {swapState.fromToken ? formatBalance(parseFloat(swapState.fromToken.balance), swapState.fromToken.decimals) : '0.00'}
                  </span>
                  {connected && (
                    <button
                      onClick={loadUserTokens}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title="Refresh balance"
                      disabled={swapState.loading}
                    >
                      <RefreshCw className={`w-3 h-3 ${swapState.loading ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-card border border-border-color rounded-full flex items-center justify-center text-lg">
                  {swapState.fromToken?.symbol?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={swapState.fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    className="w-full bg-transparent text-2xl font-bold outline-none"
                  />
                  <div className="text-sm text-gray-400">
                    ${swapState.fromToken ? formatPrice(swapState.fromToken.price, swapState.fromToken.decimals) : '0.00'}
                  </div>
                </div>
                <button 
                  onClick={() => openTokenModal('from')}
                  className="px-3 py-1 bg-card border border-border-color hover:border-electric-blue rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={swapState.loading || userTokens.length === 0}
                >
                  {swapState.loading && userTokens.length === 0 ? 'Loading...' : swapState.fromToken?.symbol || 'Select'}
                </button>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center mb-4">
              <button
                onClick={handleSwapTokens}
                className="p-2 bg-card border border-border-color hover:border-electric-blue rounded-xl transition-all duration-300"
              >
                <ArrowUpDown className="w-5 h-5" />
              </button>
            </div>

            {/* To Token */}
            <div className="bg-card/50 border border-border-color rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">To</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${swapState.loading ? 'text-neon-cyan' : 'text-gray-400'}`}>
                    Balance: {swapState.toToken ? formatBalance(parseFloat(swapState.toToken.balance), swapState.toToken.decimals) : '0.00'}
                  </span>
                  {connected && (
                    <button
                      onClick={loadUserTokens}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title="Refresh balance"
                    >
                      <RefreshCw className={`w-3 h-3 ${swapState.loading ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-card border border-border-color rounded-full flex items-center justify-center text-lg">
                  {swapState.toToken?.symbol?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={swapState.toAmount}
                    readOnly
                    className="w-full bg-transparent text-2xl font-bold outline-none"
                  />
                  <div className="text-sm text-gray-400">
                    ${swapState.toToken ? formatPrice(swapState.toToken.price, swapState.toToken.decimals) : '0.00'}
                  </div>
                </div>
                <button 
                  onClick={() => openTokenModal('to')}
                  className="px-3 py-1 bg-card border border-border-color hover:border-electric-blue rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={memeHausTokens.length === 0}
                >
                  {swapState.toToken?.symbol || (memeHausTokens.length === 0 ? 'No tokens' : 'Select')}
                </button>
              </div>
            </div>

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

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={!canSwap || isExecuting || swapState.loading}
              className="w-full btn-primary disabled:bg-card disabled:border disabled:border-border-color disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isExecuting ? 'Swapping...' : 
               swapState.loading ? 'Loading quote...' :
               !canSwap ? 'Enter an amount' : 
               `Swap ${swapState.fromToken?.symbol || ''} for ${swapState.toToken?.symbol || ''}`}
            </button>
          </div>

          {/* Info Cards */}
          <div className="mt-6 space-y-4">
            <div className="card">
              <div className="flex items-center space-x-2 mb-3">
                <Info className="w-5 h-5 text-electric-blue" />
                <h3 className="font-semibold">Why Swap on MemeHaus?</h3>
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
            <h2 className="text-2xl font-bold mb-6 text-center gradient-text">MemeHaus Tokens</h2>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden">
            {/* Header with Search */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                Select {tokenModalType === 'from' ? 'From' : 'To'} Token
              </h3>
              <button
                onClick={() => setShowTokenModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={tokenModalType === 'to' 
                  ? "Search MemeHaus tokens (e.g., MEMEDOGE, MemeHaus)..." 
                  : "Search your tokens..."}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Info message for "to" token */}
            {tokenModalType === 'to' && (
              <div className="mb-4 p-3 bg-purple-900/30 border border-purple-500/50 rounded-lg">
                <p className="text-sm text-purple-300">
                  🚀 Only MemeHaus tokens are available for purchase
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
                  className={`w-full p-4 border rounded-xl hover:border-blue-500 hover:bg-gray-800/50 transition-all duration-300 text-left group ${
                    (token as any).isMemeHausToken 
                      ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/50' 
                      : 'bg-gray-800/30 border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        (token as any).isMemeHausToken 
                          ? 'bg-gradient-to-br from-neon-pink to-neon-purple' 
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}>
                        {token.symbol[0]}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{token.symbol}</span>
                          {tokenModalType === 'to' || (token as any).isMemeHausToken ? (
                            <span className="text-xs bg-neon-pink/20 text-neon-pink px-2 py-1 rounded-full">MemeHaus</span>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            </>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">{token.name}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          {token.mint.slice(0, 4)}...{token.mint.slice(-4)}
                        </div>
                        {tokenModalType === 'to' && (token as any).creatorWallet && (
                          <div className="text-xs text-neon-cyan mt-1">
                            Created by: {(token as any).creatorWallet?.slice(0, 4)}...{(token as any).creatorWallet?.slice(-4)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatBalance(parseFloat(token.balance), token.decimals)}</div>
                      <div className="text-sm text-gray-400">${formatPrice(token.price, token.decimals)}</div>
                      {tokenModalType === 'to' && (token as any).totalSupply ? (
                        <div className="text-xs text-neon-purple">
                          Supply: {formatBalance(parseFloat((token as any).totalSupply), token.decimals)}
                        </div>
                      ) : tokenModalType === 'from' && token.priceChange24h !== 0 ? (
                        <div className={`text-xs ${token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                        </div>
                      ) : null}
                    </div>
                  </div>
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