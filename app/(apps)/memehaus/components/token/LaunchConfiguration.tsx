'use client';

import React from 'react';
import { Target, ShieldCheck, Info } from 'lucide-react';

export const LaunchConfiguration: React.FC = () => {
    return (
        <div className="bg-[#131b26]/60 backdrop-blur-md rounded-2xl border border-white/5 p-6 space-y-6">
            <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-neon-blue" />
                <h2 className="text-lg font-inter font-bold text-white">Launch Configuration</h2>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Initial Market Cap</span>
                    <span className="text-sm font-bold text-white">1K USDC</span>
                </div>

                <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Graduation Market Cap</span>
                    <span className="text-sm font-bold text-white">3K USDC</span>
                </div>

                <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Anti-Sniping Protection</span>
                        <Info className="w-3 h-3 text-gray-600" />
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Enabled</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
