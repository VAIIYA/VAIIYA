import Footer from '@/components/Footer'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server';

export default async function DollarMilkshakePage() {
    const t = await getTranslations('DollarMilkshakePage');

    return (
        <main className="min-h-screen bg-white selection:bg-metamask-orange selection:text-white">

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-metamask-gray-50/30">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-purple-50 text-metamask-purple text-sm font-bold border border-purple-100 italic">
                            🥤 {t('titleStart')} {t('titleEnd')}
                        </div>
                        <h1 className="text-6xl sm:text-8xl font-serif mb-12 leading-tight text-metamask-purple">
                            {t('titleStart')} <br />
                            <span className="text-metamask-orange">{t('titleEnd')}</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-16">
                            {t('description')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="https://dollarmilkshake.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center justify-center gap-2">
                                <span>{t('launchDca')}</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </a>
                            <Link href="/progress" className="btn-secondary">
                                {t('viewOther')}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-metamask-purple/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-metamask-orange/5 rounded-full blur-[120px]"></div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-y border-metamask-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="card-vibe border-none bg-metamask-gray-50 p-10">
                            <div className="text-4xl font-serif text-metamask-purple mb-2">15,000+</div>
                            <div className="text-gray-500 uppercase tracking-widest text-xs font-bold">{t('stat1')}</div>
                        </div>
                        <div className="card-vibe border-none bg-purple-50 p-10">
                            <div className="text-4xl font-serif text-metamask-purple mb-2">2,500+</div>
                            <div className="text-gray-500 uppercase tracking-widest text-xs font-bold">{t('stat2')}</div>
                        </div>
                        <div className="card-vibe border-none bg-orange-50 p-10">
                            <div className="text-4xl font-serif text-metamask-orange mb-2">8,200+</div>
                            <div className="text-gray-500 uppercase tracking-widest text-xs font-bold">{t('stat3')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 to-orange-100 rounded-[44px] blur-2xl opacity-50"></div>
                            <div className="relative bg-white rounded-[38px] p-12 border border-metamask-gray-100 shadow-xl">
                                <div className="space-y-12">
                                    <div className="flex items-start gap-6">
                                        <div className="w-12 h-12 shrink-0 bg-purple-50 rounded-xl flex items-center justify-center text-metamask-purple shadow-sm">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-medium text-metamask-purple mb-2">{t('feat1Title')}</h3>
                                            <p className="text-gray-600 leading-relaxed">{t('feat1Desc')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-6">
                                        <div className="w-12 h-12 shrink-0 bg-metamask-orange/5 rounded-xl flex items-center justify-center text-metamask-orange shadow-sm text-2xl">
                                            🪐
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-medium text-metamask-purple mb-2">{t('feat2Title')}</h3>
                                            <p className="text-gray-600 leading-relaxed">{t('feat2Desc')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-6">
                                        <div className="w-12 h-12 shrink-0 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 shadow-sm">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-medium text-metamask-purple mb-2">{t('feat3Title')}</h3>
                                            <p className="text-gray-600 leading-relaxed">{t('feat3Desc')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="max-w-xl">
                            <h2 className="text-4xl font-serif mb-8 text-metamask-purple">{t('philosophyTitle')}</h2>
                            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                <p>
                                    {t('philosophyP1')}
                                </p>
                                <p>
                                    {t('philosophyP2')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quote Section */}
            <section className="py-24 bg-metamask-purple text-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <p className="text-3xl sm:text-4xl font-serif leading-relaxed italic text-purple-100">
                        &quot;{t('ctaDesc')}&quot;
                    </p>
                    <div className="mt-12 h-px w-24 bg-metamask-orange mx-auto"></div>
                </div>
            </section>

            {/* CTA section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-metamask-gray-50/50">
                <div className="max-w-5xl mx-auto rounded-[50px] overflow-hidden relative bg-white border border-metamask-gray-100 shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-metamask-orange/5 rounded-full blur-3xl"></div>
                    <div className="relative z-10 p-12 md:p-20 text-center">
                        <h2 className="text-4xl font-serif mb-6 text-metamask-purple">{t('ctaTitle')}</h2>
                        <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto italic">
                            {t('ctaDesc')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="https://dollarmilkshake.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn-primary px-10">
                                {t('launchDca')}
                            </a>
                            <Link href="/" className="btn-secondary px-10">
                                {t('viewOther')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
