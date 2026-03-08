import { useTranslations } from 'next-intl';

export default function CookiePolicy() {
    const t = useTranslations('Footer');

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30">
            <main className="max-w-4xl mx-auto px-6 py-20">
                <header className="mb-16">
                    <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">Cookie Policy</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-400 text-sm">
                        <p>Last updated: <span className="text-white">March 2026</span></p>
                        <span className="hidden sm:inline text-white/20">|</span>
                        <p>Type: <span className="text-indigo-400">User Disclosure</span></p>
                    </div>
                </header>

                <div className="space-y-16 prose prose-invert prose-indigo max-w-none">
                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">1. What are Cookies?</h2>
                        <p className="text-gray-400 leading-relaxed">
                            Cookies are small data files stored on your device that help us improve your experience. They allow us
                            to remember your preferences, analyze site performance, and ensure our services function securely.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">2. Types of Cookies We Use</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                                <p className="text-indigo-400 font-bold mb-2 uppercase text-xs tracking-wider">Essential</p>
                                <p className="text-sm text-gray-400">Necessary for the website to function. These cannot be disabled.</p>
                            </div>
                            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                                <p className="text-indigo-400 font-bold mb-2 uppercase text-xs tracking-wider">Analytics</p>
                                <p className="text-sm text-gray-400">Help us understand how visitors interact with our digital products.</p>
                            </div>
                            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                                <p className="text-indigo-400 font-bold mb-2 uppercase text-xs tracking-wider">Functional</p>
                                <p className="text-sm text-gray-400">Used to remember settings like language preferences and themes.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">3. Third-Party Cookies</h2>
                        <p className="text-gray-400 mb-6">We utilize specific third-party analytics tools to measure performance:</p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-white/5 rounded-lg bg-indigo-500/5">
                                <div>
                                    <p className="font-semibold text-white">Google Analytics</p>
                                    <p className="text-xs text-gray-500 italic">Global usage tracking & feature performance</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-white/5 rounded-lg bg-indigo-500/5">
                                <div>
                                    <p className="font-semibold text-white">Vercel Analytics</p>
                                    <p className="text-xs text-gray-500 italic">Next.js deployment health & user flow</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-indigo-600/5 border border-indigo-600/10 p-8 rounded-2xl">
                        <h2 className="text-2xl font-serif text-white mb-4">4. Manage Your Preferences</h2>
                        <p className="text-gray-400 mb-6">
                            You can control or opt out of cookies through your browser settings. Most browsers allow you to block
                            cookies or alert you when a cookie is being sent. Note that disabling essential cookies may impact
                            your ability to use certain features.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <span className="px-3 py-1 bg-white/5 rounded text-[10px] text-indigo-300 border border-white/10">Chrome Settings</span>
                            <span className="px-3 py-1 bg-white/5 rounded text-[10px] text-indigo-300 border border-white/10">Safari Privacy</span>
                            <span className="px-3 py-1 bg-white/5 rounded text-[10px] text-indigo-300 border border-white/10">Firefox Preferences</span>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">5. Web3 & Digital Wallets</h2>
                        <p className="text-gray-400">
                            Please note that interactions with Web3 wallets (e.g., Phantom, Solflare) do not use traditional HTTP
                            cookies. These wallets utilize local browser storage or secure enclaves to manage cryptographic keys
                            and state. VAIIYA does not have access to your private keys through this storage mechanism.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center">
                        <h2 className="text-lg font-semibold text-white mb-2">Questions?</h2>
                        <p className="text-gray-400 text-sm mb-6">If you have questions about our cookie usage, please contact us.</p>
                        <a href="mailto:privacy@vaiiya.com" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-all inline-block">
                            privacy@vaiiya.com
                        </a>
                    </section>
                </div>
            </main>
        </div>
    );
}
