import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}

