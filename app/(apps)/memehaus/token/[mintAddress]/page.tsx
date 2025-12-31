'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap, MessageSquare, Edit3 } from 'lucide-react';
import { WalletConnectButton } from '@/app/components/shared/WalletConnectButton';
import { NetworkIndicator } from '@/app/components/shared/NetworkIndicator';
import { TokenStudioBanner } from '../../components/token/TokenStudioBanner';
import { CreatorManagement } from '../../components/token/CreatorManagement';
import { LaunchConfiguration } from '../../components/token/LaunchConfiguration';
import { CreatorNotes } from '../../components/token/CreatorNotes';
import { TokenBondingCurve } from '../../components/token/TokenBondingCurve';
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
  graduated?: boolean;
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
          setTokenData({
            ...data.token,
            name: data.token.name || 'Unknown Token',
            symbol: data.token.symbol || 'UNK',
            graduated: data.token.graduated ?? true // Mocking true for demo purposes
          });
        } else {
          setError(data.error || 'Token not found.');
        }
      } catch (err) {
        console.error('Error fetching token data:', err);
        setError('Failed to load token data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
  }, [mintAddress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b111a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mb-4"></div>
          <p className="text-gray-400">Entering the Studio...</p>
        </div>
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="min-h-screen bg-[#0b111a] text-white flex items-center justify-center">
        <div className="text-center p-8 bg-gray-900/50 rounded-3xl border border-white/5">
          <h1 className="text-2xl font-bold mb-4">Studio Entry Denied</h1>
          <p className="text-gray-400 mb-6">{error || 'Token not found.'}</p>
          <Link href="/" className="px-6 py-3 bg-neon-cyan/20 border border-neon-cyan/30 rounded-xl font-bold text-neon-cyan hover:bg-neon-cyan/30 transition-all">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b111a] text-white">
      {/* Studio Navigation Wrapper */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <header className="py-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-neon-cyan" />
              <span className="font-orbitron font-black text-xl tracking-tighter">VAIIYA <span className="text-gray-500">Studio</span></span>
            </Link>
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Home</Link>
              <Link href="/memehaus/create" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Launch</Link>
              <Link href="#" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Verify</Link>
              <Link href="#" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Lock</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <NetworkIndicator />
            <WalletConnectButton />
          </div>
        </header>

        <main className="pb-20">
          <TokenStudioBanner
            name={tokenData.name}
            symbol={tokenData.symbol}
            imageUrl={tokenData.imageUrl}
            mintAddress={tokenData.mintAddress}
            graduated={tokenData.graduated}
          />

          {/* Three Column Studio Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left/Main Column (8/12) */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              <TokenBondingCurve progress={100} graduated={tokenData.graduated} />

              {/* Description Panel */}
              <div className="bg-[#131b26]/60 backdrop-blur-md rounded-2xl border border-white/5 p-6 relative">
                <button className="absolute top-4 right-4 p-2 text-gray-600 hover:text-white"><Edit3 className="w-4 h-4" /></button>
                <h2 className="text-xl font-inter font-bold text-white mb-4">Description</h2>
                <p className="text-gray-300 leading-relaxed">
                  The freshest memecoin on the Solana blockchain! Bringing the HAUS back to the community with a 10% early distribution and locked liquidity.
                </p>
              </div>

              {/* Creator Notes */}
              <CreatorNotes />

            </div>

            {/* Right Sidebar (4/12) */}
            <div className="lg:col-span-4 flex flex-col gap-6">

              <CreatorManagement />

              <LaunchConfiguration />

              {/* Holder Comments Placeholder */}
              <div className="bg-[#131b26]/60 backdrop-blur-md rounded-2xl border border-white/5 p-6 flex-1 min-h-[300px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-inter font-bold text-white">Holder Comments</h2>
                  <div className="text-[10px] text-gray-500 font-mono">Your Balance: 0.00 MEME ($0.00)</div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                  <MessageSquare className="w-12 h-12 mb-2 text-gray-600" />
                  <p className="text-sm text-gray-500">No comments yet</p>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
