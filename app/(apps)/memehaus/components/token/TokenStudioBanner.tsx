'use client';

import React from 'react';
import { Share2, Edit2, Twitter, Check } from 'lucide-react';

interface TokenStudioBannerProps {
    name: string;
    symbol: string;
    imageUrl?: string;
    mintAddress: string;
    graduated?: boolean;
}

export const TokenStudioBanner: React.FC<TokenStudioBannerProps> = ({
    name,
    symbol,
    imageUrl,
    mintAddress,
    graduated = false,
}) => {
    return (
        <div className="relative w-full rounded-2xl overflow-hidden border border-gray-700/50 bg-black/40 mb-6 group">
            {/* Background Banner - Premium Gradient or Placeholder */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-gray-900 via-blue-900/50 to-purple-900/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                {/* Banner Action Button (Studio style) */}
                <button className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-lg backdrop-blur-md border border-white/10 transition-all">
                    <Edit2 className="w-4 h-4 text-white/70" />
                </button>
            </div>

            {/* Profile Section */}
            <div className="relative px-6 pb-6 pt-16 md:pt-20">
                {/* Token Avatar - Offset into banner */}
                <div className="absolute -top-16 left-6 md:-top-20 md:left-10">
                    <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-[#0b111a] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden shadow-2xl relative">
                        {imageUrl ? (
                            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-gradient-to-br from-neon-pink to-neon-purple text-white">
                                {symbol[0]}
                            </div>
                        )}
                        <button className="absolute bottom-0 right-0 p-1.5 bg-black/60 hover:bg-black/80 rounded-full border border-white/20 m-1 backdrop-blur-sm transition-all">
                            <Edit2 className="w-3 h-3 text-white/80" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl md:text-4xl font-inter font-black text-white">{name}</h1>
                            {graduated && (
                                <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs font-bold border border-green-500/30">
                                    <Check className="w-3 h-3" />
                                    GRADUATED
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 font-mono text-sm md:text-lg mb-4">
                            <span>${symbol}</span>
                            <span className="text-gray-600">|</span>
                            <span className="truncate max-w-[150px] md:max-w-none">{mintAddress}</span>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex flex-col">
                                <span className="text-2xl md:text-3xl font-orbitron font-bold text-white">$407.83</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Market Cap</span>
                            </div>
                            <div className="w-px h-10 bg-gray-800 self-center hidden sm:block"></div>
                            <div className="flex flex-col">
                                <span className="text-2xl md:text-3xl font-orbitron font-bold text-white">$327.73</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Liquidity</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[180px]">
                        <button className="w-full py-2.5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all group/btn">
                            <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                            <span>Connect & link X</span>
                        </button>
                        <div className="flex gap-2">
                            <button className="flex-1 py-2 px-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-white/5 text-gray-400 transition-all flex items-center justify-center gap-2 text-sm">
                                <Share2 className="w-4 h-4" /> Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
