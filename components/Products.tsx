const products = [
  {
    name: 'LuckyHaus',
    description: 'Your luck, amplified. Experience the future of chance on Solana.',
    url: 'https://luckyhaus.vercel.app/',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    name: 'MemeHaus',
    description: 'Where jokes print money. Create, mint, and trade memecoins on Solana.',
    url: 'https://memehaus.vercel.app/',
    gradient: 'from-green-500 to-teal-500',
  },
  {
    name: 'VYNDER',
    description: 'Dating on the blockchain. The first Web3 PWA dating app built on Solana.',
    url: 'https://vynder.vercel.app/',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    name: 'NIGHTSTUDIO',
    description: 'Creative digital studio crafting immersive Web3 experiences on Solana.',
    url: 'https://nightstudio.vercel.app/',
    gradient: 'from-purple-600 to-indigo-600',
  },
]

export default function Products() {
  return (
    <section id="products" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif mb-6">
            Our <span className="text-metamask-purple">Products</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Building the future of Web3, one product at a time.
            Each project showcases our commitment to innovation and clean code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <a
              key={product.name}
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
                    {product.name}
                  </h3>
                </div>

                <p className="text-gray-600 mb-8 leading-relaxed flex-grow">
                  {product.description}
                </p>

                <div className="flex items-center text-metamask-orange font-semibold group-hover:gap-2 transition-all mt-auto">
                  Visit Site
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

