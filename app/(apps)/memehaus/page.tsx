'use client';

import React, { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Zap, TrendingUp, Clock, Users, DollarSign, Gift, Coins, Menu, X } from 'lucide-react';
import { WalletConnectButton } from '@/app/components/shared/WalletConnectButton';
import { NetworkIndicator } from '@/app/components/shared/NetworkIndicator';
import { WalletNotification } from '@/app/components/shared/WalletNotification';
import { StatsCard } from './components/home/StatsCard';
import { LoadingSkeleton } from './components/home/LoadingSkeleton';
import { logger } from '@/app/lib/logger';
// Database imports removed - using GitHub storage

interface LaunchItem {
  name: string;
  symbol: string;
  totalSupply: string;
  communityDistribution: string;
  distributionRecipients: number;
  holders?: number;
  timeSinceLaunch: string;
  creatorWallet: string;
  mintAddress?: string;
  imageUrl?: string;
  price?: number;
  volume24h?: number;
}

// Helper function to format time since launch
// Only calculate on client to prevent hydration mismatches
const formatTimeSinceLaunch = (createdAt: string, isMounted: boolean = false): string => {
  // Return a placeholder during SSR or before mount to prevent hydration mismatch
  if (!isMounted) {
    return '...';
  }

  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 24) {
    const days = Math.floor(diffHours / 24);
    return `${days}d ${diffHours % 24}h`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  } else {
    return `${diffMinutes}m`;
  }
};

// Helper function to format large numbers
const formatLargeNumber = (num: string): string => {
  const numValue = parseFloat(num);
  if (numValue >= 1e9) {
    return `${(numValue / 1e9).toFixed(1)}B`;
  } else if (numValue >= 1e6) {
    return `${(numValue / 1e6).toFixed(1)}M`;
  } else if (numValue >= 1e3) {
    return `${(numValue / 1e3).toFixed(1)}K`;
  }
  return numValue.toLocaleString();
};

