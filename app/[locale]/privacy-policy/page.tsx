import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30">
            {/* Navigation Header */}
            <header className="border-b border-white/10 px-6 py-6 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-50">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg">V</div>
                        <span className="text-2xl font-serif tracking-tight">VAIIYA</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 font-semibold border border-indigo-500/30 px-3 py-1 rounded-full">
                        Privacy Documentation
                    </span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-20">
                <header className="mb-16">
                    <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">Privacy Policy</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-400 text-sm">
                        <p>Last updated: <span className="text-white">March 2026</span></p>
                        <span className="hidden sm:inline text-white/20">|</span>
                        <p>Status: <span className="text-indigo-400">Published</span></p>
                    </div>
                </header>

                <div className="space-y-16 prose prose-invert prose-indigo max-w-none">
                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">1. Overview</h2>
                        <p className="text-gray-400 leading-relaxed">
                            At VAIIYA, we take your digital sovereignty seriously. As a studio building Web3 and mobile applications,
                            we are committed to transparency in how we collect and process your data. This policy applies to all
                            products under the VAIIYA umbrella, including FYNDER, VYNDER, LuckyHaus, and our arcade suite.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">2. Data We Collect</h2>
                        <p className="text-gray-400 mb-4">We collect information to provide better services and improved user experiences:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                            {[
                                { title: 'Identity Data', desc: 'Name and email address when provided via support or account creation.' },
                                { title: 'Technical Data', desc: 'Device identifiers, IP addresses, and operating system versions.' },
                                { title: 'Usage Data', desc: 'How you interact with our apps, including feature usage and session duration.' },
                                { title: 'Location Data', desc: 'Approximate location for localized services and app compliance.' },
                                { title: 'Blockchain Data', desc: 'Public wallet addresses used for transactions on the Solana network.' }
                            ].map((item, i) => (
                                <li key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                    <span className="block text-indigo-400 font-semibold mb-1">{item.title}</span>
                                    <span className="text-sm text-gray-400">{item.desc}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">3. How We Use Data</h2>
                        <p className="text-gray-400 mb-4">Your data is processed based on the following purposes:</p>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                                <div className="text-indigo-600 font-bold">01</div>
                                <p className="text-sm text-gray-300">To maintain and optimize our mobile and Web3 applications.</p>
                            </div>
                            <div className="flex gap-4 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                                <div className="text-indigo-600 font-bold">02</div>
                                <p className="text-sm text-gray-300">To provide customer support and respond to privacy requests.</p>
                            </div>
                            <div className="flex gap-4 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                                <div className="text-indigo-600 font-bold">03</div>
                                <p className="text-sm text-gray-300">To monitor and prevent fraudulent activities or unauthorized access.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">4. Third-Party Services</h2>
                        <p className="text-gray-400 mb-6">We utilize trusted third-party services that may collect information used to identify you:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { name: 'Google Play', utility: 'Distribution & Analytics' },
                                { name: 'Firebase', utility: 'Authentication & CRM' },
                                { name: 'Solana', utility: 'Public Ledger Transactions' }
                            ].map((svc) => (
                                <div key={svc.name} className="p-4 border border-white/5 rounded-lg text-center">
                                    <p className="font-semibold text-white">{svc.name}</p>
                                    <p className="text-[10px] uppercase text-gray-500 tracking-wider mt-1">{svc.utility}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">5. Data Storage & Retention</h2>
                        <p className="text-gray-400">
                            We store your data only for as long as necessary to provide our services. While we implement
                            industry-standard security measures, please note that information recorded on the Solana
                            blockchain is permanent and immutable.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">6. Your Rights (GDPR & CCPA)</h2>
                        <p className="text-gray-400">
                            Depending on your location, you have the right to access, rectify, or delete your personal data.
                            European residents have additional rights under the General Data Protection Regulation (GDPR),
                            and California residents under the California Consumer Privacy Act (CCPA).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">7. Children's Privacy</h2>
                        <p className="text-gray-400">
                            In accordance with the Children's Online Privacy Protection Act (COPPA), VAIIYA does not
                            knowingly collect any personal information from children under the age of 13. If you believe
                            a child has provided us with personal data, please contact us immediately.
                        </p>
                    </section>

                    <section className="bg-indigo-600/10 border border-indigo-600/20 p-8 rounded-2xl">
                        <h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
                        <p className="text-gray-300 text-sm mb-4">
                            For any privacy-related inquiries or to exercise your rights, please reach out to our legal team:
                        </p>
                        <a href="mailto:privacy@vaiiya.com" className="text-xl font-mono text-indigo-400 hover:text-indigo-300 transition-colors">
                            privacy@vaiiya.com
                        </a>
                    </section>
                </div>

                <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <Link href="/" className="group text-indigo-400 hover:text-white transition-colors flex items-center gap-2">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        Back to VAIIYA Home
                    </Link>
                    <p className="text-xs text-gray-600 uppercase tracking-widest">Amsterdam, Netherlands</p>
                </div>
            </main>

            <footer className="max-w-4xl mx-auto px-6 pb-20 text-[10px] text-gray-700 text-center uppercase tracking-tighter">
                © 2026 VAIIYA. All Rights Reserved. Crafted with Precision.
            </footer>
        </div>
    );
}
