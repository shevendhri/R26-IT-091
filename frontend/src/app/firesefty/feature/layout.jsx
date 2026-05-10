import { Analytics } from '@vercel/analytics/next'

import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'FireSafe LK - Fire Safety Certification System',
  description: 'Automated fire safety certification system for Sri Lanka',
  generator: 'v0.app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-background dark">
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1f24',
              color: '#e8eaed',
              border: '1px solid #2c3e50',
            },
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
