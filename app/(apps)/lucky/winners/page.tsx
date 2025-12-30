'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Wallet, Coins, Clock, ArrowLeft, ExternalLink, Zap } from 'lucide-react';
import { getCurrencySymbol } from '../lib/lottery-config';
import { Navigation } from '../components/Navigation';
import { WalletConnectButton } from '../components/WalletConnectButton';
import Link from 'next/link';

interface Winner {
  roundId: string;
  walletAddress: string;
  prizeAmount: number;
  timestamp: number;
  payoutTransactionSignature?: string;
  payoutError?: string;
}

export default function AllWinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllWinners = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch all winners (use a high limit or fetch all)
        const response = await fetch('/lucky/api/lottery?action=recent-winners&limit=1000');
        const data = await response.json();

        if (data.success && data.winners) {
          // Sort by timestamp descending (most recent first)
          const sortedWinners = [...data.winners].sort((a: Winner, b: Winner) => b.timestamp - a.timestamp);
          setWinners(sortedWinners);
        } else {
          setError('Failed to fetch winners data');
        }
      } catch (err) {
        console.error('Error fetching winners:', err);
        setError('Error loading winners. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllWinners();
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatTimeSince = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ago`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoundNumber = (roundId: string) => {
    const match = roundId.match(/round-(\d{4}-\d{2}-\d{2})/);
    if (match) {
      try {
        const dateStr = match[1];
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const epoch = new Date('2024-01-01');
        const daysSinceEpoch = Math.floor((date.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceEpoch + 1;
      } catch (e) {
        console.error('Error parsing round date:', e);
      }
    }
    const numMatch = roundId.match(/\d+/);
    return numMatch ? numMatch[0] : '?';
  };

  const totalPrizeAmount = winners.reduce((sum, winner) => sum + winner.prizeAmount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading all winners...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* Header */}
      <header className="px-3 sm:px-4 py-4 sm:py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 flex-shrink-0" />
            <Link href="/lucky" className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity truncate">
              LuckyHaus v3.1.1
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <Navigation />
            <WalletConnectButton />
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-16">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">All Winners</h1>
          </div>

          <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
            Complete history of all LuckyHaus lottery winners
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1">
                {winners.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Total Winners</div>
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-pink-400 mb-1">
                {totalPrizeAmount.toFixed(2)} {getCurrencySymbol()}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Total Prizes Awarded</div>
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-blue-400 mb-1">
                {winners.length > 0 ? (totalPrizeAmount / winners.length).toFixed(2) : '0.00'} {getCurrencySymbol()}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Average Prize</div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Winners Table */}
        {winners.length > 0 ? (
          <div className="bg-gray-900/30 border border-gray-700 rounded-xl overflow-hidden">
            {/* Table Header - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-5 gap-4 p-4 bg-gray-900/50 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Wallet Address</span>
              </div>
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-white" />
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Prize Amount</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-pink-400" />
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Round</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Date</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Transaction</span>
              </div>
            </div>

            {/* Winners List */}
            <div className="divide-y divide-gray-700">
              {winners.map((winner, index) => (
                <div
                  key={index}
                  className="md:grid md:grid-cols-5 gap-4 p-3 sm:p-4 hover:bg-gray-800/50 transition-colors"
                >
                  {/* Mobile Layout - Stacked */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30 flex-shrink-0">
                        <span className="text-pink-400 font-bold text-sm">W</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={`https://solscan.io/account/${winner.walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-semibold text-sm hover:text-cyan-400 transition-colors cursor-pointer block truncate"
                          title={winner.walletAddress}
                        >
                          {formatAddress(winner.walletAddress)}
                        </a>
                        <div className="text-xs text-gray-500 font-mono truncate">
                          {winner.walletAddress}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-700/50">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Prize</div>
                        <div className="text-green-400 font-bold text-base">
                          {winner.prizeAmount.toFixed(2)} {getCurrencySymbol()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Round</div>
                        <div className="text-pink-400 font-semibold text-base">
                          #{getRoundNumber(winner.roundId)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Date</div>
                        <div className="text-gray-300 text-xs">
                          {formatDate(winner.timestamp)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTimeSince(winner.timestamp)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Transaction</div>
                        {winner.payoutTransactionSignature ? (
                          <a
                            href={`https://solscan.io/tx/${winner.payoutTransactionSignature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1 text-xs"
                            title="View transaction on Solscan"
                          >
                            <span className="font-mono truncate max-w-[60px]">
                              {winner.payoutTransactionSignature.slice(0, 6)}...
                            </span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-gray-500 text-xs">Pending</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout - Grid */}
                  <div className="hidden md:contents">
                    {/* Wallet Address */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30 flex-shrink-0">
                        <span className="text-pink-400 font-bold text-sm">W</span>
                      </div>
                      <div className="min-w-0">
                        <a
                          href={`https://solscan.io/account/${winner.walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-semibold hover:text-cyan-400 transition-colors cursor-pointer block truncate"
                          title={winner.walletAddress}
                        >
                          {formatAddress(winner.walletAddress)}
                        </a>
                        <div className="text-xs text-gray-500 font-mono truncate">
                          {winner.walletAddress}
                        </div>
                      </div>
                    </div>

                    {/* Prize Amount */}
                    <div className="flex items-center">
                      <div className="text-green-400 font-bold text-lg">
                        {winner.prizeAmount.toFixed(2)} {getCurrencySymbol()}
                      </div>
                    </div>

                    {/* Round */}
                    <div className="flex items-center">
                      <div className="text-pink-400 font-semibold">
                        #{getRoundNumber(winner.roundId)}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center">
                      <div>
                        <div className="text-gray-300 text-sm">
                          {formatDate(winner.timestamp)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTimeSince(winner.timestamp)}
                        </div>
                      </div>
                    </div>

                    {/* Transaction */}
                    <div className="flex items-center">
                      {winner.payoutTransactionSignature ? (
                        <a
                          href={`https://solscan.io/tx/${winner.payoutTransactionSignature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1"
                          title="View transaction on Solscan"
                        >
                          <span className="text-xs font-mono truncate max-w-[100px]">
                            {winner.payoutTransactionSignature.slice(0, 8)}...
                          </span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-500 text-xs">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-900/30 border border-gray-700 rounded-xl">
            <Trophy className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No winners yet</p>
            <p className="text-gray-500 text-sm">Be the first to win the lottery!</p>
          </div>
        )}
      </div>
    </div>
  );
}
