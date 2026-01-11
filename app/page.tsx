import Hero from '@/components/Hero'
import Products from '@/components/Products'
import About from '@/components/About'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <Products />
      <Footer />
    </main>
  )
}


