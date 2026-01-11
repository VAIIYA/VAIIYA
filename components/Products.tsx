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
    gradient: 'from-solana-purple to-solana-green',
  },
  {
    name: 'NIGHTSTUDIO',
    description: 'Creative digital studio crafting immersive Web3 experiences on Solana.',
    url: 'https://nightstudio.vercel.app/',
    gradient: 'from-indigo-500 to-purple-500',
  },
]

export default function Products() {
  return (
    <section id="products" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-gradient-solana">Our Products</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Building the future of Web3, one product at a time. 
            Each project showcases our commitment to innovation and clean code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <a
              key={product.name}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-solana-purple transition-all duration-300 hover:shadow-2xl overflow-hidden"
            >
              {/* Gradient Background Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className="mb-6">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center mb-4`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 group-hover:text-solana-purple transition-colors">
                    {product.name}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>

                <div className="flex items-center text-solana-purple font-semibold group-hover:gap-2 transition-all">
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


