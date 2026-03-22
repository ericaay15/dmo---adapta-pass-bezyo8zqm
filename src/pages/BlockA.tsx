import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import useDiagnosisStore from '@/stores/useDiagnosisStore'

export default function BlockA() {
  const { data } = useDiagnosisStore()

  return (
    <div className="flex-1 flex flex-col items-center py-10 md:py-20 animate-fade-in-up">
      <div className="w-full max-w-2xl mb-8 flex justify-between items-center px-4 md:px-0">
        <Button
          variant="ghost"
          asChild
          className="text-slate-400 hover:text-white hover:bg-white/5 -ml-4"
        >
          <Link to="/diagnostico">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <Logo className="text-2xl" />
        <div className="w-[88px]" />
      </div>

      <div className="w-full max-w-2xl relative">
        {/* Card Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#8b5cf6]/20 to-[#2dd4bf]/20 rounded-3xl blur-xl opacity-50 z-0"></div>

        {/* Main Content */}
        <div className="relative bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-10 shadow-2xl z-10">
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[#8b5cf6] uppercase tracking-wider mb-2">
              Bloco A
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Estratégia e Liderança
            </h3>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              Avalie como a inovação e a Inteligência Artificial estão alinhadas aos objetivos de
              negócio.
            </p>
          </div>

          {/* Dummy State Display to confirm persistence */}
          {data.cnpj ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="text-[#2dd4bf] w-6 h-6" />
                <h4 className="text-lg font-medium text-white">Dados da Empresa Salvos</h4>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-slate-500 mb-1">CNPJ</dt>
                  <dd className="text-slate-200 font-medium">{data.cnpj}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 mb-1">Preenchido por</dt>
                  <dd className="text-slate-200 font-medium">{data.userName}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 mb-1">Líder de IA</dt>
                  <dd className="text-slate-200 font-medium">{data.leadName}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 mb-1">E-mail do Líder</dt>
                  <dd className="text-slate-200 font-medium">{data.leadEmail}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 mb-8 text-rose-200 text-sm">
              Nenhum dado encontrado no estado da aplicação. Por favor, preencha o formulário
              inicial.
            </div>
          )}

          {/* Placeholder for actual form block A */}
          <div className="space-y-6">
            <div className="h-24 rounded-xl border border-dashed border-white/20 bg-white/5 flex items-center justify-center text-slate-500">
              [Perguntas do Bloco A virão aqui]
            </div>

            <div className="pt-6">
              <Button
                disabled
                className="w-full bg-slate-800 text-slate-400 font-bold h-14 text-lg rounded-xl"
              >
                Próximo Bloco
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
