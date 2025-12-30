import Link from 'next/link';
import { Gamepad2, Rocket, ArrowRight } from 'lucide-react';

export default function PortalPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="max-w-4xl w-full text-center space-y-12">

                {/* Hero Section */}
                <div className="space-y-6">
                    <h1 className="text-6xl md:text-8xl font-orbitron font-black tracking-tight">
                        <span className="bg-gradient-to-r from-neon-pink via-purple-500 to-neon-cyan bg-clip-text text-transparent animate-pulse">
                            VAIIYA
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light">
                        The next-generation Solana Super App. <br />
                        <span className="text-white font-medium">Play, Trade, and Create</span> in one unified ecosystem.
                    </p>
                </div>

                {/* App Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    {/* LuckyHaus Card */}
                    <Link href="/luckyhaus" className="group relative overflow-hidden rounded-3xl bg-gray-900/40 border border-gray-800 hover:border-neon-pink/50 transition-all duration-500 hover:shadow-2xl hover:shadow-neon-pink/20 p-8 text-left">
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 flex flex-col h-full justify-between space-y-8">
                            <div className="p-4 bg-gray-800/50 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500">
                                <Gamepad2 className="w-12 h-12 text-neon-pink" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-orbitron font-bold text-white group-hover:text-neon-pink transition-colors">LuckyHaus</h2>
                                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                    Provably fair on-chain lottery. Buy tickets, win the pot.
                                </p>
                            </div>

                            <div className="flex items-center text-neon-pink font-medium group-hover:translate-x-2 transition-transform">
                                Play Now <ArrowRight className="ml-2 w-4 h-4" />
                            </div>
                        </div>
                    </Link>

                    {/* MemeHaus Card */}
                    <Link href="/memehaus" className="group relative overflow-hidden rounded-3xl bg-gray-900/40 border border-gray-800 hover:border-neon-cyan/50 transition-all duration-500 hover:shadow-2xl hover:shadow-neon-cyan/20 p-8 text-left">
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 flex flex-col h-full justify-between space-y-8">
                            <div className="p-4 bg-gray-800/50 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500">
                                <Rocket className="w-12 h-12 text-neon-cyan" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-orbitron font-bold text-white group-hover:text-neon-cyan transition-colors">MemeHaus</h2>
                                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                    Launch your dream token in seconds. Bonding curves & auto-liquidity.
                                </p>
                            </div>

                            <div className="flex items-center text-neon-cyan font-medium group-hover:translate-x-2 transition-transform">
                                Launch App <ArrowRight className="ml-2 w-4 h-4" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Footer */}
                <div className="pt-12 text-gray-600 text-sm">
                    Powered by Solana • VAIIYA Ecosystem
                </div>
            </div>
        </div>
    );
}
