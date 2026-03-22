import { Navigate } from 'react-router-dom'
import { CheckCircle2, FileText, Download } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import useDiagnosisStore from '@/stores/useDiagnosisStore'

export default function Results() {
  const { data } = useDiagnosisStore()

  if (!data.scoringData) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex-1 flex flex-col items-center py-10 md:py-20 animate-fade-in-up w-full">
      {/* Header */}
      <div className="text-center mb-10 max-w-3xl px-4 mt-8 md:mt-16 w-full">
        <div className="w-20 h-20 bg-[#2dd4bf]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(45,212,191,0.2)]">
          <CheckCircle2 className="w-10 h-10 text-[#2dd4bf]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Obrigado!
        </h1>
        <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto">
          Seu plano de sucesso foi enviado. Veja o que acontece agora para iniciarmos a sua jornada:
        </p>

        {data.pdfUrl && (
          <div className="mb-12 w-full flex justify-center animate-fade-in-up">
            <a
              href={data.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full md:w-auto"
            >
              <Button
                size="lg"
                className="w-full md:w-auto min-w-[300px] bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold h-16 px-8 text-lg rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] transition-all duration-300 group"
              >
                <FileText className="mr-3 w-6 h-6" />
                Baixar Resumo em PDF
                <Download className="ml-3 w-5 h-5 opacity-70 group-hover:translate-y-1 transition-transform duration-300" />
              </Button>
            </a>
          </div>
        )}

        {/* Próximos Passos */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 md:p-8 mb-10 text-left w-full mx-auto shadow-xl">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-[#2dd4bf] to-[#3b82f6] text-transparent bg-clip-text">
              Próximos Passos
            </span>
          </h3>

          <ul className="space-y-4">
            <li className="flex gap-5 items-start bg-white/5 hover:bg-white/10 transition-colors p-5 rounded-xl border border-white/5">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2dd4bf]/20 flex items-center justify-center text-2xl shadow-inner">
                🚀
              </div>
              <div className="pt-1">
                <strong className="text-white text-lg block mb-1">
                  1. Primeira Reunião Estratégica
                </strong>
                <span className="text-slate-400 text-sm md:text-base leading-relaxed block">
                  O/A Gerente de Negócios responsável pela sua conta entrará em contato para alinhar
                  os detalhes e prioridades.
                </span>
              </div>
            </li>
            <li className="flex gap-5 items-start bg-white/5 hover:bg-white/10 transition-colors p-5 rounded-xl border border-white/5">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#3b82f6]/20 flex items-center justify-center text-2xl shadow-inner">
                🤝
              </div>
              <div className="pt-1">
                <strong className="text-white text-lg block mb-1">
                  2. Onboarding com sua Equipe
                </strong>
                <span className="text-slate-400 text-sm md:text-base leading-relaxed block">
                  Realizaremos a integração completa com todo o seu time para garantir a melhor
                  adoção da plataforma.
                </span>
              </div>
            </li>
            <li className="flex gap-5 items-start bg-white/5 hover:bg-white/10 transition-colors p-5 rounded-xl border border-white/5">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#f59e0b]/20 flex items-center justify-center text-2xl shadow-inner">
                📱
              </div>
              <div className="pt-1">
                <strong className="text-white text-lg block mb-1">
                  3. Fique Atento(a) aos seus Contatos
                </strong>
                <span className="text-slate-400 text-sm md:text-base leading-relaxed block">
                  Acompanhe seu e-mail e WhatsApp nos próximos dias para darmos andamento a essas
                  etapas.
                </span>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-[#2dd4bf]/20 to-[#3b82f6]/20 border border-[#2dd4bf]/30 backdrop-blur-md rounded-2xl p-8 md:p-10 shadow-2xl mx-auto w-full relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#2dd4bf]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <p className="text-xl md:text-2xl font-bold text-white leading-snug relative z-10">
            Acesse seu e-mail para entrar na plataforma Adapta e configurar seus usuários.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-auto flex flex-col items-center gap-4 border-t border-white/10 pt-8 w-full max-w-3xl px-4 md:px-0">
        <Logo className="text-xl opacity-80 grayscale" />
        <p className="text-sm text-slate-500">
          Obrigado pela confiança. Estamos ansiosos para acelerar os resultados do seu negócio.
        </p>
      </div>
    </div>
  )
}
