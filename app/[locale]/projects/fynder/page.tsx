import Footer from '@/components/Footer'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server';

export default async function FynderPage() {
    const t = await getTranslations('FynderProjectPage');

    return (
        <main className="min-h-screen bg-white selection:bg-metamask-orange selection:text-white">

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-metamask-gray-50/30">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-blue-50 text-blue-600 text-sm font-bold border border-blue-100 uppercase tracking-widest">
                            {t('titleStart')} {t('titleEnd')}
                        </div>
                        <h1 className="text-6xl sm:text-8xl font-serif mb-12 leading-tight text-metamask-purple">
                            {t('titleStart')} <br />
                            <span className="text-metamask-orange">{t('titleEnd')}</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-16">
                            {t('description')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="btn-primary flex items-center justify-center gap-3 px-8">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.523 15.3414C17.0211 15.3414 16.6148 15.7477 16.6148 16.2496V17.523C16.6148 18.0249 17.0211 18.4312 17.523 18.4312C18.0249 18.4312 18.4312 18.0249 18.4312 17.523V16.2496C18.4312 15.7477 18.0249 15.3414 17.523 15.3414Z" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M3.56164 11.2329C3.56164 6.58284 7.33144 2.81304 11.9815 2.81304C16.6316 2.81304 20.4014 6.58284 20.4014 11.2329V15.7444L11.9815 15.7444L3.56164 15.7444V11.2329ZM11.9815 1.00003C6.33144 1.00003 1.7486 5.58287 1.7486 11.2329V17.5574H22.2144V11.2329C22.2144 5.58287 17.6316 1.00003 11.9815 1.00003Z" />
                                    <path d="M6.43982 15.3414C5.93792 15.3414 5.53162 15.7477 5.53162 16.2496V17.523C5.53162 18.0249 5.93792 18.4312 6.43982 18.4312C6.94172 18.4312 7.34802 18.0249 7.34802 17.523V16.2496C7.34802 15.7477 6.94172 15.3414 6.43982 15.3414Z" />
                                </svg>
                                <span>{t('downloadApp')}</span>
                            </button>
                            <Link href="/" className="btn-secondary">
                                {t('viewProjects')}
                            </Link>
                        </div>
                        <p className="mt-6 text-sm text-gray-400 font-medium">
                            {t('comingSoon')}
                        </p>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-metamask-orange/5 rounded-full blur-[120px]"></div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-y border-metamask-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="card-vibe border-none bg-blue-50/50 p-10">
                            <div className="text-4xl font-serif text-blue-600 mb-2">50,000+</div>
                            <div className="text-gray-500 uppercase tracking-widest text-xs font-bold">{t('stat1')}</div>
                        </div>
                        <div className="card-vibe border-none bg-purple-50 p-10">
                            <div className="text-4xl font-serif text-metamask-purple mb-2">1.2M+</div>
                            <div className="text-gray-500 uppercase tracking-widest text-xs font-bold">{t('stat2')}</div>
                        </div>
                        <div className="card-vibe border-none bg-orange-50 p-10">
                            <div className="text-4xl font-serif text-metamask-orange mb-2">250k+</div>
                            <div className="text-gray-500 uppercase tracking-widest text-xs font-bold">{t('stat3')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="max-w-xl">
                            <h2 className="text-5xl font-serif mb-10 text-metamask-purple">{t('philosophyTitle')}</h2>
                            <div className="space-y-12">
                                <div className="group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                        </div>
                                        <h3 className="text-2xl font-serif">{t('feat1Title')}</h3>
                                    </div>
                                    <p className="text-gray-500 text-lg leading-relaxed">{t('feat1Desc')}</p>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-metamask-orange/5 rounded-2xl flex items-center justify-center text-metamask-orange group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                        </div>
                                        <h3 className="text-2xl font-serif">{t('feat2Title')}</h3>
                                    </div>
                                    <p className="text-gray-500 text-lg leading-relaxed">{t('feat2Desc')}</p>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-metamask-purple group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <h3 className="text-2xl font-serif">{t('feat3Title')}</h3>
                                    </div>
                                    <p className="text-gray-500 text-lg leading-relaxed">{t('feat3Desc')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-orange-100 blur-[80px] opacity-20"></div>
                            <div className="relative bg-white/80 backdrop-blur-xl border border-white p-12 rounded-[50px] shadow-2xl">
                                <div className="aspect-[9/16] bg-gray-900 rounded-[40px] overflow-hidden border-[8px] border-gray-800 shadow-inner relative">
                                    {/* Mock UI */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center p-6">
                                            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-3xl mx-auto mb-6 shadow-xl shadow-blue-500/20"></div>
                                            <h4 className="text-white text-2xl font-serif mb-2">FYNDER</h4>
                                            <p className="text-blue-200 text-sm font-medium tracking-widest uppercase">{t('titleEnd')}</p>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-10 left-6 right-6 space-y-3">
                                        <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full w-2/3 bg-blue-400"></div>
                                        </div>
                                        <div className="h-2 w-1/2 bg-white/10 rounded-full"></div>
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
                    <h2 className="text-4xl font-serif mb-10">{t('philosophyTitle')}</h2>
                    <p className="text-2xl text-purple-100 leading-relaxed italic mb-12">
                        {t('philosophyP1')}
                    </p>
                    <div className="h-px w-24 bg-blue-400 mx-auto"></div>
                </div>
            </section>

            {/* CTA section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto bg-gradient-to-br from-metamask-gray-50 to-white border border-blue-50 rounded-[60px] p-12 md:p-24 text-center shadow-lg">
                    <h2 className="text-5xl font-serif mb-8 text-metamask-purple">{t('ctaTitle')}</h2>
                    <p className="text-xl text-gray-500 mb-12 max-w-xl mx-auto leading-relaxed">
                        {t('ctaDesc')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button className="btn-primary px-12 py-5 text-lg">
                            {t('downloadApp')}
                        </button>
                        <Link href="/" className="btn-secondary px-12 py-5 text-lg">
                            {t('viewProjects')}
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
