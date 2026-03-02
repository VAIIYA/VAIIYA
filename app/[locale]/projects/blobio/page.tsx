import Footer from '@/components/Footer'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server';

export default async function BlobioPage() {
    const t = await getTranslations('BlobioPage');

    return (
        <main className="min-h-screen bg-white text-gray-900">

            {/* Hero Section */}
            <section className="relative pt-24 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#f5f9ff] to-white">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 shadow-sm text-blue-600 text-xs font-bold tracking-widest uppercase mb-12">
                        {t('premiumSub')}
                    </div>
                    <h1 className="text-6xl sm:text-8xl font-serif mb-12 text-metamask-purple leading-tight">
                        {t('titleStart')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{t('titleEnd')}</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-16">
                        {t('description')}
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <a href="https://blobio.vercel.app" target="_blank" rel="noopener noreferrer" className="btn-primary px-10">
                            {t('exploreStudio')}
                        </a>
                        <a href="https://x.com/VAIIYA_MEDIA" target="_blank" rel="noopener noreferrer" className="btn-secondary px-10">
                            {t('partnerUs')}
                        </a>
                    </div>
                </div>

                {/* Soft Background Elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-200/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-100/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            </section>

            {/* Creator Focus Section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div>
                            <h2 className="text-5xl font-serif mb-10 text-metamask-purple">{t('sovereignTitle')}</h2>
                            <div className="space-y-12">
                                <div className="group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                        <h3 className="text-2xl font-serif">{t('gatedTitle')}</h3>
                                    </div>
                                    <p className="text-gray-500 text-lg">{t('gatedDesc')}</p>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                        </div>
                                        <h3 className="text-2xl font-serif">{t('directTitle')}</h3>
                                    </div>
                                    <p className="text-gray-500 text-lg">{t('directDesc')}</p>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-metamask-orange/5 rounded-2xl flex items-center justify-center text-metamask-orange group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        </div>
                                        <h3 className="text-2xl font-serif">{t('deepTitle')}</h3>
                                    </div>
                                    <p className="text-gray-500 text-lg">{t('deepDesc')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 blur-[80px] opacity-20"></div>
                            <div className="relative bg-white/80 backdrop-blur-xl border border-white p-12 rounded-[50px] shadow-2xl">
                                <div className="aspect-square bg-[#fdfbff] rounded-[40px] flex items-center justify-center border border-blue-50">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl mx-auto mb-6 shadow-xl shadow-blue-200"></div>
                                        <div className="text-3xl font-serif text-metamask-purple mb-2">{t('vibeTitle')}</div>
                                        <p className="text-gray-400 font-medium">{t('vibeStatus')}</p>
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
                        {t('philosophyQuote')}
                    </p>
                    <div className="h-px w-24 bg-cyan-400 mx-auto"></div>
                </div>
            </section>

            {/* CTA section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto bg-gradient-to-br from-metamask-gray-50 to-white border border-blue-50 rounded-[60px] p-12 md:p-24 text-center shadow-lg">
                    <h2 className="text-5xl font-serif mb-8 text-metamask-purple">{t('ctaTitle')}</h2>
                    <p className="text-xl text-gray-500 mb-12 max-w-xl mx-auto">
                        {t('ctaDesc')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <a href="https://blobio.vercel.app" target="_blank" rel="noopener noreferrer" className="btn-primary px-12 py-5 text-lg">
                            {t('enterStudio')}
                        </a>
                        <Link href="/projects/vynder" className="btn-secondary px-12 py-5 text-lg">
                            {t('viewVynder')}
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
