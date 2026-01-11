import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'VAIIYA - We. As One.',
  description: 'Building the future of Web3 on Solana. Vibe Coding. Blockchain First.',
  keywords: ['Web3', 'Solana', 'Blockchain', 'Vibe Coding', 'VAIIYA'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}

