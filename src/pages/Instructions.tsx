import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Clock, AlertCircle, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'

export default function Instructions() {
  const navigate = useNavigate()

  return (
    <div className="flex-1 flex flex-col items-center py-10 md:py-20 animate-fade-in-up">
      <div className="w-full max-w-2xl mb-8 flex flex-col gap-6 px-4 md:px-0">
        <div className="flex justify-between items-center">
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
      </div>

      <div className="w-full max-w-2xl relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2dd4bf]/20 to-[#f472b6]/20 rounded-3xl blur-xl opacity-50 z-0"></div>

        <div className="relative bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-10 shadow-2xl z-10">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-[#2dd4bf]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-[#2dd4bf]" />
            </div>
            <h2 className="text-sm font-semibold text-[#2dd4bf] uppercase tracking-wider mb-2">
              Aviso Importante
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Antes de iniciarmos o DMO
            </h3>
          </div>

          <div className="space-y-6 text-slate-300">
            <p className="text-lg text-center text-slate-200">
              Sabemos que preencher formulários pode ser chato, mas{' '}
              <strong>30 min dedicados com foco</strong> agora farão toda a diferença na sua
              jornada.
              <br />
              <br />
              Levamos nosso método <b>muito a sério</b> e esse primeiro passo é essencial para que
              você tenha sucesso.&nbsp;&nbsp;
            </p>

            <div className="grid gap-4 mt-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex gap-4 items-start hover:bg-white/10 transition-colors">
                <div className="bg-rose-500/20 p-2 rounded-lg mt-1 shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Evite respostas rasas</h4>
                  <p className="text-sm text-slate-400">
                    Quanto mais profunda for a sua descrição sobre o cenário atual, mais
                    personalizado e assertivo será o plano de ação que nossa equipe vai preparar.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex gap-4 items-start hover:bg-white/10 transition-colors">
                <div className="bg-purple-500/20 p-2 rounded-lg mt-1 shrink-0">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Atenção às perguntas abertas</h4>
                  <p className="text-sm text-slate-400">
                    &nbsp;É nelas que conseguimos entender a essência dos seus desafios e
                    identificar as melhores oportunidades de automação.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10">
            <Button
              onClick={() => navigate('/bloco-a')}
              className="w-full bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold h-14 text-lg rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] group"
            >
              Estou pronto, vamos começar
              <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
