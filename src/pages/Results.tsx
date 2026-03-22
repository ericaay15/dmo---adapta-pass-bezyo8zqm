import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import useDiagnosisStore from '@/stores/useDiagnosisStore'

export default function Results() {
  const { data, resetData } = useDiagnosisStore()

  return (
    <div className="flex-1 flex flex-col items-center py-10 md:py-20 animate-fade-in-up">
      <div className="w-full max-w-2xl mb-8 flex justify-center items-center px-4 md:px-0">
        <Logo className="text-2xl" />
      </div>

      <div className="w-full max-w-2xl relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2dd4bf]/20 to-[#0ea5e9]/20 rounded-3xl blur-xl opacity-50 z-0"></div>

        <div className="relative bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-8 md:p-12 shadow-2xl z-10 text-center">
          <div className="w-20 h-20 bg-[#2dd4bf]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#2dd4bf]" />
          </div>

          <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
            Diagnóstico Enviado!
          </h2>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Obrigado por completar o Adapta Pass
            {data.userName ? `, ${data.userName.split(' ')[0]}` : ''}. Suas respostas foram
            registradas com sucesso e nossa equipe avaliará seu perfil em breve.
          </p>

          <Button
            asChild
            onClick={() => resetData()}
            className="bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold h-14 px-8 text-lg rounded-xl transition-all"
          >
            <Link to="/">Voltar ao Início</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
