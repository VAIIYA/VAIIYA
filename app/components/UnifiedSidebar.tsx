'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, Rocket, Repeat, Wallet } from 'lucide-react';

export function UnifiedSidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', icon: Home, href: '/' },
        { name: 'LuckyHaus', icon: Gamepad2, href: '/lucky' },
        { name: 'MemeHaus', icon: Rocket, href: '/meme' },
        { name: 'Swap', icon: Repeat, href: '/meme/swap' }, // Using MemeHaus swap for now
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-20 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-6 z-50 hidden md:flex">
            {/* Brand Icon */}
            <div className="mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-neon-pink to-neon-blue rounded-xl flex items-center justify-center shadow-lg shadow-neon-purple/20">
                    <span className="font-orbitron font-bold text-lg text-white">V</span>
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 flex flex-col space-y-4 w-full px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                group relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300
                ${isActive
                                    ? 'bg-gray-800 text-neon-cyan shadow-glow-cyan'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}
              `}
                        >
                            <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'animate-pulse' : ''}`} />
                            <span className="text-[10px] font-inter">{item.name}</span>

                            {/* Tooltip (optional, showing on hover) */}
                            <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                                {item.name}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto">
                <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all">
                    <Wallet className="w-6 h-6" />
                </button>
            </div>
        </aside>
    );
}
