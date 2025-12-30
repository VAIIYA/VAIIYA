'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';
import { WalletConnectButton } from '../../components/WalletConnectButton';
import { NetworkIndicator } from '../../components/NetworkIndicator';
import { TokenHeader } from '../../components/token/TokenHeader';
import { TokenStats } from '../../components/token/TokenStats';
import { BuySellPanel } from '../../components/token/BuySellPanel';

interface TokenData {
  name: string;
  symbol: string;
  imageUrl?: string;
  creatorWallet: string;
  createdAt: string;
  mintAddress: string;
  totalSupply: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  decimals: number;
}

export default function TokenPage() {
  const params = useParams();
  const mintAddress = params.mintAddress as string;
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenData = async () => {
      if (!mintAddress) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/token/${mintAddress}`);
        const data = await response.json();

        if (data.success && data.token) {
          // Ensure we have at least basic token data
          if (!data.token.name || !data.token.symbol || data.token.name === 'Unknown Token') {
            console.warn('Token data missing name/symbol, attempting to fetch from on-chain...');
            // The API should have already tried on-chain, but if it still failed, 
            // we'll use fallback values
            setTokenData({
              ...data.token,
              name: data.token.name || 'Unknown Token',
              symbol: data.token.symbol || 'UNK',
            });
          } else {
            setTokenData(data.token);
          }
        } else {
          setError(data.error || 'Token not found. The token may not exist or may not have been created through MemeHaus.');
        }
      } catch (err) {
        console.error('Error fetching token data:', err);
        setError('Failed to load token data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
  }, [mintAddress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mb-4"></div>
            <p className="text-gray-400">Loading token...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Token Not Found</h1>
            <p className="text-gray-400 mb-6">{error || 'The token you are looking for does not exist.'}</p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-neon-pink to-neon-purple rounded-lg font-semibold hover:shadow-glow-pink transition-all duration-300"
            >
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
              <Link href="/swap" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
                Swap
              </Link>
              <Link href="/create" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
                Create
              </Link>
              <Link href="/profile" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
                Profile
              </Link>
            </div>

            <WalletConnectButton />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Token Header */}
        <TokenHeader
          name={tokenData.name}
          symbol={tokenData.symbol}
          imageUrl={tokenData.imageUrl}
          creatorWallet={tokenData.creatorWallet}
          createdAt={tokenData.createdAt}
          mintAddress={tokenData.mintAddress}
        />

        {/* Token Stats */}
        <TokenStats
          price={tokenData.price}
          priceChange24h={tokenData.priceChange24h}
          marketCap={tokenData.marketCap}
          volume24h={tokenData.volume24h}
          holders={tokenData.holders}
          totalSupply={tokenData.totalSupply}
        />

        {/* Chart Placeholder */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Price Chart</h2>
          <div className="h-64 bg-gray-800/30 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Chart coming soon...</p>
          </div>
        </div>

        {/* Buy/Sell Panel and Token Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Buy/Sell Panel */}
          <div>
            <BuySellPanel
              tokenMint={tokenData.mintAddress}
              tokenSymbol={tokenData.symbol}
              tokenName={tokenData.name}
              tokenDecimals={tokenData.decimals || 9}
            />
          </div>

          {/* Token Info */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <h2 className="text-xl font-bold mb-4">Token Information</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Total Supply</div>
                <div className="font-semibold">{tokenData.totalSupply}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Decimals</div>
                <div className="font-semibold">{tokenData.decimals || 9}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Mint Address</div>
                <div className="font-mono text-sm break-all">{tokenData.mintAddress}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Creator</div>
                <div className="font-mono text-sm">{tokenData.creatorWallet}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

