'use client';

import React from 'react';
import { Twitter, Video, FileText, Pin, Edit3, Trash2 } from 'lucide-react';

export const CreatorNotes: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-inter font-bold text-white">Creator Notes</h2>
                <div className="flex gap-2">
                    <div className="bg-[#131b26] border border-white/10 rounded-xl p-1 flex gap-1">
                        <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all"><Twitter className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all"><Video className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all"><FileText className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* Note Card */}
            <div className="bg-[#131b26]/60 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white">E</div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                                Epfm...5fb3
                                <span className="text-[10px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded uppercase">Owner</span>
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="text-gray-500 hover:text-white"><Pin className="w-4 h-4" /></button>
                        <button className="text-gray-500 hover:text-white"><Edit3 className="w-4 h-4" /></button>
                        <button className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* Content - Hardcoded youtube style as per reference image */}
                <div className="p-6">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-4">
                        <img
                            src="https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
                            alt="Video thumbnail"
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        This is the official RickRoll for the MemeHaus Studio launch! Stay tuned for more updates and keep holding.
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-black/20 flex items-center justify-between text-[11px] text-gray-500 uppercase tracking-widest">
                    <span>Jul 9, 2025, 11:37 PM</span>
                </div>
            </div>
        </div>
    );
};
