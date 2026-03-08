import { useTranslations } from 'next-intl';

export default function CookiePolicy() {
    const t = useTranslations('Footer');

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-metamask-orange/10">
            <main className="max-w-4xl mx-auto px-6 py-20">
                <header className="mb-16">
                    <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight text-metamask-purple">Cookie Policy</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-500 text-sm font-medium">
                        <p>Last updated: <span className="text-metamask-purple">March 2026</span></p>
                        <span className="hidden sm:inline text-gray-200">|</span>
                        <p>Type: <span className="text-metamask-orange">User Disclosure</span></p>
                    </div>
                </header>

                <div className="space-y-16 prose prose-indigo max-w-none">
                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">1. What are Cookies?</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Cookies are small data files stored on your device that help us improve your experience. They allow us
                            to remember your preferences, analyze site performance, and ensure our services function securely.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">2. Types of Cookies We Use</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-metamask-gray-50 border border-metamask-gray-100 rounded-2xl hover:border-metamask-orange/30 transition-colors">
                                <p className="text-metamask-orange font-bold mb-2 uppercase text-xs tracking-wider">Essential</p>
                                <p className="text-sm text-gray-500">Necessary for the website to function. These cannot be disabled.</p>
                            </div>
                            <div className="p-6 bg-metamask-gray-50 border border-metamask-gray-100 rounded-2xl hover:border-metamask-orange/30 transition-colors">
                                <p className="text-metamask-orange font-bold mb-2 uppercase text-xs tracking-wider">Analytics</p>
                                <p className="text-sm text-gray-500">Help us understand how visitors interact with our digital products.</p>
                            </div>
                            <div className="p-6 bg-metamask-gray-50 border border-metamask-gray-100 rounded-2xl hover:border-metamask-orange/30 transition-colors">
                                <p className="text-metamask-orange font-bold mb-2 uppercase text-xs tracking-wider">Functional</p>
                                <p className="text-sm text-gray-500">Used to remember settings like language preferences and themes.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">3. Third-Party Cookies</h2>
                        <p className="text-gray-600 mb-6">We utilize specific third-party analytics tools to measure performance:</p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-metamask-gray-100 rounded-xl bg-metamask-gray-50 hover:bg-white transition-all group">
                                <div>
                                    <p className="font-semibold text-metamask-purple group-hover:text-metamask-orange transition-colors">Google Analytics</p>
                                    <p className="text-xs text-gray-400 italic">Global usage tracking & feature performance</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-metamask-orange ring-4 ring-metamask-orange/10 animate-pulse"></div>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-metamask-gray-100 rounded-xl bg-metamask-gray-50 hover:bg-white transition-all group">
                                <div>
                                    <p className="font-semibold text-metamask-purple group-hover:text-metamask-orange transition-colors">Vercel Analytics</p>
                                    <p className="text-xs text-gray-400 italic">Next.js deployment health & user flow</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-metamask-orange ring-4 ring-metamask-orange/10 animate-pulse"></div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-metamask-orange/5 border border-metamask-orange/10 p-8 rounded-2xl">
                        <h2 className="text-2xl font-serif text-metamask-purple mb-4">4. Manage Your Preferences</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            You can control or opt out of cookies through your browser settings. Most browsers allow you to block
                            cookies or alert you when a cookie is being sent. Note that disabling essential cookies may impact
                            your ability to use certain features.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <span className="px-4 py-2 bg-white rounded-lg text-xs font-medium text-metamask-purple border border-metamask-gray-100 shadow-sm">Chrome Settings</span>
                            <span className="px-4 py-2 bg-white rounded-lg text-xs font-medium text-metamask-purple border border-metamask-gray-100 shadow-sm">Safari Privacy</span>
                            <span className="px-4 py-2 bg-white rounded-lg text-xs font-medium text-metamask-purple border border-metamask-gray-100 shadow-sm">Firefox Preferences</span>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">5. Web3 & Digital Wallets</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Please note that interactions with Web3 wallets (e.g., Phantom, Solflare) do not use traditional HTTP
                            cookies. These wallets utilize local browser storage or secure enclaves to manage cryptographic keys
                            and state. VAIIYA does not have access to your private keys through this storage mechanism.
                        </p>
                    </section>

                    <section className="bg-metamask-purple p-10 rounded-[40px] text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-metamask-orange/5 to-transparent"></div>
                        <h2 className="text-2xl font-serif text-white mb-2 relative z-10">Questions?</h2>
                        <p className="text-purple-100 text-sm mb-8 max-w-sm mx-auto relative z-10">If you have questions about our cookie usage, please contact our privacy team.</p>
                        <a href="mailto:privacy@vaiiya.com" className="px-10 py-4 bg-metamask-orange hover:bg-white hover:text-metamask-orange text-white rounded-2xl font-bold transition-all inline-block shadow-xl shadow-metamask-orange/10 relative z-10">
                            Contact Privacy Team
                        </a>
                    </section>
                </div>
            </main>
        </div>
    );
}
