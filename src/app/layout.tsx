import type { Metadata } from 'next'
import { Web3Provider } from '@/components/Web3Provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'HousiFi',
  description: 'Pool your down payment with global DeFi investors. Get the deed instantly. No landlord, no interest on the equity gap — just shared upside via smart contract.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}
