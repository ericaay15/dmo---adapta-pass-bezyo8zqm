import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Diagnosis from './pages/Diagnosis'
import BlockA from './pages/BlockA'
import BlockB from './pages/BlockB'
import BlockS from './pages/BlockS'
import BlockAu from './pages/BlockAu'
import BlockT from './pages/BlockT'
import SuccessPlan from './pages/SuccessPlan'
import Results from './pages/Results'
import NotFound from './pages/NotFound'
import Report from './pages/Report'
import Layout from './components/Layout'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/diagnostico" element={<Diagnosis />} />
          <Route path="/bloco-a" element={<BlockA />} />
          <Route path="/bloco-b" element={<BlockB />} />
          <Route path="/bloco-s" element={<BlockS />} />
          <Route path="/bloco-au" element={<BlockAu />} />
          <Route path="/bloco-t" element={<BlockT />} />
          <Route path="/plano-de-sucesso" element={<SuccessPlan />} />
          <Route path="/resultados" element={<Results />} />
        </Route>
        <Route path="/relatorio/:id" element={<Report />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
