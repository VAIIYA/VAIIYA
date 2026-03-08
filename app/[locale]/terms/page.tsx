import { useTranslations } from 'next-intl';

export default function TermsOfService() {
    const t = useTranslations('Footer');

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30">
            <main className="max-w-4xl mx-auto px-6 py-20">
                <header className="mb-16">
                    <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">Terms of Service</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-400 text-sm">
                        <p>Last updated: <span className="text-white">March 2026</span></p>
                        <span className="hidden sm:inline text-white/20">|</span>
                        <p>Jurisdiction: <span className="text-indigo-400">Netherlands</span></p>
                    </div>
                </header>

                <div className="space-y-16 prose prose-invert prose-indigo max-w-none">
                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-400 leading-relaxed">
                            By accessing or using the services provided by VAIIYA (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you agree to be bound by these
                            Terms of Service. If you do not agree to these terms, you must not access or use our applications,
                            websites, or any other digital products.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">2. Description of Services</h2>
                        <p className="text-gray-400">
                            VAIIYA is a digital studio specializing in the development of Web3 applications on the Solana blockchain,
                            Android mobile applications, and high-performance web projects. Our suite of products includes but is not
                            limited to FYNDER, VYNDER, LuckyHaus, MemeHaus, BLOBIO, HUNTER84, Dollar Milkshake, and NIGHTSTUDIO.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">3. User Responsibilities</h2>
                        <p className="text-gray-400 mb-4">Users of VAIIYA products are responsible for:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 ml-2">
                            <li>Maintaining the confidentiality of their digital wallets and private keys.</li>
                            <li>Ensuring all activities performed under their account comply with applicable laws.</li>
                            <li>Providing accurate information when required for service functionality.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">4. Prohibited Conduct</h2>
                        <p className="text-gray-400 mb-4">You agree not to engage in any of the following activities:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                'Attempting to reverse engineer or decompile any VAIIYA software.',
                                'Exploiting smart contracts or protocol vulnerabilities.',
                                'Using our services for money laundering or illegal financing.',
                                'Engaging in harassment or harmful behavior within community features.'
                            ].map((text, i) => (
                                <div key={i} className="flex gap-3 text-sm text-gray-400">
                                    <span className="text-indigo-500">✕</span>
                                    {text}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">5. Intellectual Property</h2>
                        <p className="text-gray-400">
                            All content, code, designs, logos, and brands, including the names of our various products (e.g., FYNDER,
                            LuckyHaus), are the exclusive property of VAIIYA. You are granted a limited, non-exclusive license to use
                            our products for their intended purposes only.
                        </p>
                    </section>

                    <section className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-xl">
                        <h2 className="text-2xl font-serif text-white mb-4 flex items-center gap-2">
                            <span className="text-orange-500">⚠️</span> Blockchain Disclaimer
                        </h2>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            VAIIYA provides interfaces for decentralized protocols. Users assume all financial risks associated with
                            blockchain transactions. We do not control the Solana network and are not responsible for transaction
                            failures, gas fees, or smart contract exploits beyond our control. Users are solely responsible for
                            verifying the accuracy of their on-chain interactions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">6. Limitation of Liability</h2>
                        <p className="text-gray-400 italic">
                            &quot;VAIIYA shall not be liable for any indirect, incidental, or consequential damages arising from the use
                            of our services, including but not limited to loss of digital assets or service interruptions.&quot;
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">7. Termination</h2>
                        <p className="text-gray-400">
                            We reserve the right to suspend or terminate your access to our services at our sole discretion, without
                            notice, for behavior that violates these terms or threatens the security of our ecosystem.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-indigo-600 pl-4">8. Governing Law</h2>
                        <p className="text-gray-400">
                            These terms are governed by and construed in accordance with the laws of the **Netherlands**. Any
                            disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Amsterdam.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