export default function Home() {
  const [recentTokens, setRecentTokens] = useState<LaunchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [platformStats, setPlatformStats] = useState({
    totalTokens: 0,
    totalVolume: '0',
    totalUsers: 0
  });

  // Track if component is mounted to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        logger.info('Fetching recent tokens from API...');

        // Fetch recent tokens from API - show more tokens like Pump.fun
        const response = await fetch('/api/tokens?page=0&limit=20');
        const data = await response.json();

        logger.debug('API response received', { success: data.success, count: data.tokens?.length });

        if (data.success && data.tokens && data.tokens.length > 0) {
          // Transform tokens to LaunchItem format
          const launchItems: LaunchItem[] = await Promise.all(data.tokens.map(async (token: any) => {
            logger.debug('Processing token', { symbol: token.symbol, mint: token.mint_address });

            const mintAddress = token.mint_address || token.mintAddress;

            // Fetch holder count if mint address is available
            let holders = 0;
            if (mintAddress) {
              try {
                const holdersResponse = await fetch(`/api/token/holders?mintAddress=${mintAddress}`);
                const holdersData = await holdersResponse.json();
                if (holdersData.success && holdersData.holders !== undefined) {
                  holders = holdersData.holders;
                }
              } catch (error) {
                logger.error('Error fetching holders', error as Error, { mintAddress });
              }
            }

            return {
              name: token.name || 'Unknown Token',
              symbol: token.symbol || 'UNK',
              totalSupply: formatLargeNumber(token.total_supply || token.totalSupply || '0'),
              communityDistribution: '0', // Will be calculated later
              distributionRecipients: holders, // Use holders count
              holders: holders,
              timeSinceLaunch: formatTimeSinceLaunch(token.created_at || token.createdAt || new Date().toISOString(), mounted),
              creatorWallet: token.creator_wallet || token.creatorWallet || 'Unknown',
              mintAddress: mintAddress,
              imageUrl: (token.image_url || token.imageUrl) || undefined, // Ensure we don't pass empty strings
              price: token.price || 0,
              volume24h: token.volume_24h || token.volume24h || 0
            };
          }));

          logger.debug('Transformed launch items', { count: launchItems.length });
          setRecentTokens(launchItems);

          // Set platform stats from API
          if (data.stats) {
            setPlatformStats(data.stats);
          }
        } else {
          logger.warn('API returned no tokens or failed, using localStorage fallback');
          throw new Error('No tokens returned from API');
        }

      } catch (error) {
        logger.error('Error fetching data', error as Error);

        // Try to get tokens from localStorage as fallback
        try {
          if (typeof window !== 'undefined') {
            const storedTokensStr = localStorage.getItem('memehaus_created_tokens');
            logger.debug('localStorage value retrieved');

            if (storedTokensStr) {
              const storedTokens = JSON.parse(storedTokensStr);
              logger.debug('Parsed stored tokens', { count: storedTokens.length });

              if (Array.isArray(storedTokens) && storedTokens.length > 0) {
                const fallbackTokens: LaunchItem[] = await Promise.all(storedTokens.slice(0, 20).map(async (token: any) => {
                  const mintAddress = token.mintAddress;

                  // Fetch holder count if mint address is available
                  let holders = 0;
                  if (mintAddress) {
                    try {
                      const holdersResponse = await fetch(`/api/token/holders?mintAddress=${mintAddress}`);
                      const holdersData = await holdersResponse.json();
                      if (holdersData.success && holdersData.holders !== undefined) {
                        holders = holdersData.holders;
                      }
                    } catch (error) {
                      logger.error('Error fetching holders (fallback)', error as Error, { mintAddress });
                    }
                  }

                  return {
                    name: token.name || 'Unknown',
                    symbol: token.symbol || 'UNK',
                    totalSupply: formatLargeNumber(token.totalSupply || '0'),
                    communityDistribution: '0',
                    distributionRecipients: holders,
                    holders: holders,
                    timeSinceLaunch: formatTimeSinceLaunch(token.createdAt || new Date().toISOString(), mounted),
                    creatorWallet: token.creatorWallet || 'Unknown',
                    mintAddress: mintAddress,
                    imageUrl: token.imageUrl,
                    price: token.price || 0,
                    volume24h: token.volume24h || 0
                  };
                }));

                logger.info('Using localStorage tokens (fallback)', { count: fallbackTokens.length });
                setRecentTokens(fallbackTokens);
                setPlatformStats({
                  totalTokens: storedTokens.length,
                  totalVolume: '0',
                  totalUsers: new Set(storedTokens.map((t: any) => t.creatorWallet).filter(Boolean)).size || 1
                });
              } else {
                logger.debug('localStorage tokens array is empty or invalid');
                setRecentTokens([]);
                setPlatformStats({
                  totalTokens: 0,
                  totalVolume: '0',
                  totalUsers: 0
                });
              }
            } else {
              logger.debug('No tokens found in localStorage');
              setRecentTokens([]);
              setPlatformStats({
                totalTokens: 0,
                totalVolume: '0',
                totalUsers: 0
              });
            }
          }
        } catch (localStorageError) {
          console.error('Error reading from localStorage:', localStorageError);
          setRecentTokens([]);
          setPlatformStats({
            totalTokens: 0,
            totalVolume: '0',
            totalUsers: 0
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white mobile-container w-full max-w-full overflow-x-hidden">
      <WalletNotification />
      {/* Header */}
      <header className="px-4 py-6 md:px-8">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <Zap className="w-6 h-6 md:w-8 md:h-8 text-neon-cyan" />
            <h1 className="text-lg md:text-2xl font-orbitron font-bold bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent">
              MemeHaus
            </h1>
            <div className="hidden sm:block">
              <NetworkIndicator />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white transition-colors p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
              Home
            </Link>
            <Link href="/memehaus/swap" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
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
            <Link
              href="/luckyhaus"
              className="text-gray-300 hover:text-white transition-colors font-inter font-medium"
            >
              LuckyHaus
            </Link>
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

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-700/50">
            <div className="flex flex-col space-y-3 pt-4">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors font-inter font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/memehaus/swap" className="text-gray-300 hover:text-white transition-colors font-inter font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Swap
              </Link>
              <Link href="/memehaus/create" className="text-gray-300 hover:text-white transition-colors font-inter font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Create
              </Link>
              <Link href="/memehaus/liquidity" className="text-gray-300 hover:text-white transition-colors font-inter font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Liquidity
              </Link>
              <Link href="/memehaus/autostake" className="text-gray-300 hover:text-white transition-colors font-inter font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Auto-Stake
              </Link>
              <Link href="/memehaus/profile" className="text-gray-300 hover:text-white transition-colors font-inter font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Profile
              </Link>
              <a
                href="/luckyhaus"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors font-inter font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                LuckyHaus
              </a>
              <a
                href="https://x.com/i/communities/1955936302764855712"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors font-inter font-medium py-2 flex items-center space-x-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Community</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-orbitron font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue bg-clip-text text-transparent animate-pulse">
              MemeHaus
            </span>
          </h2>
          <p className="text-xl md:text-2xl font-inter text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            The Haus is open.<br />
            Make a meme. Mint a dream.<br />
            Every mint kicks 10% back to the early Haus degenerates.<br />
            Welcome home.
          </p>

          <div className="flex justify-center items-center mb-16">
            <Link href="/memehaus/create" className="w-full sm:w-96 px-12 py-4 bg-gradient-to-r from-purple-500 via-purple-600 to-violet-600 rounded-full font-inter font-bold text-lg sm:text-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 inline-block text-center">
              Create Token
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-12 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatsCard
              value={`$${formatLargeNumber(platformStats.totalVolume)}`}
              label="Total Volume"
              color="cyan"
              loading={loading}
            />
            <StatsCard
              value={platformStats.totalTokens}
              label="Tokens Launched"
              color="pink"
              loading={loading}
            />
            <StatsCard
              value={platformStats.totalUsers}
              label="Active Creators"
              color="purple"
              loading={loading}
            />
          </div>
        </div>
      </section>

      {/* Trending Launches - Pump.fun Style */}
      <section className="px-4 py-16 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-orbitron font-bold flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-neon-cyan" />
                <span>Recent Launches</span>
              </h3>
              <p className="text-gray-400 text-sm mt-2 font-inter">
                Latest memecoins created on MemeHaus
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              <>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 animate-pulse">
                    <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3 mx-auto"></div>
                  </div>
                ))}
              </>
            ) : recentTokens.length > 0 ? (
              recentTokens.map((launch, index) => {
                const solscanUrl = launch.mintAddress
                  ? `https://solscan.io/token/${launch.mintAddress}`
                  : '#';

                // Get image URL or generate fallback - ensure symbol and name are not null
                const safeSymbol = launch.symbol || 'UNK';
                const safeName = launch.name || 'Unknown Token';
                // Check if imageUrl exists and is not empty
                const hasImageUrl = launch.imageUrl && launch.imageUrl.trim().length > 0 && !launch.imageUrl.includes('placeholder');
                const imageUrl = hasImageUrl ? launch.imageUrl : `/api/token-image?symbol=${encodeURIComponent(safeSymbol)}&name=${encodeURIComponent(safeName)}`;

                // Extract optional values for type narrowing
                const price = launch.price;
                const volume24h = launch.volume24h;

                return (
                  <Link
                    key={index}
                    href={launch.mintAddress ? `/memehaus/token/${launch.mintAddress}` : '#'}
                    className="group bg-black/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-neon-blue/50 transition-all duration-300 hover:shadow-2xl hover:shadow-neon-blue/20 cursor-pointer block overflow-hidden"
                  >
                    {/* Token Image */}
                    <div className="relative w-full aspect-square bg-gradient-to-br from-neon-pink/20 via-neon-purple/20 to-neon-blue/20 flex items-center justify-center overflow-hidden">
                      {hasImageUrl ? (
                        <img
                          src={imageUrl}
                          alt={safeName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback to generated image if URL fails
                            const target = e.target as HTMLImageElement;
                            target.src = `/api/token-image?symbol=${encodeURIComponent(safeSymbol)}&name=${encodeURIComponent(safeName)}`;
                          }}
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-neon-pink to-neon-purple rounded-full flex items-center justify-center font-orbitron font-bold text-3xl text-white shadow-lg">
                          {safeSymbol[0] || '?'}
                        </div>
                      )}
                      {/* Time badge */}
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-gray-300 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{launch.timeSinceLaunch}</span>
                      </div>
                    </div>

                    {/* Token Info */}
                    <div className="p-5">
                      <div className="mb-3">
                        <h4 className="font-inter font-bold text-lg text-white mb-1 group-hover:text-neon-cyan transition-colors">
                          {safeName}
                        </h4>
                        <p className="text-gray-400 font-mono text-sm">${safeSymbol}</p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-800/50 rounded-lg p-2">
                          <div className="flex items-center space-x-1 mb-1">
                            <Coins className="w-3 h-3 text-neon-cyan" />
                            <span className="text-xs text-gray-400">Supply</span>
                          </div>
                          <p className="text-sm font-semibold text-white">{launch.totalSupply}</p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-2">
                          <div className="flex items-center space-x-1 mb-1">
                            <Users className="w-3 h-3 text-neon-pink" />
                            <span className="text-xs text-gray-400">Holders</span>
                          </div>
                          <p className="text-sm font-semibold text-white">{launch.holders !== undefined ? launch.holders : launch.distributionRecipients}</p>
                        </div>
                      </div>

                      {/* Price/Volume if available */}
                      {(price !== undefined || volume24h !== undefined) && (
                        <div className="border-t border-gray-700/50 pt-3 space-y-2">
                          {price !== undefined && price > 0 ? (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400">Price</span>
                              <span className="text-sm font-semibold text-neon-cyan">
                                ${price.toFixed(6)}
                              </span>
                            </div>
                          ) : null}
                          {volume24h !== undefined && volume24h > 0 ? (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400">24h Volume</span>
                              <span className="text-sm font-semibold text-neon-purple">
                                ${formatLargeNumber(volume24h.toString())}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* View on Solscan */}
                      {launch.mintAddress && (
                        <div className="mt-4 pt-3 border-t border-gray-700/50">
                          <a
                            href={solscanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center space-x-2 text-xs text-gray-400 hover:text-neon-blue transition-colors"
                          >
                            <span>View on Solscan</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 font-inter mb-4">
                  No tokens have been created yet. Be the first to launch a memecoin! 🚀
                </div>
                <Link href="/memehaus/create" className="inline-block px-6 py-3 bg-gradient-to-r from-neon-pink to-neon-purple rounded-lg font-inter font-semibold hover:shadow-glow-pink transition-all duration-300">
                  Create Your First Token
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section - Updated for MemeHaus */}
      <section className="px-4 py-16 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-orbitron font-bold mb-6">
            Welcome to MemeHaus.
          </h3>
          <p className="text-xl text-gray-300 mb-8 font-inter">
            Where jokes print money and every shitpost has liquidity.
          </p>
          <Link href="/memehaus/create" className="px-12 py-4 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue rounded-full font-inter font-bold text-xl hover:shadow-glow-purple transition-all duration-300 transform hover:scale-105 inline-block">
            Start Your Journey
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 md:px-8 border-t border-gray-700/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <Zap className="w-6 h-6 text-neon-cyan" />
            <span className="font-orbitron font-bold text-lg">MemeHaus</span>
          </div>
          <div className="text-gray-400 font-inter text-sm text-center md:text-left">
            © 2025 MemeHaus. It's All a Meme. v2.0
          </div>
        </div>
      </footer>
    </div>
  );
} 