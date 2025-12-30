'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Wallet, Coins, Clock } from 'lucide-react';
import { getCurrencySymbol } from '../lib/lottery-config';

interface Winner {
  roundId: string;
  walletAddress: string;
  prizeAmount: number;
  timestamp: number;
  payoutTransactionSignature?: string;
}

export function RecentWinners() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const response = await fetch('/api/lottery?action=recent-winners&limit=7');
        const data = await response.json();
        
        if (data.success && data.winners) {
          // Sort by timestamp descending (most recent first)
          const sortedWinners = [...data.winners].sort((a: Winner, b: Winner) => b.timestamp - a.timestamp);
          setWinners(sortedWinners.slice(0, 7));
        }
      } catch (error) {
        console.error('Error fetching winners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
    // Refresh every 30 seconds to get new winners
    const interval = setInterval(fetchWinners, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatTimeSince = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const getRoundNumber = (roundId: string) => {
    // Extract round number from roundId (e.g., "round-2024-12-19" -> calculate days since epoch)
    const match = roundId.match(/round-(\d{4}-\d{2}-\d{2})/);
    if (match) {
      try {
        // Parse the date string (YYYY-MM-DD)
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
    // Fallback: try to extract number from roundId
    const numMatch = roundId.match(/\d+/);
    return numMatch ? numMatch[0] : '?';
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header - Similar to MemeHaus style */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Recent Winners</h2>
        </div>
        <a
          href="/winners"
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1"
        >
          <span>View All Winners</span>
          <span>→</span>
        </a>
      </div>
      
      <p className="text-sm text-gray-400 mb-6">
        Latest lottery winners with prize amounts and wallet addresses
      </p>

      {/* Column Headers - Hidden on mobile, shown on desktop */}
      <div className="hidden md:grid grid-cols-4 gap-4 mb-3 px-2">
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
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Time Since Win</span>
        </div>
      </div>

      {/* Winners List - Responsive: stacked on mobile, grid on desktop */}
      {winners.length > 0 ? (
        <div className="space-y-3">
          {winners.map((winner, index) => (
            <div
              key={index}
              className="bg-gray-900/50 border border-blue-500/30 rounded-xl p-3 md:p-4 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200"
            >
              {/* Mobile Layout - Stacked */}
              <div className="md:hidden space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30 flex-shrink-0">
                    <span className="text-pink-400 font-bold text-base">W</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={`https://solscan.io/account/${winner.walletAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-semibold text-sm hover:text-cyan-400 transition-colors cursor-pointer block truncate"
                      title={`View ${winner.walletAddress} on Solscan`}
                    >
                      {formatAddress(winner.walletAddress)}
                    </a>
                    <div className="text-xs text-gray-500 font-mono truncate">
                      {winner.walletAddress}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-700/50">
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
                    <div className="text-xs text-gray-400 mb-1">Time</div>
                    <div className="text-gray-300 text-sm">
                      {formatTimeSince(winner.timestamp)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout - Grid */}
              <div className="hidden md:grid grid-cols-4 gap-4 items-center">
                {/* Wallet Address - Left side with icon */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                    <span className="text-pink-400 font-bold text-base">W</span>
                  </div>
                  <div>
                    <a
                      href={`https://solscan.io/account/${winner.walletAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-semibold text-base hover:text-cyan-400 transition-colors cursor-pointer"
                      title={`View ${winner.walletAddress} on Solscan`}
                    >
                      {formatAddress(winner.walletAddress)}
                    </a>
                    <div className="text-xs text-gray-500 font-mono">
                      {winner.walletAddress.slice(0, 12)}...{winner.walletAddress.slice(-8)}
                    </div>
                  </div>
                </div>

                {/* Prize Amount */}
                <div>
                  <div className="text-green-400 font-bold text-lg">
                    {winner.prizeAmount.toFixed(2)} {getCurrencySymbol()}
                  </div>
                </div>

                {/* Round */}
                <div>
                  <div className="text-pink-400 font-semibold text-base">
                    #{getRoundNumber(winner.roundId)}
                  </div>
                </div>

                {/* Time Since */}
                <div>
                  <div className="text-gray-300 text-sm">
                    {formatTimeSince(winner.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-900/30 border border-gray-700 rounded-xl">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No winners yet. Be the first!</p>
        </div>
      )}
    </div>
  );
}

