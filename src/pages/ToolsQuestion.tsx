import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Logo } from '@/components/Logo'
import useDiagnosisStore from '@/stores/useDiagnosisStore'
import { submitDiagnosis } from '@/services/diagnostics'

export default function ToolsQuestion() {
  const navigate = useNavigate()
  const { data: storeData, updateData } = useDiagnosisStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ferramentasUsadas, setFerramentasUsadas] = useState(storeData.ferramentasUsadas || '')

  const hasCompletedPreviousBlocks = () => {
    return Boolean(
      storeData.cnpj &&
      storeData.adminEmail &&
      storeData.userName &&
      storeData.leadName &&
      storeData.leadEmail &&
      storeData.a1 &&
      storeData.a2 &&
      storeData.a3 &&
      storeData.a4 &&
      storeData.a5 &&
      storeData.s1 &&
      storeData.s2 &&
      storeData.s3 &&
      storeData.s4 &&
      storeData.s5 &&
      storeData.au1 &&
      storeData.au2 &&
      storeData.au3 &&
      storeData.au4 &&
      storeData.au5 &&
      storeData.t1 &&
      storeData.t2 &&
      storeData.t3 &&
      storeData.t4 &&
      (storeData.temasSelecionados.length > 0 || storeData.temaOutros.trim().length > 0),
    )
  }

  const isPreviousValid = hasCompletedPreviousBlocks()
  const isFormValid = ferramentasUsadas.trim().length > 0
  const canSubmit = isPreviousValid && isFormValid && !isSubmitting

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    const finalData = { ...storeData, ferramentasUsadas }
    updateData({ ferramentasUsadas })

    try {
      const res = await submitDiagnosis(finalData)
      updateData({
        scoringData: res.scoringData,
        sessionId: res.sessionId,
      })
      navigate('/plano-de-sucesso')
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao processar diagnóstico', {
        description: error.message || 'Tente novamente mais tarde.',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center py-10 md:py-20 animate-fade-in-up">
      <div className="w-full max-w-2xl mb-8 flex flex-col gap-6 px-4 md:px-0">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            asChild
            className="text-slate-400 hover:text-white hover:bg-white/5 -ml-4"
            disabled={isSubmitting}
          >
            <Link to="/segmento">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
          <Logo className="text-2xl" />
          <div className="w-[88px]" />
        </div>

        <div className="space-y-2 w-full">
          <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
            <span>Passo Final: Ferramentas e Sistemas</span>
            <span>100%</span>
          </div>
          <Progress
            value={100}
            className="h-1.5 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[#4bb7a5] [&>div]:via-[#957588] [&>div]:to-[#f45961]"
          />
        </div>
      </div>

      <div className="w-full max-w-2xl relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2dd4bf]/30 to-[#f45961]/30 rounded-3xl blur-xl opacity-50 z-0"></div>

        <div className="relative bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-10 shadow-2xl z-10">
          <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-3">
              Ferramentas e Sistemas
            </h2>
            <p className="text-slate-400 text-sm md:text-base font-normal leading-relaxed">
              Quais ferramentas ou sistemas que você já usa na sua empresa? (Ex: Pacote Google,
              Microsoft, CRM, ERP, Notion, Miro, etc...)
            </p>
          </div>

          {!isPreviousValid && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <p className="text-sm text-rose-200 leading-relaxed">
                Atenção: Você possui perguntas obrigatórias pendentes nos blocos anteriores. Por
                favor, retorne e preencha todos os campos para habilitar a geração do plano.
              </p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-10">
            <div className="space-y-6">
              <Textarea
                value={ferramentasUsadas}
                onChange={(e) => setFerramentasUsadas(e.target.value)}
                placeholder="Descreva as ferramentas e sistemas..."
                className="bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#2dd4bf] min-h-[120px] resize-y"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={isSubmitting}
                className="w-full sm:w-1/3 border-white/10 text-white hover:bg-white/5 hover:text-white h-14 text-lg rounded-xl"
              >
                <Link to="/segmento">Voltar</Link>
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full sm:w-2/3 bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold h-14 text-lg rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] disabled:opacity-50 disabled:hover:shadow-none group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Gerando Plano de Sucesso...
                  </>
                ) : (
                  <>
                    Ver Meu Plano de Sucesso
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
