import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('Hero');

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white overflow-hidden py-20">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-metamask-orange/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-metamask-purple/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-metamask-orange/10 text-metamask-orange text-sm font-medium animate-fade-in">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              {t('poweredBy')}
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif leading-[1.1] tracking-tight text-metamask-purple">
              {t('titleStart')} <br />
              <span className="text-metamask-orange italic font-light">{t('titleColored')}</span>
              <br />
              {t('titleEnd')}
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 max-w-xl leading-relaxed font-light">
              {t('description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <a
                href="#products"
                className="btn-primary inline-flex items-center justify-center px-8 py-4 text-lg"
              >
                {t('exploreProducts')}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="https://github.com/vaiiya"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center justify-center px-8 py-4 text-lg border-metamask-purple/20 text-metamask-purple hover:bg-metamask-purple/5"
              >
                {t('viewGithub')}
              </a>
            </div>
          </div>

          {/* Right Visual - Multi-Platform Showcase - Full Hero Vibe */}
          <div className="relative group hidden lg:block h-[600px]">
            <div className="absolute inset-0 bg-metamask-orange/5 rounded-3xl blur-3xl" />

            <div className="relative h-full w-full">
              {/* Browser Window Mockup (Web/Web3) */}
              <div className="absolute top-10 right-0 w-[500px] h-[350px] bg-white rounded-2xl shadow-3xl border border-metamask-gray-100 overflow-hidden transform transition-all duration-700 hover:-translate-y-4 hover:rotate-1 z-20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)]">
                <div className="bg-metamask-gray-50 border-b border-metamask-gray-100 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="bg-white border border-metamask-gray-100 rounded px-3 py-1 flex-1 mx-4 text-[10px] text-gray-400 font-mono items-center flex justify-between">
                    vaiiya.vercel.app
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-4 w-1/3 bg-metamask-purple/10 rounded-full" />
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="aspect-video bg-metamask-orange/5 rounded-xl border border-metamask-orange/10 flex flex-col items-center justify-center p-4">
                      <div className="text-[20px] font-bold text-metamask-orange tracking-widest mb-1">Web3</div>
                      <div className="h-1 w-8 bg-metamask-orange/20 rounded-full" />
                    </div>
                    <div className="aspect-video bg-metamask-purple/5 rounded-xl border border-metamask-purple/10 flex flex-col items-center justify-center p-4">
                      <div className="text-[20px] font-bold text-metamask-purple tracking-widest mb-1">Apps</div>
                      <div className="h-1 w-8 bg-metamask-purple/20 rounded-full" />
                    </div>
                  </div>
                  <div className="h-2 w-full bg-metamask-gray-50 rounded-full" />
                  <div className="h-2 w-full bg-metamask-gray-50 rounded-full" />
                  <div className="h-2 w-3/4 bg-metamask-gray-50 rounded-full" />
                </div>
              </div>

              {/* Android Phone Mockup (Apps) */}
              <div className="absolute bottom-10 left-10 w-[240px] aspect-[9/19] bg-slate-900 rounded-[3rem] shadow-3xl border-[8px] border-slate-800 overflow-hidden transform -rotate-12 transition-all duration-700 hover:rotate-0 hover:scale-110 z-30 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-b-2xl z-10" />
                <div className="relative h-full w-full bg-gradient-to-br from-metamask-purple to-indigo-900 p-8 flex flex-col justify-end text-white">
                  <div className="space-y-4 mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20">
                      <div className="w-8 h-8 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
                    </div>
                    <div>
                      <div className="font-bold text-2xl tracking-tight">FYNDER</div>
                      <div className="text-xs opacity-60 font-light">Connection, simplified.</div>
                    </div>
                  </div>
                  <div className="h-12 w-full bg-white rounded-2xl shadow-xl flex items-center justify-center text-xs font-bold text-metamask-purple tracking-widest">
                    EXPLORE APP
                  </div>
                </div>
              </div>

              {/* Floating Tech Orbs */}
              <div className="absolute top-1/4 -right-12 w-20 h-20 bg-metamask-orange rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/40 animate-bounce z-10">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <div className="absolute bottom-1/4 right-0 w-16 h-16 bg-metamask-purple rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/40 animate-pulse z-40">
                <div className="w-6 h-6 rounded-full border-2 border-white/50 border-t-white animate-spin" />
              </div>

              {/* Decorative Circle */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-metamask-gray-100 rounded-full opacity-50" />
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-metamask-gray-50 rounded-full opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
