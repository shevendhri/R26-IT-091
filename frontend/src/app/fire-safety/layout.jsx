import { Toaster } from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'FireGuard - Backend Pre-Assessment',
  description: 'Backend-driven fire safety pre-assessment for Sri Lanka',
  generator: 'v0.app',
}

export default function RootLayout({ children }) {
  return (
    <div style={{ background: '#FAF7F0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div className="font-sans antialiased" style={{ flex: 1 }}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#143825',
              border: '1px solid #E2DCD0',
            },
          }}
        />
      </div>
      <Footer />
    </div>
  )
}
