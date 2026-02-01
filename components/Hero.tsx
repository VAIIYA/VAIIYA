export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-metamask-orange/10 text-metamask-orange text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Powered by Solana Blockchain
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif leading-tight">
              Building <span className="text-metamask-orange">Web3</span>
              <br />
              On <span>Solana.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-xl leading-relaxed">
              We craft innovative Web3 experiences on the Solana blockchain.
              Vibe Coding meets blockchain technology. No compromises.
              Just pure innovation and clean code.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#products"
                className="btn-primary inline-flex items-center justify-center"
              >
                Explore Our Products
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="https://github.com/vaiiya"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center justify-center"
              >
                View on GitHub
              </a>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-metamask-orange rounded-3xl opacity-5 blur-3xl"></div>
              <div className="card-vibe p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-metamask-orange flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-metamask-purple">SOLANA</div>
                      <div className="text-xs text-gray-400">Blockchain First</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-metamask-gray-100 rounded-full overflow-hidden relative">
                      <div className="absolute inset-0 bg-metamask-orange w-[80%] rounded-full"></div>
                    </div>
                    <div className="h-2 bg-metamask-gray-100 rounded-full overflow-hidden relative w-3/4">
                      <div className="absolute inset-0 bg-metamask-purple w-[60%] rounded-full"></div>
                    </div>
                    <div className="h-2 bg-metamask-gray-100 rounded-full w-1/2"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-square bg-metamask-gray-50 rounded-2xl border border-metamask-gray-100 transition-all hover:border-metamask-orange/50"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

