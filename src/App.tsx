import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Diagnosis from './pages/Diagnosis'
import Instructions from './pages/Instructions'
import Motivation from './pages/Motivation'
import BlockA from './pages/BlockA'
import BlockB from './pages/BlockB'
import BlockS from './pages/BlockS'
import BlockAu from './pages/BlockAu'
import BlockT from './pages/BlockT'
import SegmentQuestions from './pages/SegmentQuestions'
import ToolsQuestion from './pages/ToolsQuestion'
import SuccessPlan from './pages/SuccessPlan'
import Results from './pages/Results'
import NotFound from './pages/NotFound'
import Report from './pages/Report'
import Layout from './components/Layout'
import { useEffect } from 'react'
import useDiagnosisStore from './stores/useDiagnosisStore'

function URLParamsHandler() {
  const { updateData } = useDiagnosisStore()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const cnpj = params.get('doc') || ''
    const companyName = params.get('company_name') || ''
    const contactName = [params.get('contact_name'), params.get('contact_surname')]
      .filter(Boolean)
      .join(' ')
      .trim()
    const email = params.get('email') || ''

    const dataToUpdate: Record<string, string> = {}

    if (cnpj) dataToUpdate.cnpj = cnpj
    if (companyName) dataToUpdate.companyName = companyName
    if (contactName) {
      dataToUpdate.userName = contactName
      dataToUpdate.leadName = contactName
    }
    if (email) {
      dataToUpdate.adminEmail = email
      dataToUpdate.leadEmail = email
    }

    if (Object.keys(dataToUpdate).length > 0) {
      updateData(dataToUpdate)
    }
  }, [])

  return null
}

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <URLParamsHandler />
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/diagnostico" element={<Diagnosis />} />
          <Route path="/instrucoes" element={<Instructions />} />
          <Route path="/motivacao" element={<Motivation />} />
          <Route path="/bloco-a" element={<BlockA />} />
          <Route path="/bloco-b" element={<BlockB />} />
          <Route path="/bloco-s" element={<BlockS />} />
          <Route path="/bloco-au" element={<BlockAu />} />
          <Route path="/bloco-t" element={<BlockT />} />
          <Route path="/segmento" element={<SegmentQuestions />} />
          <Route path="/ferramentas" element={<ToolsQuestion />} />
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
