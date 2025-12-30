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
  title: 'LuckyHaus - Solana Lottery 🎰',
  description: 'LuckyHaus is your premier Solana lottery dApp — buy tickets, watch the pot grow, and win big! Join the most exciting lottery on Solana.',
  icons: {
    icon: '/favicon.ico',
  },
  other: {
    'cache-control': 'no-cache, no-store, must-revalidate',
    'pragma': 'no-cache',
    'expires': '0',
  },
}

export default function LuckyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
} 