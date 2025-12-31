'use client';

import React from 'react';
import { DollarSign, Clock, Lock, Send, ExternalLink, Twitter, Globe, MessageCircle } from 'lucide-react';

export const CreatorManagement: React.FC = () => {
    return (
        <div className="bg-[#131b26]/60 backdrop-blur-md rounded-2xl border border-white/5 p-6 h-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-inter font-bold text-white">Creator Management</h2>
                <div className="flex gap-2">
                    <button className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-neon-cyan border border-neon-cyan/20 transition-all flex items-center gap-2">
                        Create Token +
                    </button>
                </div>
            </div>

            {/* Fees Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Fees</span>
                    <span className="text-white font-mono">Total: 64.36 USDC</span>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase">Pre-graduation</span>
                            <span className="text-sm font-bold text-white">4.4007 USDC</span>
                        </div>
                        <button className="text-neon-cyan text-xs font-bold hover:underline">Claim</button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase">Post-graduation</span>
                            <span className="text-sm font-bold text-white">59.96 USDC</span>
                        </div>
                        <button className="text-neon-cyan text-xs font-bold hover:underline">Claim</button>
                    </div>
                </div>
            </div>

            {/* Vesting Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Token Vesting Schedule</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Allocation</span>
                        <span className="text-sm font-bold text-white">20% of Total Supply</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Vesting Terms</span>
                        <span className="text-sm font-bold text-white">12 month linear</span>
                    </div>
                </div>
                <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Claimed Amount</span>
                        <span className="text-white font-mono">0.00/20.0M MEME</span>
                    </div>
                    <div className="flex justify-between text-xs items-center">
                        <span className="text-gray-500">Claimable Amount</span>
                        <div className="flex items-center gap-2">
                            <span className="text-neon-cyan font-mono font-bold">9.48M MEME</span>
                            <button className="text-xs font-black bg-neon-cyan/10 hover:bg-neon-cyan/20 px-2 py-0.5 rounded text-neon-cyan border border-neon-cyan/30">CLAIM</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* LP Status */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-orange-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">LP Status</h3>
                </div>
                <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Locked Liquidity</span>
                        <span className="text-white">$323.87 (50% of grad)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Unlock Date</span>
                        <span className="text-white">10 Jul 2026 (191d left)</span>
                    </div>
                </div>
            </div>

            {/* Links Section */}
            <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Links</h3>
                <div className="space-y-2">
                    <div className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3 text-gray-400 group-hover:text-white transition-colors">
                            <Twitter className="w-4 h-4" />
                            <span className="text-sm">Twitter</span>
                        </div>
                        <span className="text-neon-cyan text-xs font-bold uppercase">Add</span>
                    </div>
                    <div className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3 text-gray-400 group-hover:text-white transition-colors">
                            <Globe className="w-4 h-4" />
                            <span className="text-sm">jup.ag</span>
                        </div>
                        <span className="text-gray-500 text-xs font-bold uppercase group-hover:text-neon-cyan transition-colors">Edit</span>
                    </div>
                    <div className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3 text-gray-400 group-hover:text-white transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm">Telegram</span>
                        </div>
                        <span className="text-neon-cyan text-xs font-bold uppercase">Add</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
