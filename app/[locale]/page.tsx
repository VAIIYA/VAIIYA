import Hero from '@/components/Hero'
import VideoSection from '@/components/VideoSection'
import Products from '@/components/Products'
import About from '@/components/About'
import { getTranslations } from 'next-intl/server'

export default async function Home() {
  const t = await getTranslations('Index')
  return (
    <main className="min-h-screen">
      <Hero />
      <VideoSection
        src="/media/VAIIYA_x2000.mp4"
        title={t('videoTitle')}
        description={t('videoDescription')}
      />
      <About />
      <Products />
    </main>
  )
}

