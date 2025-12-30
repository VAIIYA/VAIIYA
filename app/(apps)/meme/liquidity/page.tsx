'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Zap, TrendingUp, Plus, Minus, Settings, Info, ExternalLink, BarChart3, RefreshCw, X } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletConnectButton } from '../components/WalletConnectButton';
import { NetworkIndicator } from '../components/NetworkIndicator';
import { TokenBalanceService } from '../services/tokenBalanceService';
import { PriceService } from '../services/priceService';
import Link from 'next/link';

interface Pool {
  id: string;
  tokenA: Token;
  tokenB: Token;
  fee: number;
  binStep: number;
  liquidity: number;
  volume24h: number;
  apr: number;
  type: 'DLMM' | 'CLMM' | 'AMM';
}

interface Token {
  symbol: string;
  name: string;
  address: string;
  logoURI?: string;
  decimals: number;
  price?: number;
  balance?: string;
}

interface LiquidityFormData {
  tokenA: Token;
  tokenB: Token;
  amountA: string;
  amountB: string;
  fee: number;
  binStep: number;
  poolType: 'DLMM' | 'CLMM' | 'AMM';
  priceRange: {
    min: string;
    max: string;
  };
}

const popularPools: Pool[] = [
  {
    id: 'sol-usdc-1',
    tokenA: { symbol: 'SOL', name: 'Solana', address: 'So11111111111111111111111111111111112', decimals: 9, price: 0 },
    tokenB: { symbol: 'USDC', name: 'USD Coin', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, price: 0 },
    fee: 0.2,
    binStep: 20,
    liquidity: 1250000,
    volume24h: 450000,
    apr: 12.5,
    type: 'DLMM',
  },
  {
    id: 'bonk-sol-1',
    tokenA: { symbol: 'BONK', name: 'Bonk', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5, price: 0 },
    tokenB: { symbol: 'SOL', name: 'Solana', address: 'So11111111111111111111111111111111112', decimals: 9, price: 0 },
    fee: 0.3,
    binStep: 25,
    liquidity: 890000,
    volume24h: 320000,
    apr: 18.2,
    type: 'DLMM',
  },
  {
    id: 'usdc-usdt-1',
    tokenA: { symbol: 'USDC', name: 'USD Coin', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, price: 0 },
    tokenB: { symbol: 'USDT', name: 'Tether', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, price: 0 },
    fee: 0.05,
    binStep: 1,
    liquidity: 2500000,
    volume24h: 1200000,
    apr: 8.5,
    type: 'CLMM',
  },
];

