import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function VynderPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-orange-500 selection:text-white">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center">
                        <h1 className="text-7xl sm:text-9xl font-serif mb-12 leading-none tracking-tighter">
                            Dating. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-500 to-blue-600">On-Chain.</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-16">
                            The first Web3-native dating experience. Your wallet is your identity. Your interactions are your legacy.
                            No app stores. No borders. Just connections.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <a href="https://vynder.vercel.app/" target="_blank" rel="noopener noreferrer" className="px-10 py-5 bg-orange-600 text-white rounded-full font-bold uppercase tracking-widest text-sm hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20">
                                Launch PWA
                            </a>
                            <a href="https://x.com/vaiiya_media" target="_blank" rel="noopener noreferrer" className="px-10 py-5 bg-white/5 text-white rounded-full font-bold uppercase tracking-widest text-sm border border-white/10 hover:bg-white/10 transition-all">
                                The Community
                            </a>
                        </div>
                    </div>
                </div>

                {/* Animated Gradient Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] opacity-20 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-900/40 via-blue-900/20 to-transparent"></div>
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[100px] animate-pulse transition-all delay-500"></div>
                </div>
            </section>

            {/* Identity Section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="relative aspect-[9/16] max-w-[320px] mx-auto bg-[#1a1a1a] rounded-[50px] border-[8px] border-white/10 shadow-2xl overflow-hidden p-6 flex flex-col justify-end">
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10"></div>
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop')] bg-cover bg-center"></div>
                                <div className="relative z-20 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold">Sarah, 24</span>
                                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm">Passionate about Web3 and long hikes. Let&apos;s build something cool.</p>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-white/10 rounded-md text-[10px] uppercase font-bold tracking-widest text-orange-500">Music</span>
                                        <span className="px-2 py-1 bg-white/10 rounded-md text-[10px] uppercase font-bold tracking-widest text-blue-500">Tech</span>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative Elements */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-600/20 rounded-full blur-xl animate-bounce"></div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600/20 rounded-full blur-xl animate-bounce transition-all delay-700"></div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <h2 className="text-5xl font-serif mb-10">Beyond the Swipe.</h2>
                            <div className="space-y-8">
                                <div className="flex gap-6">
                                    <div className="w-10 h-10 shrink-0 border border-orange-500/30 rounded-full flex items-center justify-center font-mono text-orange-500">01</div>
                                    <div>
                                        <h3 className="text-xl font-medium mb-2">Wallet-Centric Identity</h3>
                                        <p className="text-gray-400">No passwords or emails. Connect your Solana wallet and step into a world of verified interactions.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-10 h-10 shrink-0 border border-blue-500/30 rounded-full flex items-center justify-center font-mono text-blue-500">02</div>
                                    <div>
                                        <h3 className="text-xl font-medium mb-2">PWA Liberty</h3>
                                        <p className="text-gray-400">Available on any platform instantly. Vynder bypasses traditional gatekeepers to prioritize user privacy and freedom.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-10 h-10 shrink-0 border border-red-500/30 rounded-full flex items-center justify-center font-mono text-red-500">03</div>
                                    <div>
                                        <h3 className="text-xl font-medium mb-2">Social-First, Tech-Driven</h3>
                                        <p className="text-gray-400">Built using the core principles of Vibe Coding—optimized for flow, connection, and long-term ecosystem health.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Quote Section */}
            <section className="py-24 bg-zinc-950">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-3xl sm:text-4xl font-serif leading-relaxed italic text-gray-300">
                        &quot;In a world of bots and noise, Vynder uses the blockchain to foster genuine, high-vibe human connection.&quot;
                    </p>
                    <div className="mt-12 h-px w-20 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto"></div>
                </div>
            </section>

            {/* CTA section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative bg-gradient-to-br from-[#111] to-[#050505] rounded-[60px] p-12 md:p-24 border border-white/5 text-center overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-[100px]-translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10">
                            <h2 className="text-5xl font-serif mb-8">Ready to find your vibe?</h2>
                            <p className="text-xl text-gray-500 mb-12 max-w-xl mx-auto">
                                Join our private beta and be among the first to experience the future of Web3 social interaction.
                            </p>
                            <div className="flex flex-wrap justify-center gap-6">
                                <a href="https://vynder.vercel.app/" target="_blank" rel="noopener noreferrer" className="px-12 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform">
                                    Enter Vynder
                                </a>
                                <Link href="/" className="px-12 py-5 bg-white/5 text-white rounded-full font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">
                                    More Projects
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
