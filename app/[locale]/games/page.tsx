import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export default async function GamesPage() {
  const t = await getTranslations('GamesPage');

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-metamask-gray-50 border-b border-metamask-gray-100 overflow-hidden">
        <div className="absolute top-0 right-0 -transtale-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-metamask-purple/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 transtale-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-metamask-orange/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-serif text-metamask-purple mb-6">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* KLAPPY Game Card */}
          <div className="group relative bg-white rounded-3xl border border-metamask-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
            <div className="relative aspect-video overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-metamask-purple/10 to-metamask-orange/10 group-hover:scale-105 transition-transform duration-500"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
                <span className="text-8xl">🐦</span>
              </div>
            </div>
            <div className="p-8 flex-grow flex flex-col">
              <h3 className="text-2xl font-serif text-metamask-purple mb-3">
                {t('klappyName')}
              </h3>
              <p className="text-gray-600 mb-6 flex-grow">
                {t('klappyDesc')}
              </p>
              <div className="mt-auto">
                <a
                  href="https://klappy.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-metamask-purple text-white font-medium hover:bg-metamask-purple-dark transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-metamask-purple/20"
                >
                  {t('playGame')}
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* KETRIS Game Card */}
          <div className="group relative bg-white rounded-3xl border border-metamask-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
            <div className="relative aspect-video overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 group-hover:scale-105 transition-transform duration-500"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
                <span className="text-8xl">🧱</span>
              </div>
            </div>
            <div className="p-8 flex-grow flex flex-col">
              <h3 className="text-2xl font-serif text-metamask-purple mb-3">
                {t('ketrisName')}
              </h3>
              <p className="text-gray-600 mb-6 flex-grow">
                {t('ketrisDesc')}
              </p>
              <div className="mt-auto">
                <a
                  href="https://kawaiitetris.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-metamask-purple text-white font-medium hover:bg-metamask-purple-dark transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-metamask-purple/20"
                >
                  {t('playGame')}
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Placeholder for future games */}
          <div className="relative rounded-3xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-8 text-center opacity-60">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0-6H6" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium font-serif italic text-lg">Next Game Loading...</p>
          </div>
        </div>
      </section>
    </main>
  );
}
