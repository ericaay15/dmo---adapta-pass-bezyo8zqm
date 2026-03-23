import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import {
  Loader2,
  ArrowRight,
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  Target,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import useDiagnosisStore from '@/stores/useDiagnosisStore'
import { finalizeSuccessPlan } from '@/services/diagnostics'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function SuccessPlan() {
  const navigate = useNavigate()
  const { data, updateData } = useDiagnosisStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!data.diagnosticoId || !data.scoringData) {
    return <Navigate to="/" replace />
  }

  const { scoringData } = data

  const getColor = (nota: number) => {
    if (nota <= 3) return 'bg-rose-500'
    if (nota <= 6) return 'bg-amber-500'
    if (nota <= 8) return 'bg-emerald-500'
    return 'bg-blue-500'
  }

  const getColorHex = (nota: number) => {
    if (nota <= 3) return '#f43f5e'
    if (nota <= 6) return '#f59e0b'
    if (nota <= 8) return '#10b981'
    return '#3b82f6'
  }

  const handleFinalize = async () => {
    setIsSubmitting(true)
    try {
      const { pdfUrl } = await finalizeSuccessPlan(data.diagnosticoId!, '')
      if (pdfUrl) {
        updateData({ pdfUrl, complemento: '' })
      } else {
        updateData({ complemento: '' })
      }
      navigate('/resultados')
    } catch (error: any) {
      toast.error('Erro ao enviar plano', { description: error.message })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center py-10 md:py-20 animate-fade-in-up">
      <div className="w-full max-w-4xl mb-8 flex justify-center items-center px-4 md:px-0">
        <Logo className="text-2xl md:text-3xl" />
      </div>

      <div className="w-full max-w-4xl relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2dd4bf]/20 to-[#3b82f6]/20 rounded-3xl blur-xl opacity-50 z-0"></div>

        <div className="relative bg-black/50 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-12 shadow-2xl z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
              Plano de Sucesso Adapta Pass
            </h1>
            <p className="text-lg md:text-xl text-[#2dd4bf] font-medium mb-6">
              Aqui começa sua jornada de implementação de IA com quem realmente entende.
            </p>
            <p className="text-sm text-slate-400 font-light leading-relaxed max-w-3xl mx-auto">
              Este diagnóstico revela a maturidade atual da sua empresa nas três dimensões
              estratégicas de transformação com IA:{' '}
              <strong className="text-slate-300 font-medium">Amplificar</strong> (pessoas e
              capacidades), <strong className="text-slate-300 font-medium">Sistematizar</strong>{' '}
              (processos e conhecimento) e{' '}
              <strong className="text-slate-300 font-medium">Automatizar</strong> (eficiência
              operacional). Os resultados abaixo refletem a realidade do seu negócio hoje e apontam
              as oportunidades mais impactantes para os próximos{' '}
              <strong className="text-[#2dd4bf] font-medium">90 dias</strong>.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center mb-12">
            <div className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Nota Geral de Maturidade
            </div>
            <div
              className="relative flex items-center justify-center w-40 h-40 md:w-48 md:h-48 rounded-full bg-black/40 border-4 shadow-[0_0_40px_rgba(0,0,0,0.3)]"
              style={{ borderColor: getColorHex(scoringData.nota_geral.valor) }}
            >
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-black text-white">
                  {scoringData.nota_geral.valor}
                </div>
                <div
                  className="text-sm md:text-base font-medium mt-1"
                  style={{ color: getColorHex(scoringData.nota_geral.valor) }}
                >
                  {scoringData.nota_geral.classificacao}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-12 bg-white/5 border border-white/10 p-6 md:p-8 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-2">Maturidade por Dimensão</h3>

            {['A', 'S', 'Au'].map((blocoId) => {
              const bloco = scoringData.blocos[blocoId]
              const nomes: Record<string, string> = {
                A: 'Amplificar',
                S: 'Sistematizar',
                Au: 'Automatizar',
              }
              return (
                <div key={blocoId} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-semibold text-slate-200">
                      {nomes[blocoId]} ({blocoId})
                    </span>
                    <span className="text-sm font-bold" style={{ color: getColorHex(bloco.nota) }}>
                      {bloco.nota} / 10 - {bloco.classificacao}
                    </span>
                  </div>
                  <div className="h-4 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={cn('h-full transition-all duration-1000', getColor(bloco.nota))}
                      style={{ width: `${bloco.nota * 10}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col">
              <Users className="w-8 h-8 text-[#2dd4bf] mb-3" />
              <div className="text-sm text-slate-400 font-medium mb-1">Pessoas Impactadas</div>
              <div className="text-2xl font-bold text-white mb-2">
                {scoringData.metricas_chave.pessoas_impactadas.nivel}
              </div>
              <p className="text-xs text-slate-400 mt-auto leading-relaxed">
                {scoringData.metricas_chave.pessoas_impactadas.descricao}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col">
              <Clock className="w-8 h-8 text-[#f472b6] mb-3" />
              <div className="text-sm text-slate-400 font-medium mb-1">
                Horas Recuperadas / Semana
              </div>
              <div className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
                {scoringData.metricas_chave.horas_recuperadas.estimativa}
              </div>
              <p className="text-xs text-slate-400 mt-auto leading-relaxed">
                {scoringData.metricas_chave.horas_recuperadas.descricao}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col">
              <AlertTriangle className="w-8 h-8 text-[#f59e0b] mb-3" />
              <div className="text-sm text-slate-400 font-medium mb-1">Dependência do Dono</div>
              <div className="text-2xl font-bold text-white mb-2">
                {scoringData.metricas_chave.dependencia_do_dono.percentual}%
              </div>
              <p className="text-xs text-slate-400 mt-auto leading-relaxed">
                {scoringData.metricas_chave.dependencia_do_dono.descricao}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-[#2dd4bf]" />
                <h3 className="text-xl font-bold text-white">Top 3 Oportunidades</h3>
              </div>
              <ul className="space-y-4">
                {scoringData.top_3_oportunidades.map((op: any, i: number) => (
                  <li
                    key={i}
                    className="flex gap-4 items-start bg-black/20 p-4 rounded-lg border border-white/5"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf] flex items-center justify-center text-sm font-bold mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200 leading-snug">{op.nome}</div>
                      <div className="text-xs text-slate-400 mt-2 flex flex-wrap items-center gap-2">
                        <span className="bg-white/10 px-2 py-0.5 rounded text-slate-300">
                          Dimensão: {op.bloco}
                        </span>
                        <span className="bg-white/10 px-2 py-0.5 rounded text-slate-300">
                          Nota: {op.nota}/5
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#2dd4bf]/10 to-transparent border border-[#2dd4bf]/30 rounded-xl p-6 md:p-8 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Target className="w-24 h-24" />
              </div>
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-6 h-6 text-[#2dd4bf]" />
                  <h3 className="text-xl font-bold text-white">First Impact</h3>
                </div>

                <div className="text-xl md:text-2xl font-bold text-white mb-6 leading-tight">
                  Meta dos primeiros 90 dias
                </div>

                <ul className="space-y-4">
                  {Array.isArray(scoringData.first_impact.descricao)
                    ? scoringData.first_impact.descricao.map((item: string, i: number) => (
                        <li key={i} className="flex gap-4 items-start">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf] flex items-center justify-center mt-0.5">
                            <Check className="w-4 h-4" />
                          </div>
                          <span className="text-slate-300 leading-relaxed text-sm md:text-base">
                            {item}
                          </span>
                        </li>
                      ))
                    : typeof scoringData.first_impact.descricao === 'string' &&
                      scoringData.first_impact.descricao
                        .split('. ')
                        .filter(Boolean)
                        .map((item: string, i: number) => (
                          <li key={i} className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf] flex items-center justify-center mt-0.5">
                              <Check className="w-4 h-4" />
                            </div>
                            <span className="text-slate-300 leading-relaxed text-sm md:text-base">
                              {item.replace(/\.$/, '')}
                            </span>
                          </li>
                        ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Button
              size="lg"
              disabled={isSubmitting}
              onClick={handleFinalize}
              className="w-full md:w-auto min-w-[300px] bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold h-16 px-8 text-lg rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(45,212,191,0.3)] disabled:opacity-50 disabled:hover:shadow-none group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-3 w-6 h-6 animate-spin" />
                  Processando seu diagnóstico...
                </>
              ) : (
                <>
                  Enviar Plano de Sucesso
                  <ArrowRight className="ml-3 w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </Button>

            <p className="text-sm text-slate-500 mt-6 max-w-2xl mx-auto">
              Seu Gerente de Negócios Adapta entrará em contato para alinhar a execução deste plano,
              validar prioridades e estruturar a implementação com segurança e resultado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
