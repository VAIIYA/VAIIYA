'use client';

import React, { memo } from 'react';
import { Coins, Gift, Users, Clock } from 'lucide-react';

interface TokenCardProps {
  token: {
    name: string;
    symbol: string;
    totalSupply: string;
    communityDistribution: string;
    distributionRecipients: number;
    timeSinceLaunch: string;
    creatorWallet: string;
  };
}

export const TokenCard = memo<TokenCardProps>(({ token }) => {
  return (
    <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-neon-blue/50 transition-all duration-300 hover:shadow-glow-blue">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-neon-pink to-neon-purple rounded-full flex items-center justify-center font-orbitron font-bold text-lg">
            {token.symbol[0]}
          </div>
          <div>
            <h4 className="font-inter font-bold text-lg">{token.name}</h4>
            <p className="text-gray-400 font-mono">${token.symbol}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <Coins className="w-4 h-4 text-neon-cyan" />
            <span className="font-semibold">{token.totalSupply}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Gift className="w-4 h-4 text-neon-purple" />
            <span className="text-neon-purple font-semibold">{token.communityDistribution}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-neon-pink" />
            <span className="text-neon-pink font-semibold">{token.distributionRecipients}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">{token.timeSinceLaunch}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

TokenCard.displayName = 'TokenCard';
