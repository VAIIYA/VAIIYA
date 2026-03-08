import { useTranslations } from 'next-intl';

export default function PrivacyPolicy() {
    const t = useTranslations('Footer');

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-metamask-orange/10">
            <main className="max-w-4xl mx-auto px-6 py-20">
                <header className="mb-16">
                    <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight text-metamask-purple">Privacy Policy</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-500 text-sm font-medium">
                        <p>Last updated: <span className="text-metamask-purple">March 2026</span></p>
                        <span className="hidden sm:inline text-gray-200">|</span>
                        <p>Status: <span className="text-metamask-orange">Published</span></p>
                    </div>
                </header>

                <div className="space-y-16 prose prose-indigo max-w-none">
                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">1. Overview</h2>
                        <p className="text-gray-600 leading-relaxed">
                            At VAIIYA, we take your digital sovereignty seriously. As a studio building Web3 and mobile applications,
                            we are committed to transparency in how we collect and process your data. This policy applies to all
                            products under the VAIIYA umbrella, including FYNDER, VYNDER, LuckyHaus, and our arcade suite.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">2. Data We Collect</h2>
                        <p className="text-gray-600 mb-4 font-medium">We collect information to provide better services and improved user experiences:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                            {[
                                { title: 'Identity Data', desc: 'Name and email address when provided via support or account creation.' },
                                { title: 'Technical Data', desc: 'Device identifiers, IP addresses, and operating system versions.' },
                                { title: 'Usage Data', desc: 'How you interact with our apps, including feature usage and session duration.' },
                                { title: 'Location Data', desc: 'Approximate location for localized services and app compliance.' },
                                { title: 'Blockchain Data', desc: 'Public wallet addresses used for transactions on the Solana network.' }
                            ].map((item, i) => (
                                <li key={i} className="bg-metamask-gray-50 border border-metamask-gray-100 p-4 rounded-xl">
                                    <span className="block text-metamask-orange font-semibold mb-1">{item.title}</span>
                                    <span className="text-sm text-gray-500">{item.desc}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">3. How We Use Data</h2>
                        <p className="text-gray-600 mb-4">Your data is processed based on the following purposes:</p>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 rounded-lg bg-metamask-orange/5 border border-metamask-orange/10">
                                <div className="text-metamask-orange font-bold">01</div>
                                <p className="text-sm text-gray-700">To maintain and optimize our mobile and Web3 applications.</p>
                            </div>
                            <div className="flex gap-4 p-4 rounded-lg bg-metamask-orange/5 border border-metamask-orange/10">
                                <div className="text-metamask-orange font-bold">02</div>
                                <p className="text-sm text-gray-700">To provide customer support and respond to privacy requests.</p>
                            </div>
                            <div className="flex gap-4 p-4 rounded-lg bg-metamask-orange/5 border border-metamask-orange/10">
                                <div className="text-metamask-orange font-bold">03</div>
                                <p className="text-sm text-gray-700">To monitor and prevent fraudulent activities or unauthorized access.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">4. Third-Party Services</h2>
                        <p className="text-gray-600 mb-6">We utilize trusted third-party services that may collect information used to identify you:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { name: 'Google Play', utility: 'Distribution & Analytics' },
                                { name: 'Firebase', utility: 'Authentication & CRM' },
                                { name: 'Solana', utility: 'Public Ledger Transactions' }
                            ].map((svc) => (
                                <div key={svc.name} className="p-4 border border-metamask-gray-100 bg-metamask-gray-50 rounded-lg text-center">
                                    <p className="font-semibold text-metamask-purple">{svc.name}</p>
                                    <p className="text-[10px] uppercase text-gray-400 tracking-wider mt-1">{svc.utility}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">5. Data Storage & Retention</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We store your data only for as long as necessary to provide our services. While we implement
                            industry-standard security measures, please note that information recorded on the Solana
                            blockchain is permanent and immutable.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">6. Your Rights (GDPR & CCPA)</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Depending on your location, you have the right to access, rectify, or delete your personal data.
                            European residents have additional rights under the General Data Protection Regulation (GDPR),
                            and California residents under the California Consumer Privacy Act (CCPA).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">7. Children&apos;s Privacy</h2>
                        <p className="text-gray-600 leading-relaxed">
                            In accordance with the Children&apos;s Online Privacy Protection Act (COPPA), VAIIYA does not
                            knowingly collect any personal information from children under the age of 13. If you believe
                            a child has provided us with personal data, please contact us immediately.
                        </p>
                    </section>

                    <section className="bg-metamask-purple p-8 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-metamask-orange/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-metamask-orange/20 transition-all"></div>
                        <h2 className="text-xl font-semibold text-white mb-4 relative z-10">Contact</h2>
                        <p className="text-purple-100 text-sm mb-4 relative z-10">
                            For any privacy-related inquiries or to exercise your rights, please reach out to our legal team:
                        </p>
                        <a href="mailto:privacy@vaiiya.com" className="text-xl font-mono text-metamask-orange hover:text-white transition-colors relative z-10">
                            privacy@vaiiya.com
                        </a>
                    </section>
                </div>
            </main>
        </div>
    );
}
