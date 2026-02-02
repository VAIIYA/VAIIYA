import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function NightStudioPage() {
    return (
        <main className="min-h-screen bg-white text-gray-900">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-24 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#f9f5ff] to-white">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-100 shadow-sm text-purple-600 text-xs font-bold tracking-widest uppercase mb-12">
                        Premium Creator Infrastructure
                    </div>
                    <h1 className="text-6xl sm:text-8xl font-serif mb-12 text-metamask-purple leading-tight">
                        Elevate Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-green-500">Digital Presence.</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-16">
                        NIGHTSTUDIO is a elite social layer for creators who value ownership.
                        Gate your content, build your community, and receive direct Solana payouts
                        without the middleman.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <a href="https://nightstudio.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn-primary px-10">
                            Explore the Studio
                        </a>
                        <a href="https://x.com/vaiiya_media" target="_blank" rel="noopener noreferrer" className="btn-secondary px-10">
                            Partner with Us
                        </a>
                    </div>
                </div>

                {/* Soft Background Elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-200/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-100/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            </section>

            {/* Creator Focus Section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div>
                            <h2 className="text-5xl font-serif mb-10 text-metamask-purple">Built for the Sovereign Creator.</h2>
                            <div className="space-y-12">
                                <div className="group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                        <h3 className="text-2xl font-serif">Gated Excellence</h3>
                                    </div>
                                    <p className="text-gray-500 text-lg">Sophisticated content-gating tools allow you to monetize your influence on your own terms.</p>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                        </div>
                                        <h3 className="text-2xl font-serif">Direct Revenue</h3>
                                    </div>
                                    <p className="text-gray-500 text-lg">Payments are processed instantly on Solana, ensuring 400ms finality from fan to creator.</p>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-metamask-orange/5 rounded-2xl flex items-center justify-center text-metamask-orange group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        </div>
                                        <h3 className="text-2xl font-serif">Deep Connection</h3>
                                    </div>
                                    <p className="text-gray-500 text-lg">Build meaningful relationships through a platform that prioritizes human interaction over algorithms.</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-green-100 blur-[80px] opacity-20"></div>
                            <div className="relative bg-white/80 backdrop-blur-xl border border-white p-12 rounded-[50px] shadow-2xl">
                                <div className="aspect-square bg-[#fdfbff] rounded-[40px] flex items-center justify-center border border-purple-50">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-green-400 rounded-3xl mx-auto mb-6 shadow-xl shadow-purple-200"></div>
                                        <div className="text-3xl font-serif text-metamask-purple mb-2">High Vibe</div>
                                        <p className="text-gray-400 font-medium">Studio Access: GRANTED</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="py-24 bg-metamask-purple text-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-4xl font-serif mb-10">The Vibe of Excellence.</h2>
                    <p className="text-2xl text-purple-100 leading-relaxed italic mb-12">
                        "At NIGHTSTUDIO, we believe that premium software shouldn't just function—it should inspire.
                        By merging elite design with Solana's power, we're setting a new standard for Web3 tools."
                    </p>
                    <div className="h-px w-24 bg-green-400 mx-auto"></div>
                </div>
            </section>

            {/* CTA section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto bg-gradient-to-br from-metamask-gray-50 to-white border border-purple-50 rounded-[60px] p-12 md:p-24 text-center shadow-lg">
                    <h2 className="text-5xl font-serif mb-8 text-metamask-purple">Your Studio Awaits.</h2>
                    <p className="text-xl text-gray-500 mb-12 max-w-xl mx-auto">
                        Step into a more refined social ecosystem. Whether you're a creator or a connoisseur,
                        there's a place for you in the night.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <a href="https://nightstudio.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn-primary px-12 py-5 text-lg">
                            Enter NIGHTSTUDIO
                        </a>
                        <Link href="/projects/vynder" className="btn-secondary px-12 py-5 text-lg">
                            View Vynder
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
