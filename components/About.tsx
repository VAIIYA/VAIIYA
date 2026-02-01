export default function About() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif mb-6">
            Web3 Native.
            <br />
            <span className="text-metamask-orange">Vibe Coding.</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We build innovative Web3 applications on Solana. Every line of code
            is crafted with passion, precision, and a deep understanding of blockchain technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Blockchain First */}
          <div className="card-vibe">
            <div className="w-16 h-16 rounded-2xl bg-metamask-purple/5 border border-metamask-purple/10 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-metamask-purple" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif mb-4 text-metamask-purple">Blockchain First</h3>
            <p className="text-gray-600 leading-relaxed">
              Built on Solana. Your wallet is your identity. No middlemen.
              Just pure blockchain technology powering every interaction.
            </p>
          </div>

          {/* Vibe Coding */}
          <div className="card-vibe">
            <div className="w-16 h-16 rounded-2xl bg-metamask-orange/5 border border-metamask-orange/10 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-metamask-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif mb-4 text-metamask-orange">Vibe Coding</h3>
            <p className="text-gray-600 leading-relaxed">
              Clean code. Modern architecture. Developer experience matters.
              We code with passion and build with purpose.
            </p>
          </div>

          {/* Solana Speed */}
          <div className="card-vibe">
            <div className="w-16 h-16 rounded-2xl bg-metamask-purple/5 border border-metamask-purple/10 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-metamask-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif mb-4 text-metamask-purple">Lightning Fast</h3>
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

