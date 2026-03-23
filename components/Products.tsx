import { useTranslations } from 'next-intl';

export default function Products() {
  const t = useTranslations('Products');

  const products = [
    {
      id: 'vynder',
      url: 'https://vynder.vercel.app/',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      id: 'nightstudio',
      url: 'https://nightstudio.vercel.app/',
      gradient: 'from-purple-600 to-indigo-600',
    },
    {
      id: 'blobio',
      url: 'https://blobio.vercel.app/',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'fynder',
      url: '/projects/fynder',
      gradient: 'from-blue-500 to-cyan-400',
    },
  ];

  return (
    <section id="products" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif mb-6">
            {t('title')} <span className="text-metamask-purple">{t('titleColored')}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <a
              key={product.id}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative card-vibe overflow-hidden !p-0"
            >
              <div className="p-8 relative z-10 flex flex-col h-full">
                <div className="mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${product.gradient} flex items-center justify-center mb-4 shadow-lg shadow-black/5`}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-serif mb-2 text-gray-900 group-hover:text-metamask-orange transition-colors">
                    {t(`${product.id}.name`)}
                  </h3>
                </div>

                <p className="text-gray-600 mb-8 leading-relaxed flex-grow">
                  {t(`${product.id}.description`)}
                </p>

                <div className="flex items-center text-metamask-orange font-semibold group-hover:gap-2 transition-all mt-auto">
                  {t('visitSite')}
                  <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

