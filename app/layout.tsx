import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { Navigation } from '@/components/ui/navigation'
import { DevCleanup } from '@/components/DevCleanup'
import './globals.css'

export const metadata: Metadata = {
  title: 'CareConnect - Your Health Companion',
  description: 'AI-powered healthcare assistant for rural communities with multi-language support',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
       <AuthProvider>
          <DevCleanup />
          <Navigation />
          <main>
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
