import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function MemeHausPage() {
    return (
        <main className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-metamask-gray-50/30">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-metamask-orange text-sm font-bold mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>
                                LIVE ON SOLANA MAINNET
                            </div>
                            <h1 className="text-5xl sm:text-7xl font-serif mb-8 text-metamask-purple leading-tight">
                                Where Jokes <br />
                                <span className="text-metamask-orange">Print Money.</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                                The ultimate launchpad for the next generation of culture-defining memecoins.
                                Fast, fair, and verifiably viral.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href="https://memehaus.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center justify-center gap-2">
                                    <span>Start Minting</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </a>
                                <a href="https://x.com/VAIIYA_MEDIA" target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center justify-center">
                                    Join the Community
                                </a>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-solana opacity-10 blur-3xl rounded-full"></div>
                            <div className="relative border-4 border-metamask-purple/5 bg-white p-2 rounded-[40px] shadow-2xl overflow-hidden shadow-orange-500/10">
                                <div className="bg-metamask-purple text-white p-8 rounded-[32px]">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="font-serif text-2xl">MemeHaus Dashboard</div>
                                        <div className="text-xs font-mono bg-white/10 px-2 py-1 rounded">CONNECTED_WALLET: 7vhY...9Pq1</div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <div className="text-gray-400 text-xs mb-1">YOUR KICKBACKS</div>
                                            <div className="text-2xl font-serif text-solana-green">24.5 SOL</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <div className="text-gray-400 text-xs mb-1">TOKENS CREATED</div>
                                                <div className="text-xl font-serif">12</div>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <div className="text-gray-400 text-xs mb-1">VOL. GENERATED</div>
                                                <div className="text-xl font-serif">$1.2M</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Kickback Mechanism */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-serif mb-6 text-metamask-purple">The 10% Kickback</h2>
                    <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                        We believe in rewarding the creators who build our ecosystem. That&apos;s why MemeHaus implements
                        a native kickback mechanism. Every transaction generates a protocol fee, and a significant portion
                        is instantly routed back to the creator and early adopters.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card-vibe border-metamask-orange/20">
                            <div className="text-3xl font-serif text-metamask-orange mb-2">Fair Launch</div>
                            <p className="text-sm text-gray-500">No team tokens. No presale. 100% fair launch for every meme created.</p>
                        </div>
                        <div className="card-vibe border-purple-500/20">
                            <div className="text-3xl font-serif text-metamask-purple mb-2">Instant Mint</div>
                            <p className="text-sm text-gray-500">Go from idea to live trading in under 60 seconds on Solana.</p>
                        </div>
                        <div className="card-vibe border-solana-green/20">
                            <div className="text-3xl font-serif text-solana-green mb-2">Auto-LP</div>
                            <p className="text-sm text-gray-500">Liquidity is automatically locked to ensure a safe environment for traders.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Degen Professional Quote */}
            <section className="py-24 bg-metamask-purple text-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-5xl font-serif italic mb-8">&quot;Built forDegens, Engineered for Reality.&quot;</h2>
                    <div className="h-px w-24 bg-metamask-orange mx-auto mb-8"></div>
                    <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                        MemeHaus is a prime example of VAIIYA&apos;s &quot;Vibe Coding&quot; in action. We&apos;ve taken the chaotic energy of the
                        meme markets and built a robust, high-performance financial tool that doesn&apos;t compromise on fun.
                    </p>
                </div>
            </section>

            {/* CTA section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-metamask-gray-50/50">
                <div className="max-w-7xl mx-auto bg-white border border-metamask-gray-100 rounded-[50px] p-12 md:p-20 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-metamask-orange/5 rounded-full blur-3xl"></div>
                    <div className="relative z-10 text-center">
                        <h2 className="text-4xl font-serif mb-6 text-metamask-purple">Make History. Make Memes.</h2>
                        <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto">
                            Join the hundreds of creators who are already printing their legacy on MemeHaus.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="https://memehaus.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn-primary">
                                Launch App
                            </a>
                            <Link href="/" className="btn-secondary">
                                All VAIIYA Projects
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
