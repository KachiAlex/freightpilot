import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import 'leaflet/dist/leaflet.css'
import './index.css'
import { routes } from './App.tsx'
import { AuthProvider } from './context'

const queryClient = new QueryClient()

const router = createBrowserRouter(routes)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <>
          <RouterProvider router={router} />
          <Toaster position="top-right" toastOptions={{ style: { background: '#050505', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)' } }} />
        </>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
