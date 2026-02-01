import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
    return (
        <main className="min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center">
                        <h1 className="text-5xl sm:text-7xl font-serif mb-8 leading-tight">
                            Crafting High-Vibe <br />
                            <span className="text-metamask-orange">Web3 Applications.</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            VAIIYA is a creative studio at the intersection of AI, blockchain, and culture.
                            We don't just write code; we curate experiences through Vibe Coding.
                        </p>
                    </div>
                </div>

                {/* Background Decorative Element */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-metamask-orange/5 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-metamask-purple/5 rounded-full blur-3xl opacity-50"></div>
            </section>

            {/* What is Vibe Coding? */}
            <section className="py-24 bg-metamask-gray-50/50 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-serif mb-6">What is Vibe Coding?</h2>
                            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                <p>
                                    Vibe Coding represents a paradigm shift in software development. Coined by Andrej Karpathy,
                                    it's the practice of using advanced AI to bridge the gap between human intent and machine execution.
                                </p>
                                <p>
                                    At VAIIYA, we've embraced this fully. We act as creative directors, guiding powerful AI agents
                                    to manifest complex decentralized applications at the speed of thought. This isn't just about efficiency;
                                    it's about maintaining a higher level of creative flow—the "vibe"—throughout the entire building process.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-metamask-purple to-metamask-orange rounded-3xl opacity-10 blur-2xl absolute inset-0 transform rotate-3"></div>
                            <div className="relative bg-white border border-metamask-gray-100 p-8 rounded-3xl shadow-xl">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                </div>
                                <div className="space-y-4 font-mono text-sm uppercase tracking-wider text-metamask-purple/60">
                                    <div className="flex gap-4">
                                        <span className="text-metamask-orange">01</span>
                                        <span>Initialize Vision</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="text-metamask-orange">02</span>
                                        <span>Set Neural Parameters</span>
                                    </div>
                                    <div className="flex gap-4 pl-4 border-l border-metamask-gray-100">
                                        <span>- Architecture: Modular</span>
                                    </div>
                                    <div className="flex gap-4 pl-4 border-l border-metamask-gray-100">
                                        <span>- Network: Solana Mainnet</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="text-metamask-orange">03</span>
                                        <span>Execute Vibe Check...</span>
                                    </div>
                                    <div className="flex gap-4 text-metamask-orange animate-pulse">
                                        <span>> Status: High Vibe Detected</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Solana Advantage */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-serif mb-16">Why Solana?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card-vibe p-10">
                            <div className="w-14 h-14 bg-solana-purple/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <svg className="w-8 h-8 text-solana-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium mb-4">Unmatched Speed</h3>
                            <p className="text-gray-600">400ms block times mean your users never have to wait. Real-time interaction for real-world impact.</p>
                        </div>

                        <div className="card-vibe p-10">
                            <div className="w-14 h-14 bg-solana-green/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <svg className="w-8 h-8 text-solana-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium mb-4">Low Cost</h3>
                            <p className="text-gray-600">Fraction-of-a-cent fees make Web3 accessible to everyone, enabling mass-adoption use cases.</p>
                        </div>

                        <div className="card-vibe p-10">
                            <div className="w-14 h-14 bg-metamask-orange/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <svg className="w-8 h-8 text-metamask-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium mb-4">Ecosystem</h3>
                            <p className="text-gray-600">A thriving community of builders and innovators pushing the boundaries of what's possible on-chain.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Process */}
            <section className="py-24 bg-metamask-purple text-white px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-serif mb-8 text-white">The VAIIYA Vision</h2>
                    <p className="text-xl text-purple-100 leading-relaxed mb-12">
                        "We believe the future of software isn't just about functional utility, but about how it makes you feel.
                        By combining AI-augmented development with strong product intuition, we create Web3 tools that feel
                        like magic."
                    </p>
                    <div className="h-px w-24 bg-metamask-orange mx-auto mb-12"></div>
                    <div className="flex flex-wrap justify-center gap-8 italic text-purple-200">
                        <span>#VibeCoding</span>
                        <span>#Solana</span>
                        <span>#Web3Native</span>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-metamask-gray-50 rounded-[40px] p-8 md:p-16 text-center border border-metamask-gray-100">
                        <h2 className="text-4xl font-serif mb-6">Ready to join the vibe?</h2>
                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                            Explore our products or reach out to see how we can bring your Web3 vision to life.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/" className="btn-primary">
                                View Projects
                            </Link>
                            <a href="https://x.com/VaiiyaMedia" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                                Follow @VaiiyaMedia
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
