import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export default async function AppsPage() {
  const t = await getTranslations('AppsPage');

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

      {/* Apps Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder for future apps */}
          <div className="md:col-span-3 h-64 relative rounded-3xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0-6H6" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium font-serif italic text-lg opacity-60">High-Vibe Applications are Under Construction</p>
          </div>
        </div>
      </section>
    </main>
  );
}
