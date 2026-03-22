import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import useDiagnosisStore from '@/stores/useDiagnosisStore'

export default function BlockAu() {
  const { data } = useDiagnosisStore()

  return (
    <div className="flex-1 flex flex-col items-center py-10 md:py-20 animate-fade-in-up">
      <div className="w-full max-w-2xl mb-8 flex justify-between items-center px-4 md:px-0">
        <Button
          variant="ghost"
          asChild
          className="text-slate-400 hover:text-white hover:bg-white/5 -ml-4"
        >
          <Link to="/bloco-s">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <Logo className="text-2xl" />
        <div className="w-[88px]" />
      </div>

      <div className="w-full max-w-2xl relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#eab308]/20 to-[#f97316]/20 rounded-3xl blur-xl opacity-50 z-0"></div>

        <div className="relative bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-10 shadow-2xl z-10">
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[#eab308] uppercase tracking-wider mb-2">
              Bloco Au
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Automatizar
            </h3>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              Em breve. Suas respostas do Bloco S foram salvas com sucesso.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="text-[#2dd4bf] w-6 h-6" />
              <h4 className="text-lg font-medium text-white">Respostas Salvas</h4>
            </div>
            <dl className="grid grid-cols-1 gap-4 text-sm">
              <div className="grid grid-cols-2">
                <dt className="text-slate-500">S1. Processos documentados</dt>
                <dd className="text-slate-200 font-medium">Nota: {data.s1 || 'Não respondido'}</dd>
              </div>
              <div className="grid grid-cols-2">
                <dt className="text-slate-500">S2. Onboarding estruturado</dt>
                <dd className="text-slate-200 font-medium">Nota: {data.s2 || 'Não respondido'}</dd>
              </div>
              <div className="grid grid-cols-2">
                <dt className="text-slate-500">S3. Conhecimento crítico</dt>
                <dd className="text-slate-200 font-medium">Nota: {data.s3 || 'Não respondido'}</dd>
              </div>
              <div className="grid grid-cols-2">
                <dt className="text-slate-500">S4. Ferramentas integradas</dt>
                <dd className="text-slate-200 font-medium">Nota: {data.s4 || 'Não respondido'}</dd>
              </div>
              <div className="grid grid-cols-2">
                <dt className="text-slate-500">S5. Base de conhecimento</dt>
                <dd className="text-slate-200 font-medium">Nota: {data.s5 || 'Não respondido'}</dd>
              </div>
              {data.s6 && (
                <div className="mt-2 pt-4 border-t border-white/10">
                  <dt className="text-slate-500 mb-1">S6. Processo crítico na cabeça</dt>
                  <dd className="text-slate-200 italic">"{data.s6}"</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="pt-6">
            <Button
              asChild
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold h-14 text-lg rounded-xl transition-colors"
            >
              <Link to="/">Voltar ao Início</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
