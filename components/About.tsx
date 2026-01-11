export default function About() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-solana-purple/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-gradient-solana">Web3 Native.</span>
            <br />
            <span className="text-gray-800">Vibe Coding.</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We build innovative Web3 applications on Solana. Every line of code 
            is crafted with passion, precision, and a deep understanding of blockchain technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Blockchain First */}
          <div className="bg-white rounded-2xl p-8 border border-solana-purple/20 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 rounded-xl bg-gradient-solana flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-solana-purple">Blockchain First</h3>
            <p className="text-gray-600 leading-relaxed">
              Built on Solana. Your wallet is your identity. No middlemen. 
              Just pure blockchain technology powering every interaction.
            </p>
          </div>

          {/* Vibe Coding */}
          <div className="bg-white rounded-2xl p-8 border border-solana-green/20 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 rounded-xl bg-gradient-solana-reverse flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-solana-green">Vibe Coding</h3>
            <p className="text-gray-600 leading-relaxed">
              Clean code. Modern architecture. Developer experience matters. 
              We code with passion and build with purpose.
            </p>
          </div>

          {/* Solana Speed */}
          <div className="bg-white rounded-2xl p-8 border border-solana-purple/20 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 rounded-xl bg-gradient-solana flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-solana-purple">Lightning Fast</h3>
            <p className="text-gray-600 leading-relaxed">
              Solana speed. Sub-second finality. Scalable infrastructure. 
              Experience the future of blockchain performance.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}


