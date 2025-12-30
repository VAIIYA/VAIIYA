import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
// globals.css removed - using root layout
import { WalletContextProvider } from './providers/WalletProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './components/ToastProvider'
import { validateEnvironment } from './lib/env'
import Script from 'next/script'

// Validate environment variables on app startup
if (typeof window === 'undefined') {
  try {
    validateEnvironment();
  } catch (error) {
    console.error('Environment validation failed:', error);
  }
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
})

export const metadata: Metadata = {
  title: 'MemeHaus - Memecoin Launchpad',
  description: 'MemeHaus is your all-in-one Solana hub — create, trade, stake, and explore the blockchain faster than Doc Brown\'s DeLorean. Roads? Where we\'re going, we don\'t need roads.',
}

export default function MemeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Script
        src="https://plugin.jup.ag/plugin-v1.js"
        strategy="beforeInteractive"
        data-preload
        defer
      />
      <ErrorBoundary>
        <WalletContextProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </WalletContextProvider>
      </ErrorBoundary>
    </>
  )
} 