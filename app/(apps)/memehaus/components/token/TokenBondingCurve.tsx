'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface TokenBondingCurveProps {
    progress: number; // 0 to 100
    graduated?: boolean;
}

export const TokenBondingCurve: React.FC<TokenBondingCurveProps> = ({
    progress,
    graduated = false
}) => {
    return (
        <div className="bg-[#131b26]/60 backdrop-blur-md rounded-2xl border border-white/5 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${!graduated ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>1</div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${!graduated ? 'text-neon-cyan' : 'text-gray-500'}`}>Bonding</span>
                    <span className="text-[10px] text-gray-600 underline">Pool ↗</span>
                </div>

                {/* Progress Bar Container */}
                <div className="flex-1 px-4 relative">
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${graduated ? 'bg-green-400' : 'bg-gradient-to-r from-neon-cyan to-neon-purple'}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    {graduated && (
                        <div className="absolute -top-1 right-3">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${graduated ? 'bg-green-500 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                        {graduated ? <CheckCircle2 className="w-5 h-5" /> : '✓'}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${graduated ? 'text-green-400' : 'text-gray-500'}`}>Graduated</span>
                    <span className="text-[10px] text-gray-600 underline">Pool ↗</span>
                </div>
            </div>
        </div>
    );
};
