import { useTranslations } from 'next-intl';

export default function TermsOfService() {
    const t = useTranslations('Footer');

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-metamask-orange/10">
            <main className="max-w-4xl mx-auto px-6 py-20">
                <header className="mb-16">
                    <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight text-metamask-purple">Terms of Service</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-500 text-sm font-medium">
                        <p>Last updated: <span className="text-metamask-purple">March 2026</span></p>
                        <span className="hidden sm:inline text-gray-200">|</span>
                        <p>Jurisdiction: <span className="text-metamask-orange">Netherlands</span></p>
                    </div>
                </header>

                <div className="space-y-16 prose prose-indigo max-w-none">
                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-600 leading-relaxed">
                            By accessing or using the services provided by VAIIYA (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you agree to be bound by these
                            Terms of Service. If you do not agree to these terms, you must not access or use our applications,
                            websites, or any other digital products.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">2. Description of Services</h2>
                        <p className="text-gray-600 leading-relaxed">
                            VAIIYA is a digital studio specializing in the development of Web3 applications on the Solana blockchain,
                            Android mobile applications, and high-performance web projects. Our suite of products includes but is not
                            limited to FYNDER, VYNDER, LuckyHaus, MemeHaus, BLOBIO, HUNTER84, Dollar Milkshake, and NIGHTSTUDIO.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">3. User Responsibilities</h2>
                        <p className="text-gray-600 mb-4 font-medium">Users of VAIIYA products are responsible for:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
                            <li>Maintaining the confidentiality of their digital wallets and private keys.</li>
                            <li>Ensuring all activities performed under their account comply with applicable laws.</li>
                            <li>Providing accurate information when required for service functionality.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">4. Prohibited Conduct</h2>
                        <p className="text-gray-600 mb-4">You agree not to engage in any of the following activities:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                'Attempting to reverse engineer or decompile any VAIIYA software.',
                                'Exploiting smart contracts or protocol vulnerabilities.',
                                'Using our services for money laundering or illegal financing.',
                                'Engaging in harassment or harmful behavior within community features.'
                            ].map((text, i) => (
                                <div key={i} className="flex gap-3 text-sm text-gray-500 bg-metamask-gray-50 p-3 rounded-lg border border-metamask-gray-100">
                                    <span className="text-metamask-orange font-bold">✕</span>
                                    {text}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">5. Intellectual Property</h2>
                        <p className="text-gray-600 leading-relaxed">
                            All content, code, designs, logos, and brands, including the names of our various products (e.g., FYNDER,
                            LuckyHaus), are the exclusive property of VAIIYA. You are granted a limited, non-exclusive license to use
                            our products for their intended purposes only.
                        </p>
                    </section>

                    <section className="bg-metamask-gray-50 border border-metamask-orange/20 p-8 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-metamask-orange/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"></div>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-4 flex items-center gap-2 relative z-10">
                            <span className="text-metamask-orange">⚠️</span> Blockchain Disclaimer
                        </h2>
                        <p className="text-gray-600 text-sm leading-relaxed relative z-10">
                            VAIIYA provides interfaces for decentralized protocols. Users assume all financial risks associated with
                            blockchain transactions. We do not control the Solana network and are not responsible for transaction
                            failures, gas fees, or smart contract exploits beyond our control. Users are solely responsible for
                            verifying the accuracy of their on-chain interactions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">6. Limitation of Liability</h2>
                        <p className="text-gray-500 italic leading-relaxed">
                            &quot;VAIIYA shall not be liable for any indirect, incidental, or consequential damages arising from the use
                            of our services, including but not limited to loss of digital assets or service interruptions.&quot;
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-metamask-purple mb-6 border-l-4 border-metamask-orange pl-4">7. Termination</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We reserve the right to suspend or terminate your access to our services at our sole discretion, without
                            notice, for behavior that violates these terms or threatens the security of our ecosystem.
                        </p>
                    </section>

                    <section className="bg-metamask-purple p-8 rounded-2xl">
                        <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-metamask-orange pl-4">8. Governing Law</h2>
                        <p className="text-purple-100 leading-relaxed">
                            These terms are governed by and construed in accordance with the laws of the **Netherlands**. Any
                            disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Amsterdam.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
