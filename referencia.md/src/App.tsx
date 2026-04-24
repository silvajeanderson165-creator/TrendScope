import { Routes, Route } from 'react-router'
import ErrorBoundary from '@/components/ErrorBoundary'
import Home from './pages/Home'

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={
          <div className="min-h-screen bg-[#070B14] flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-[#38BDF8] mb-4">404</h1>
              <p className="text-[#94A3B8] mb-6">Página não encontrada</p>
              <a href="/" className="text-[#38BDF8] hover:text-[#0EA5E9] transition-colors">
                Voltar para home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </ErrorBoundary>
  )
}