export default function LiquidityPage() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  
  // Initialize services
  const tokenBalanceService = new TokenBalanceService(connection.rpcEndpoint);
  const priceService = new PriceService();
  
  const [activeTab, setActiveTab] = useState<'pools' | 'create'>('pools');
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  const [tokenPrices, setTokenPrices] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenModalType, setTokenModalType] = useState<'tokenA' | 'tokenB'>('tokenA');
  
  const [formData, setFormData] = useState<LiquidityFormData>({
    tokenA: popularPools[0].tokenA,
    tokenB: popularPools[0].tokenB,
    amountA: '',
    amountB: '',
    fee: 0.2,
    binStep: 20,
    poolType: 'DLMM',
    priceRange: {
      min: '0.5',
      max: '2.0',
    },
  });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Load user's tokens and prices
  const loadUserTokens = useCallback(async () => {
    if (!connected || !publicKey) {
      setUserTokens([]);
      return;
    }

    try {
      setLoading(true);

      // Get SOL balance
      const solBalance = await tokenBalanceService.getSOLBalance(publicKey.toString());
      
      // Get token accounts
      const tokenAccounts = await tokenBalanceService.getTokenAccounts(publicKey.toString());

      // Get prices for all tokens
      const mintAddresses = [
        'So11111111111111111111111111111111112', // SOL
        ...tokenAccounts.map(account => account.mint)
      ];

      const prices = await priceService.getMultipleTokenPrices(mintAddresses);
      setTokenPrices(new Map(Object.entries(prices).map(([mint, data]) => [mint, data.price])));

      // Build token list
      const tokens: Token[] = [];

      // Add SOL
      const solPrice = prices.get('So11111111111111111111111111111111112');
      tokens.push({
        symbol: 'SOL',
        name: 'Solana',
        address: 'So11111111111111111111111111111111112',
        decimals: 9,
        price: solPrice?.price || 0,
        balance: solBalance
      });

      // Add other tokens
      tokenAccounts.forEach(account => {
        const price = prices.get(account.mint);
        if (price) {
          tokens.push({
            symbol: account.symbol || 'Unknown',
            name: account.name || 'Unknown Token',
            address: account.mint,
            decimals: account.decimals,
            price: price.price,
            balance: account.balance
          });
        }
      });

      setUserTokens(tokens);

      // Update form data with real prices
      if (tokens.length > 0) {
        const solToken = tokens.find(t => t.symbol === 'SOL');
        const usdcToken = tokens.find(t => t.symbol === 'USDC') || tokens[1];
        
        if (solToken && usdcToken) {
          setFormData(prev => ({
            ...prev,
            tokenA: solToken,
            tokenB: usdcToken
          }));
        }
      }

    } catch (error) {
      console.error('Error loading user tokens:', error);
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, connection.rpcEndpoint, tokenBalanceService, priceService]);

  // Load tokens on mount and when wallet changes
  useEffect(() => {
    loadUserTokens();
  }, [loadUserTokens]);

  // Update popular pools with real prices
  useEffect(() => {
    const updatePopularPools = async () => {
      try {
        const poolAddresses = [
          'So11111111111111111111111111111111112', // SOL
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
          'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
          'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
        ];

        const prices = await priceService.getMultipleTokenPrices(poolAddresses);
        
        // Update popular pools with real prices
        popularPools.forEach(pool => {
          const tokenAPrice = prices.get(pool.tokenA.address);
          const tokenBPrice = prices.get(pool.tokenB.address);
          
          if (tokenAPrice) {
            pool.tokenA.price = tokenAPrice.price;
          }
          if (tokenBPrice) {
            pool.tokenB.price = tokenBPrice.price;
          }
        });
      } catch (error) {
        console.error('Error updating popular pools:', error);
      }
    };

    updatePopularPools();
  }, [priceService]);

  const handleAmountChange = (field: 'amountA' | 'amountB', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate the other amount based on real price ratio
    if (field === 'amountA' && value && formData.tokenA.price && formData.tokenB.price) {
      const amountA = parseFloat(value);
      const priceRatio = formData.tokenA.price / formData.tokenB.price;
      const amountB = amountA * priceRatio;
      setFormData(prev => ({ ...prev, amountB: amountB.toFixed(6) }));
    } else if (field === 'amountB' && value && formData.tokenA.price && formData.tokenB.price) {
      const amountB = parseFloat(value);
      const priceRatio = formData.tokenB.price / formData.tokenA.price;
      const amountA = amountB * priceRatio;
      setFormData(prev => ({ ...prev, amountA: amountA.toFixed(6) }));
    }
  };

  const openTokenModal = (type: 'tokenA' | 'tokenB') => {
    setTokenModalType(type);
    setShowTokenModal(true);
  };

  const selectToken = (token: Token) => {
    if (tokenModalType === 'tokenA') {
      setFormData(prev => ({ ...prev, tokenA: token, amountA: '', amountB: '' }));
    } else {
      setFormData(prev => ({ ...prev, tokenB: token, amountA: '', amountB: '' }));
    }
    setShowTokenModal(false);
  };

  const getTokenBalance = (tokenAddress: string): string => {
    if (!connected) return 'Connect Wallet';
    if (loading) return 'Loading...';
    
    const token = userTokens.find(t => t.address === tokenAddress);
    return token && token.balance ? priceService.formatBalance(parseFloat(token.balance)) : '0.00';
  };

  const handleCreatePool = async () => {
    if (!connected) return;
    
    // Simulate pool creation
    alert('Pool creation initiated! This would integrate with Meteora or similar DEX.');
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            <Zap className="w-16 h-16 mx-auto text-neon-cyan" />
            <h1 className="text-3xl font-orbitron font-bold">Connect Your Wallet</h1>
            <p className="text-gray-400 max-w-md">
              You need to connect your wallet to manage liquidity pools. Connect your Solana wallet to get started.
            </p>
            <WalletConnectButton />
            <Link href="/" className="inline-flex items-center space-x-2 text-neon-blue hover:text-neon-cyan transition-colors">
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
      <header className="px-4 py-6 md:px-8">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <Link href="/" className="flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-neon-cyan" />
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-neon-cyan" />
              <h1 className="text-lg md:text-2xl font-orbitron font-bold bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent">
                MemeHaus
              </h1>
            </Link>
            <div className="hidden sm:block">
              <NetworkIndicator />
            </div>
            {/* Coming Soon Tag */}
            <div className="px-2 py-1 md:px-3 md:py-1 bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 border border-neon-pink/30 rounded-full">
              <span className="text-xs font-inter font-semibold text-neon-pink">
                Coming Soon
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
              Home
            </Link>
            <Link href="/swap" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
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
      </header>

      {/* Main Content */}
      <main className="px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">Liquidity Pools</h2>
            <p className="text-gray-400">Provide liquidity and earn fees from trading</p>
            <div className="mt-4 px-4 py-2 bg-neon-green/20 border border-neon-green/30 rounded-full inline-block">
              <span className="text-neon-green font-inter font-semibold text-sm">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-1">
              <button
                onClick={() => setActiveTab('pools')}
                className={`px-6 py-3 rounded-lg font-inter font-semibold transition-all ${
                  activeTab === 'pools'
                    ? 'bg-neon-blue text-white shadow-glow-blue'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Popular Pools
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-3 rounded-lg font-inter font-semibold transition-all ${
                  activeTab === 'create'
                    ? 'bg-neon-blue text-white shadow-glow-blue'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Create Pool
              </button>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'pools' ? (
            <div className="space-y-6 opacity-50">
              {/* Pool Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 text-center">
                  <div className="text-2xl font-orbitron font-bold text-gray-500 mb-1">$4.6M</div>
                  <div className="text-gray-500 text-sm">Total Liquidity</div>
                </div>
                <div className="bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 text-center">
                  <div className="text-2xl font-orbitron font-bold text-gray-500 mb-1">$2.1M</div>
                  <div className="text-gray-500 text-sm">24h Volume</div>
                </div>
                <div className="bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 text-center">
                  <div className="text-2xl font-orbitron font-bold text-gray-500 mb-1">15.2%</div>
                  <div className="text-gray-500 text-sm">Average APR</div>
                </div>
                <div className="bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 text-center">
                  <div className="text-2xl font-orbitron font-bold text-gray-500 mb-1">247</div>
                  <div className="text-gray-500 text-sm">Active Pools</div>
                </div>
              </div>

              {/* Popular Pools */}
              <div className="space-y-4">
                <h3 className="text-xl font-orbitron font-bold">Popular Pools</h3>
                {popularPools.map((pool) => (
                  <div key={pool.id} className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-neon-blue/50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex -space-x-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-neon-pink to-neon-purple rounded-full flex items-center justify-center font-orbitron font-bold text-lg">
                            {pool.tokenA.symbol[0]}
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-full flex items-center justify-center font-orbitron font-bold text-lg">
                            {pool.tokenB.symbol[0]}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-inter font-bold">
                            {pool.tokenA.symbol}/{pool.tokenB.symbol}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              pool.type === 'DLMM' ? 'bg-blue-500/20 text-blue-400' :
                              pool.type === 'CLMM' ? 'bg-green-500/20 text-green-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {pool.type}
                            </span>
                            <span>{pool.fee}% fee</span>
                            <span>Bin {pool.binStep}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="text-2xl font-orbitron font-bold text-neon-cyan">
                          ${(pool.liquidity / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-sm text-gray-400">
                          Liquidity
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="text-lg font-semibold text-green-400">
                          {pool.apr}% APR
                        </div>
                        <div className="text-sm text-gray-400">
                          Estimated
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-neon-blue/20 border border-neon-blue/30 rounded-lg text-neon-blue hover:bg-neon-blue/30 transition-colors">
                          Add
                        </button>
                        <button className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:border-gray-500 transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
                      ) : (
              <div className="max-w-2xl mx-auto opacity-50">
                {/* Create Pool Form */}
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                  <h3 className="text-xl font-orbitron font-bold mb-6 text-gray-500">Create New Pool</h3>
                
                {/* Token Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-inter font-semibold mb-2 text-gray-400">Token A</label>
                    <div className="flex items-center space-x-3 p-3 bg-black/20 rounded-lg border border-gray-700/50">
                      <div className="w-10 h-10 bg-gradient-to-br from-neon-pink to-neon-purple rounded-full flex items-center justify-center font-orbitron font-bold text-sm">
                        {formData.tokenA.symbol[0]}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="0.0"
                          value={formData.amountA}
                          onChange={(e) => handleAmountChange('amountA', e.target.value)}
                          className="w-full bg-transparent text-lg font-orbitron font-bold text-white placeholder-gray-500 focus:outline-none"
                        />
                        <div className="text-xs text-gray-400">
                          Balance: {getTokenBalance(formData.tokenA.address)}
                        </div>
                      </div>
                      <button 
                        onClick={() => openTokenModal('tokenA')}
                        className="px-3 py-1 bg-black/30 rounded-lg text-sm font-semibold hover:bg-black/50 transition-colors"
                      >
                        {formData.tokenA.symbol}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-inter font-semibold mb-2 text-gray-400">Token B</label>
                    <div className="flex items-center space-x-3 p-3 bg-black/20 rounded-lg border border-gray-700/50">
                      <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-full flex items-center justify-center font-orbitron font-bold text-sm">
                        {formData.tokenB.symbol[0]}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="0.0"
                          value={formData.amountB}
                          onChange={(e) => handleAmountChange('amountB', e.target.value)}
                          className="w-full bg-transparent text-lg font-orbitron font-bold text-white placeholder-gray-500 focus:outline-none"
                        />
                        <div className="text-xs text-gray-400">
                          Balance: {getTokenBalance(formData.tokenB.address)}
                        </div>
                      </div>
                      <button 
                        onClick={() => openTokenModal('tokenB')}
                        className="px-3 py-1 bg-black/30 rounded-lg text-sm font-semibold hover:bg-black/50 transition-colors"
                      >
                        {formData.tokenB.symbol}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pool Settings */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-orbitron font-bold">Pool Settings</h4>
                    <button
                      onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                      className="text-neon-blue hover:text-neon-cyan transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-inter font-semibold mb-2 text-gray-400">Pool Type</label>
                      <select
                        value={formData.poolType}
                        onChange={(e) => setFormData(prev => ({ ...prev, poolType: e.target.value as any }))}
                        className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none"
                      >
                        <option value="DLMM">DLMM (Meteora)</option>
                        <option value="CLMM">CLMM (Orca)</option>
                        <option value="AMM">AMM (Raydium)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-inter font-semibold mb-2 text-gray-400">Fee (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.fee}
                        onChange={(e) => setFormData(prev => ({ ...prev, fee: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-inter font-semibold mb-2 text-gray-400">Bin Step</label>
                      <input
                        type="number"
                        value={formData.binStep}
                        onChange={(e) => setFormData(prev => ({ ...prev, binStep: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  {showAdvancedSettings && (
                    <div className="p-4 bg-black/20 rounded-lg border border-gray-700/50">
                      <h5 className="text-sm font-semibold mb-3">Price Range</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Min Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.priceRange.min}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              priceRange: { ...prev.priceRange, min: e.target.value }
                            }))}
                            className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white text-sm focus:border-neon-blue focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Max Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.priceRange.max}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              priceRange: { ...prev.priceRange, max: e.target.value }
                            }))}
                            className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white text-sm focus:border-neon-blue focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pool Preview */}
                <div className="bg-black/20 rounded-lg p-4 mb-6 border border-gray-700/50">
                  <h4 className="text-lg font-orbitron font-bold mb-3">Pool Preview</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Pool Type:</span>
                      <span className="ml-2 font-semibold">{formData.poolType}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Fee:</span>
                      <span className="ml-2 font-semibold">{formData.fee}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Bin Step:</span>
                      <span className="ml-2 font-semibold">{formData.binStep}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Initial Liquidity:</span>
                      <span className="ml-2 font-semibold text-neon-cyan">
                        ${formData.amountA && formData.amountB ? 
                          ((parseFloat(formData.amountA) * (formData.tokenA.price || 0)) + 
                           (parseFloat(formData.amountB) * (formData.tokenB.price || 0))).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreatePool}
                  disabled={!formData.amountA || !formData.amountB}
                  className="w-full px-6 py-4 bg-gradient-to-r from-neon-pink to-neon-purple rounded-xl font-inter font-bold text-lg hover:shadow-glow-purple transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Pool
                </button>

                {/* Info */}
                <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-400">
                      <p className="font-semibold mb-1">Pool Creation Tips:</p>
                      <ul className="text-xs space-y-1">
                        <li>• Start with small amounts to test the pool</li>
                        <li>• Consider the fee structure for your use case</li>
                        <li>• Monitor pool performance after creation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Token Selection Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                Select {tokenModalType === 'tokenA' ? 'Token A' : 'Token B'}
              </h3>
              <button
                onClick={() => setShowTokenModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {userTokens.map((token) => (
                <button
                  key={token.address}
                  onClick={() => selectToken(token)}
                  className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-electric-blue transition-all duration-300 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {token.symbol[0]}
                      </div>
                      <div>
                        <div className="font-semibold">{token.symbol}</div>
                        <div className="text-sm text-gray-400">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${priceService.formatPrice(token.price || 0)}</div>
                      <div className="text-sm text-gray-400">{getTokenBalance(token.address)}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 