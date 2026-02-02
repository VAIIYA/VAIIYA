import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function LuckyHausPage() {
    return (
        <main className="min-h-screen bg-white selection:bg-metamask-orange selection:text-white">
            <Header />

            {/* Hero Section */}
            <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-metamask-gray-50/30">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-purple-50 text-purple-600 text-sm font-bold border border-purple-100 animate-pulse">
                            Next Draw in 08:24:12
                        </div>
                        <h1 className="text-6xl sm:text-8xl font-serif mb-8 leading-tight text-metamask-purple">
                            Fortune Favors <br />
                            <span className="text-metamask-orange">The Bold.</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-12">
                            The ultimate daily USDC lottery on Solana. One winner. One pot. Zero complexity.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="https://luckyhaus.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn-primary">
                                Enter Next Draw
                            </a>
                            <Link href="/about" className="btn-secondary">
                                Learn the Vibe
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-metamask-orange/5 rounded-full blur-[120px]"></div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-y border-metamask-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="card-vibe border-none bg-metamask-gray-50 p-10">
                            <div className="text-4xl font-serif text-metamask-purple mb-2">$14,250+</div>
                            <div className="text-gray-500 uppercase tracking-widest text-xs font-bold">Total Prizes Won</div>
                        </div>
                        <div className="card-vibe border-none bg-purple-50 p-10">
                            <div className="text-4xl font-serif text-purple-600 mb-2">2,482</div>
                            <div className="text-gray-500 uppercase tracking-widest text-xs font-bold">Lucky Wallets</div>
                        </div>
                        <div className="card-vibe border-none bg-orange-50 p-10">
                            <div className="text-4xl font-serif text-metamask-orange mb-2">1,200+</div>
                            <div className="text-gray-500 uppercase tracking-widest text-xs font-bold">Daily Draws</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 to-orange-100 rounded-[44px] blur-2xl opacity-50"></div>
                            <div className="relative bg-white rounded-[38px] p-12 border border-metamask-gray-100 shadow-xl">
                                <div className="space-y-8">
                                    <div className="flex items-start gap-6">
                                        <div className="w-12 h-12 shrink-0 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-medium text-metamask-purple mb-2">USDC Driven</h3>
                                            <p className="text-gray-600">Stabilized rewards. No volatile tokens, just pure USDC straight to your wallet.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-6">
                                        <div className="w-12 h-12 shrink-0 bg-metamask-orange/5 rounded-xl flex items-center justify-center text-metamask-orange shadow-sm">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-medium text-metamask-purple mb-2">Verifiably Fair</h3>
                                            <p className="text-gray-600">Every draw is permanent and public on the Solana blockchain. Trust through transparency.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-6">
                                        <div className="w-12 h-12 shrink-0 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 shadow-sm">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-medium text-metamask-purple mb-2">Solana Speed</h3>
                                            <p className="text-gray-600">Interactive UI that updates in real-time. Feel the pulse of the lottery as it happens.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="max-w-xl">
                            <h2 className="text-4xl font-serif mb-8 text-metamask-purple">Redefining the Gamble.</h2>
                            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                <p>
                                    LuckyHaus isn&apos;t just a lottery; it&apos;s a social experiment in high-stakes transparency.
                                    By leveraging Solana&apos;s sub-second finality, we&apos;ve created a platform that feels alive.
                                </p>
                                <p>
                                    Built with the core VAIIYA philosophy of Vibe Coding, LuckyHaus strips away the friction of
                                    legacy gaming platforms. Connect, enter, and win.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-metamask-gray-50/50">
                <div className="max-w-5xl mx-auto rounded-[50px] overflow-hidden relative bg-metamask-purple text-white shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-metamask-purple to-metamask-purple/90"></div>
                    <div className="relative z-10 p-12 md:p-20 text-center">
                        <h2 className="text-4xl font-serif mb-4 text-white">Your Wallet, Your Luck.</h2>
                        <p className="text-xl text-purple-100 mb-10 max-w-xl mx-auto italic">
                            &quot;The pot is growing. Are you in the Haus?&quot;
                        </p>
                        <a href="https://luckyhaus.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn-primary-white">
                            Join LuckyHaus Now
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>

    )
}
