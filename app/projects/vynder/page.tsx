import Footer from '@/components/Footer'
import Link from 'next/link'

export default function VynderPage() {
    return (
        <main className="min-h-screen bg-white selection:bg-metamask-orange selection:text-white">

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-metamask-gray-50/30">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-metamask-orange text-sm font-bold mb-8">
                            STILL IN PRIVATE BETA
                        </div>
                        <h1 className="text-6xl sm:text-8xl font-serif mb-12 leading-none text-metamask-purple">
                            Dating. <br />
                            <span className="text-metamask-orange">On-Chain.</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-16">
                            The first Web3-native dating experience. Your wallet is your identity. Your interactions are your legacy.
                            No app stores. No borders. Just connections.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <a href="https://vynder.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn-primary">
                                Launch PWA
                            </a>
                            <a href="https://x.com/VAIIYA_MEDIA" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                                Join the Community
                            </a>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-metamask-orange/5 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl opacity-50"></div>
            </section>

            {/* Identity Section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="relative aspect-[9/16] max-w-[320px] mx-auto bg-white rounded-[50px] border-[12px] border-metamask-gray-100 shadow-2xl overflow-hidden shadow-metamask-orange/10">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop')] bg-cover bg-center"></div>
                                <div className="absolute bottom-8 left-8 right-8 z-20 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-white">Sarah, 24</span>
                                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                                        </div>
                                    </div>
                                    <p className="text-gray-200 text-sm">Passionate about Web3 and long hikes. Let&apos;s build something cool.</p>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] uppercase font-bold tracking-widest text-white">Music</span>
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] uppercase font-bold tracking-widest text-white">Tech</span>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative Elements */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-metamask-orange/10 rounded-full blur-xl animate-pulse"></div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600/10 rounded-full blur-xl animate-pulse delay-700"></div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <h2 className="text-5xl font-serif mb-10 text-metamask-purple">Beyond the Swipe.</h2>
                            <div className="space-y-8">
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 shrink-0 bg-metamask-orange/10 rounded-2xl flex items-center justify-center font-mono text-metamask-orange font-bold">01</div>
                                    <div>
                                        <h3 className="text-xl font-medium mb-2 text-metamask-purple">Wallet-Centric Identity</h3>
                                        <p className="text-gray-600">No passwords or emails. Connect your Solana wallet and step into a world of verified interactions.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 shrink-0 bg-metamask-purple/10 rounded-2xl flex items-center justify-center font-mono text-metamask-purple font-bold">02</div>
                                    <div>
                                        <h3 className="text-xl font-medium mb-2 text-metamask-purple">PWA Liberty</h3>
                                        <p className="text-gray-600">Available on any platform instantly. Vynder bypasses traditional gatekeepers to prioritize user privacy and freedom.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 shrink-0 bg-blue-600/10 rounded-2xl flex items-center justify-center font-mono text-blue-600 font-bold">03</div>
                                    <div>
                                        <h3 className="text-xl font-medium mb-2 text-metamask-purple">Social-First, Tech-Driven</h3>
                                        <p className="text-gray-600">Built using the core principles of Vibe Coding—optimized for flow, connection, and long-term ecosystem health.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Quote Section */}
            <section className="py-24 bg-metamask-purple text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-3xl sm:text-4xl font-serif leading-relaxed italic text-purple-100">
                        &quot;In a world of bots and noise, Vynder uses the blockchain to foster genuine, high-vibe human connection.&quot;
                    </p>
                    <div className="mt-12 h-px w-24 bg-metamask-orange mx-auto"></div>
                </div>
            </section>

            {/* CTA section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 bg-metamask-gray-50/50">
                <div className="max-w-7xl mx-auto">
                    <div className="relative bg-white rounded-[60px] p-12 md:p-24 border border-metamask-gray-100 text-center overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-metamask-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10">
                            <h2 className="text-5xl font-serif mb-8 text-metamask-purple">Ready to find your vibe?</h2>
                            <p className="text-xl text-gray-600 mb-12 max-w-xl mx-auto">
                                Join our private beta and be among the first to experience the future of Web3 social interaction.
                            </p>
                            <div className="flex flex-wrap justify-center gap-6">
                                <a href="https://vynder.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn-primary">
                                    Enter Vynder
                                </a>
                                <Link href="/" className="btn-secondary">
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
