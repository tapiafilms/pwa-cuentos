import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cuentos TV',
  description: 'Experiencia interactiva en tu televisor',
  manifest: '/manifest.json',
  themeColor: '#0a0a0f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
