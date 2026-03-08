import type { Metadata } from 'next'
import '../globals.css'
import Header from '@/components/Header'
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'VAIIYA - We. As One.',
  description: 'Building the future of Web3 on Solana. Agentic Engineering. Blockchain First.',
  keywords: ['Web3', 'Solana', 'Blockchain', 'Agentic Engineering', 'VAIIYA'],
}

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

