import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'
import { UnifiedSidebar } from './components/UnifiedSidebar'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
})

export const metadata: Metadata = {
  title: 'VAIIYA - The Solana Super App',
  description: 'The ultimate Solana Super App integrating Lottery, Launchpad, and DeFi.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${orbitron.variable} font-inter bg-gray-900 text-white`}>
        <div className="flex min-h-screen">
          <UnifiedSidebar />
          <main className="flex-1 md:ml-20 min-h-screen relative overflow-x-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}