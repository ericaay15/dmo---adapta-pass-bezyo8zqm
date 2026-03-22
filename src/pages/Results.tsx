import { Link, Navigate } from 'react-router-dom'
import { CheckCircle2, FileText, Link as LinkIcon, Home } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import useDiagnosisStore from '@/stores/useDiagnosisStore'

export default function Results() {
  const { data, resetData } = useDiagnosisStore()

  if (!data.scoringData) {
    return <Navigate to="/" replace />
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copiado para a área de transferência!')
  }

  return (
    <div className="flex-1 flex flex-col items-center py-10 md:py-20 animate-fade-in-up w-full">
      {/* Header */}
      <div className="text-center mb-10 max-w-2xl px-4">
        <div className="w-20 h-20 bg-[#2dd4bf]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-[#2dd4bf]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Obrigado!
        </h1>
        <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8">
          Em breve o/a Gerente de Negócios responsável pela sua conta entrará em contato para a sua
          primeira reunião estratégica e Onboarding com toda sua equipe. Fique atento(a) aos seus
          contatos.
        </p>

        <div className="bg-gradient-to-r from-[#2dd4bf]/20 to-[#3b82f6]/20 border border-[#2dd4bf]/30 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl mx-auto max-w-xl">
          <p className="text-xl md:text-2xl font-bold text-white leading-snug">
            Acesse seu e-mail para entrar na plataforma Adapta e configurar seus usuários.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 w-full max-w-3xl mb-16 px-4 md:px-0">
        <Button
          variant="outline"
          asChild
          onClick={() => resetData()}
          className="w-full sm:w-auto border-white/10 text-white hover:bg-white/5 hover:text-white h-14 px-6 text-base rounded-xl transition-all"
        >
          <Link to="/">
            <Home className="mr-2 w-5 h-5" />
            Voltar para Home
          </Link>
        </Button>

        <Button
          variant="outline"
          onClick={handleCopyLink}
          className="w-full sm:w-auto border-white/10 text-white hover:bg-white/5 hover:text-white h-14 px-6 text-base rounded-xl transition-all"
        >
          <LinkIcon className="mr-2 w-5 h-5" />
          Copiar Link para Compartilhar
        </Button>

        {data.pdfUrl && (
          <Button
            asChild
            className="w-full sm:w-auto bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold h-14 px-6 text-base rounded-xl transition-all shadow-[0_0_20px_rgba(45,212,191,0.2)]"
          >
            <a href={data.pdfUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="mr-2 w-5 h-5" />
              Baixar Relatório em PDF
            </a>
          </Button>
        )}
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
