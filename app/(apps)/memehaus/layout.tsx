import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
// globals.css removed - using root layout

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
  return <>{children}</>;
} 