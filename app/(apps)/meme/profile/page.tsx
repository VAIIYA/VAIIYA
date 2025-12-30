'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  ExternalLink, 
  Coins, 
  TrendingUp, 
  Clock,
  User,
  Wallet,
  Copy,
  CheckCircle
} from 'lucide-react';
import { WalletConnectButton } from '../components/WalletConnectButton';
import { NetworkIndicator } from '../components/NetworkIndicator';
import { TokenBalanceService, TokenAccount } from '../services/tokenBalanceService';
import { PriceService } from '../services/priceService';
import { Zap } from 'lucide-react';

interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  balance: string;
  balanceRaw: number;
  decimals: number;
  price: number;
  value: number;
  logoURI?: string;
  priceChange24h?: number;
}

interface CreatedToken {
  name: string;
  symbol: string;
  mintAddress: string;
  totalSupply: string;
  createdAt: string;
  imageUrl?: string;
  value?: number;
  holders?: number;
}

type TabType = 'balances' | 'created';

export default function ProfilePage() {
  const { connected, publicKey, disconnect } = useWallet();
  const { connection } = useConnection();
  const [activeTab, setActiveTab] = useState<TabType>('balances');
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [createdTokens, setCreatedTokens] = useState<CreatedToken[]>([]);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [totalValue, setTotalValue] = useState<number>(0);

  const tokenBalanceService = useMemo(() => new TokenBalanceService(connection.rpcEndpoint), [connection.rpcEndpoint]);
  const priceService = useMemo(() => new PriceService(), []);

  // Load user's token balances
  const loadBalances = async () => {
    if (!connected || !publicKey) {
      setTokenBalances([]);
      setSolBalance(0);
      setTotalValue(0);
      return;
    }

    try {
      setLoading(true);

      // Get SOL balance
      const solBalanceRaw = await tokenBalanceService.getSOLBalance(publicKey.toString());
      const solBalanceNum = parseFloat(solBalanceRaw);
      setSolBalance(solBalanceNum);

      // Get token accounts
      const tokenAccounts = await tokenBalanceService.getTokenAccounts(publicKey.toString()) || [];

      // Get prices for all tokens
      const mintAddresses = [
        'So11111111111111111111111111111111112', // SOL
        ...tokenAccounts.map(account => account.mint)
      ];

      const prices = await priceService.getMultipleTokenPrices(mintAddresses);
      const solPrice = prices.get('So11111111111111111111111111111111112')?.price || 0;

      // Build token balances list
      const balances: TokenBalance[] = [];

      // Add SOL
      const solValue = solBalanceNum * solPrice;
      balances.push({
        mint: 'So11111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        balance: solBalanceRaw,
        balanceRaw: solBalanceNum,
        decimals: 9,
        price: solPrice,
        value: solValue,
        priceChange24h: prices.get('So11111111111111111111111111111111112')?.priceChange24h || 0
      });

      // Add other tokens
      tokenAccounts.forEach(account => {
        const price = prices.get(account.mint);
        if (price && parseFloat(account.balance) > 0) {
          const balanceNum = parseFloat(account.balance);
          balances.push({
            mint: account.mint,
            symbol: account.symbol || 'Unknown',
            name: account.name || 'Unknown Token',
            balance: account.balance,
            balanceRaw: balanceNum,
            decimals: account.decimals,
            price: price.price,
            value: balanceNum * price.price,
            logoURI: undefined, // TokenAccount doesn't have logoURI, can be fetched from token metadata if needed
            priceChange24h: price.priceChange24h
          });
        }
      });

      // Sort by value (highest first)
      balances.sort((a, b) => b.value - a.value);

      setTokenBalances(balances);

      // Calculate total value
      const total = balances.reduce((sum, token) => sum + token.value, 0);
      setTotalValue(total);

    } catch (error) {
      console.error('Error loading balances:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load created tokens
  const loadCreatedTokens = async () => {
    if (!connected || !publicKey) {
      setCreatedTokens([]);
      return;
    }

    try {
      const walletAddress = publicKey.toString();
      
      // Fetch tokens created by this wallet
      const response = await fetch(`/api/tokens?page=0&limit=100`);
      const data = await response.json();

      if (data.success && data.tokens) {
        const userTokens = data.tokens.filter((token: any) => {
          const creatorWallet = token.creator_wallet || token.creatorWallet;
          return creatorWallet && creatorWallet.toLowerCase() === walletAddress.toLowerCase();
        });

        // Transform to CreatedToken format
        const tokens: CreatedToken[] = userTokens.map((token: any) => {
          const mintAddress = token.mint_address || token.mintAddress;
          
          // Calculate value (simplified - could fetch actual market cap)
          let value = 0;
          if (token.total_supply && token.price) {
            const supply = parseFloat(token.total_supply);
            value = supply * token.price;
          }

          return {
            name: token.name || 'Unknown Token',
            symbol: token.symbol || 'UNK',
            mintAddress: mintAddress || '',
            totalSupply: token.total_supply || token.totalSupply || '0',
            createdAt: token.created_at || token.createdAt || new Date().toISOString(),
            imageUrl: token.image_url || token.imageUrl,
            value: value,
            holders: token.holders || 0
          };
        });

        // Sort by creation date (newest first) with error handling
        tokens.sort((a, b) => {
          try {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
              return 0; // Keep original order if dates are invalid
            }
            return dateB.getTime() - dateA.getTime();
          } catch (error) {
            console.warn('Error sorting tokens by date:', error);
            return 0;
          }
        });

        setCreatedTokens(tokens);
      }
    } catch (error) {
      console.error('Error loading created tokens:', error);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      loadBalances().catch(error => {
        console.error('Error in loadBalances:', error);
        setLoading(false);
      });
      loadCreatedTokens().catch(error => {
        console.error('Error in loadCreatedTokens:', error);
      });
    } else {
      setTokenBalances([]);
      setCreatedTokens([]);
      setSolBalance(0);
      setTotalValue(0);
      setLoading(false);
    }
  }, [connected, publicKey]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatValue = (value: number) => {
    if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) {
      return 'Unknown';
    }

    const now = new Date();
    let date: Date;

    // Try to parse the date string
    if (typeof dateString === 'string') {
      const numericValue = Number(dateString);
      if (!isNaN(numericValue) && numericValue > 0) {
        if (numericValue < 1e12) {
          date = new Date(numericValue * 1000);
        } else {
          date = new Date(numericValue);
        }
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    
    // Validate date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Unknown';
    }

    // Check if date is unreasonably old (before 2000) or in the future
    const year2000 = new Date('2000-01-01').getTime();
    if (date.getTime() < year2000) {
      return 'Unknown';
    }

    if (date.getTime() > now.getTime()) {
      return 'Just now';
    }

    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs <= 0) {
      return 'Just now';
    }

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
      return `${diffYears}y ago`;
    } else if (diffMonths > 0) {
      return `${diffMonths}mo ago`;
    } else if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  // Check if user is not connected
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Connect Your Wallet</h1>
            <p className="text-gray-400 max-w-md">
              Connect your Solana wallet to view your profile, balances, and created tokens.
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

  if (!publicKey) return null;

  const walletAddress = publicKey.toString();
  const solPrice = tokenBalances?.find(t => t.symbol === 'SOL')?.price || 0;
  const solValue = (solBalance || 0) * solPrice;

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
              <Link href="/profile" className="text-white font-inter font-medium">
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
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-neon-pink via-neon-purple to-neon-blue rounded-full flex items-center justify-center text-2xl font-bold">
                {walletAddress?.[0]?.toUpperCase() || '?'}
              </div>
              
              <div>
                <h2 className="text-2xl font-bold font-inter mb-1">
                  {formatAddress(walletAddress)}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span className="font-mono">{walletAddress}</span>
                  <button
                    onClick={() => copyToClipboard(walletAddress)}
                    className="p-1 hover:bg-gray-800 rounded transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={`https://solscan.io/account/${walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>View on Solscan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-cyan">{createdTokens.length}</div>
                <div className="text-sm text-gray-400">Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-purple">{formatValue(totalValue)}</div>
                <div className="text-sm text-gray-400">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-pink">{solBalance.toFixed(2)} SOL</div>
                <div className="text-sm text-gray-400">Balance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 border-b border-gray-700/50">
          <button
            onClick={() => setActiveTab('balances')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'balances'
                ? 'text-neon-cyan'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Balances
            {activeTab === 'balances' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('created')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'created'
                ? 'text-neon-cyan'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Created Coins ({createdTokens.length})
            {activeTab === 'created' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan"></div>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan"></div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        ) : activeTab === 'balances' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coins Column */}
            <div>
              <h3 className="text-xl font-bold mb-4">Coins</h3>
              <div className="space-y-3">
                {tokenBalances && tokenBalances.length > 0 ? (
                  tokenBalances.map((token) => (
                    <Link
                      key={token.mint}
                      href={token.mint === 'So11111111111111111111111111111111112' ? '#' : `/token/${token.mint}`}
                      className={`bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 hover:border-neon-blue/50 transition-all duration-300 block ${
                        token.mint === 'So11111111111111111111111111111111112' ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {token.logoURI ? (
                            <img
                              src={token.logoURI}
                              alt={token.symbol}
                              className="w-10 h-10 rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-10 h-10 bg-gradient-to-br from-neon-pink to-neon-purple rounded-full flex items-center justify-center font-bold ${token.logoURI ? 'hidden' : ''}`}>
                            {token.symbol?.[0] || '?'}
                          </div>
                          <div>
                            <div className="font-semibold">{token.name}</div>
                            <div className="text-sm text-gray-400">{token.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {token.balanceRaw.toLocaleString(undefined, {
                              maximumFractionDigits: token.decimals > 6 ? 6 : token.decimals
                            })}
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatValue(token.value)}
                          </div>
                          {token.priceChange24h !== undefined && token.priceChange24h !== 0 && (
                            <div className={`text-xs ${token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tokens found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Created Coins Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Created Coins ({createdTokens.length})</h3>
                {createdTokens.length > 5 && (
                  <button
                    onClick={() => setActiveTab('created')}
                    className="text-sm text-neon-cyan hover:text-neon-blue transition-colors"
                  >
                    See all
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {createdTokens && createdTokens.slice(0, 5).map((token) => (
                  <Link
                    key={token.mintAddress}
                    href={`/token/${token.mintAddress}`}
                    className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 hover:border-neon-blue/50 transition-all duration-300 block"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {token.imageUrl ? (
                          <img
                            src={token.imageUrl}
                            alt={token.symbol}
                            className="w-10 h-10 rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 bg-gradient-to-br from-neon-pink to-neon-purple rounded-full flex items-center justify-center font-bold ${token.imageUrl ? 'hidden' : ''}`}>
                          {token.symbol?.[0] || '?'}
                        </div>
                        <div>
                          <div className="font-semibold">{token.name}</div>
                          <div className="text-sm text-gray-400">{token.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {token.value ? formatValue(token.value) : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatTimeAgo(token.createdAt)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {createdTokens.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tokens created yet</p>
                    <Link
                      href="/create"
                      className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-neon-pink to-neon-purple rounded-lg text-sm font-semibold hover:shadow-glow-pink transition-all duration-300"
                    >
                      Create Your First Token
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold mb-4">Created Coins ({createdTokens.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {createdTokens && createdTokens.length > 0 ? (
                createdTokens.map((token) => (
                  <Link
                    key={token.mintAddress}
                    href={`/token/${token.mintAddress}`}
                    className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 hover:border-neon-blue/50 transition-all duration-300 block"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      {token.imageUrl ? (
                        <img
                          src={token.imageUrl}
                          alt={token.symbol}
                          className="w-12 h-12 rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-12 h-12 bg-gradient-to-br from-neon-pink to-neon-purple rounded-full flex items-center justify-center font-bold text-lg ${token.imageUrl ? 'hidden' : ''}`}>
                        {token.symbol?.[0] || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{token.name}</div>
                        <div className="text-sm text-gray-400">{token.symbol}</div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Value:</span>
                        <span className="font-semibold">
                          {token.value ? formatValue(token.value) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-gray-300">{formatTimeAgo(token.createdAt)}</span>
                      </div>
                      {token.holders !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Holders:</span>
                          <span className="text-gray-300">{token.holders}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400 mb-4">No tokens created yet</p>
                  <Link
                    href="/create"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-neon-pink to-neon-purple rounded-lg font-semibold hover:shadow-glow-pink transition-all duration-300"
                  >
                    Create Your First Token
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

