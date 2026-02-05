import Hero from '@/components/Hero'
import VideoSection from '@/components/VideoSection'
import Products from '@/components/Products'
import About from '@/components/About'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <VideoSection
        src="/media/VAIIYA_x2000.mp4"
        title="Experience the Vibe"
        description="Crafting the future of Web3 on Solana with unmatched precision and aesthetic excellence."
      />
      <About />
      <Products />
      <Footer />
    </main>
  )
}

