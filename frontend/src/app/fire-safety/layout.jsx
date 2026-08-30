import { Toaster } from 'react-hot-toast'
import Header from '@/components/Header'

export const metadata = {
  title: 'FireGuard - Backend Pre-Assessment',
  description: 'Backend-driven fire safety pre-assessment for Sri Lanka',
  generator: 'v0.app',
}

export default function RootLayout({ children }) {
  return (
    <>
      <Header />
      <div className="font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#14221B',
              border: '1px solid #BDCEBF',
            },
          }}
        />
      </div>
    </>
  )
}
