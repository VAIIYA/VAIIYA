'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Coins, BarChart3 } from 'lucide-react';

interface TokenStatsProps {
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  totalSupply: string;
}

export const TokenStats: React.FC<TokenStatsProps> = ({
  price,
  priceChange24h,
  marketCap,
  volume24h,
  holders,
  totalSupply,
}) => {
  const formatValue = (value: number) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return '$0.00';
    if (price < 0.000001) {
      return price.toExponential(2);
    } else if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(2)}`;
    }
  };

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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {/* Price */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <DollarSign className="w-4 h-4 text-neon-cyan" />
          <span className="text-xs text-gray-400">Price</span>
        </div>
        <div className="text-lg font-bold">{formatPrice(price)}</div>
        {priceChange24h !== 0 && (
          <div
            className={`text-xs mt-1 flex items-center space-x-1 ${
              priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {priceChange24h >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {priceChange24h >= 0 ? '+' : ''}
              {priceChange24h.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Market Cap */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <BarChart3 className="w-4 h-4 text-neon-purple" />
          <span className="text-xs text-gray-400">Market Cap</span>
        </div>
        <div className="text-lg font-bold">{formatValue(marketCap)}</div>
      </div>

      {/* 24h Volume */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <BarChart3 className="w-4 h-4 text-neon-pink" />
          <span className="text-xs text-gray-400">24h Volume</span>
        </div>
        <div className="text-lg font-bold">{formatValue(volume24h)}</div>
      </div>

      {/* 24h Change */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
        <div className="flex items-center space-x-2 mb-2">
          {priceChange24h >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
          <span className="text-xs text-gray-400">24h Change</span>
        </div>
        <div
          className={`text-lg font-bold ${
            priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {priceChange24h >= 0 ? '+' : ''}
          {priceChange24h.toFixed(2)}%
        </div>
      </div>

      {/* Holders */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Users className="w-4 h-4 text-neon-cyan" />
          <span className="text-xs text-gray-400">Holders</span>
        </div>
        <div className="text-lg font-bold">{holders.toLocaleString()}</div>
      </div>

      {/* Total Supply */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Coins className="w-4 h-4 text-neon-purple" />
          <span className="text-xs text-gray-400">Supply</span>
        </div>
        <div className="text-lg font-bold">{formatLargeNumber(totalSupply)}</div>
      </div>
    </div>
  );
};

