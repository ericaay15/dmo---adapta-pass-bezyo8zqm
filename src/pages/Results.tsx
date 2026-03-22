import { Link, Navigate } from 'react-router-dom'
import { CheckCircle2, FileText, Link as LinkIcon, Home, Target } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import useDiagnosisStore from '@/stores/useDiagnosisStore'

export default function Results() {
  const { data, resetData } = useDiagnosisStore()

  if (!data.scoringData) {
    return <Navigate to="/" replace />
  }

  const { scoringData } = data

  const getColorHex = (nota: number) => {
    if (nota <= 3) return '#f43f5e'
    if (nota <= 6) return '#f59e0b'
    if (nota <= 8) return '#10b981'
    return '#3b82f6'
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
        <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
          Fique atento aos seus contatos, em até 3 dias seu Gerente de Negócios Adapta entrará em
          contato para marcar a primeira reunião do Adapta Pass.
        </p>
      </div>

      {/* Resumo Visual Card */}
      <div className="w-full max-w-3xl relative mb-12 px-4 md:px-0">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2dd4bf]/20 to-[#3b82f6]/20 rounded-3xl blur-xl opacity-50 z-0"></div>
        <div className="relative bg-black/50 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-10 shadow-2xl z-10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8 pb-8 border-b border-white/10">
            {/* Nota Geral */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
                Nota Geral
              </div>
              <div
                className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full bg-black/40 border-4 shadow-[0_0_30px_rgba(0,0,0,0.2)]"
                style={{ borderColor: getColorHex(scoringData.nota_geral.valor) }}
              >
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-white">
                    {scoringData.nota_geral.valor}
                  </div>
                  <div
                    className="text-xs md:text-sm font-medium mt-1"
                    style={{ color: getColorHex(scoringData.nota_geral.valor) }}
                  >
                    {scoringData.nota_geral.classificacao}
                  </div>
                </div>
              </div>
            </div>

            {/* ASA Barras */}
            <div className="flex-1 w-full flex flex-col justify-center gap-4">
              <div className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1 text-center md:text-left">
                Pilares do Diagnóstico
              </div>
              {['A', 'S', 'Au'].map((blocoId) => {
                const bloco = scoringData.blocos[blocoId]
                const nomes: Record<string, string> = {
                  A: 'Amplificar (A)',
                  S: 'Sistematizar (S)',
                  Au: 'Automatizar (Au)',
                }
                const color = getColorHex(bloco.nota)
                return (
                  <div
                    key={blocoId}
                    className="bg-white/5 rounded-lg p-3 border border-white/5 flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-200 text-sm md:text-base">
                      {nomes[blocoId]}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs md:text-sm font-semibold" style={{ color }}>
                        {bloco.nota} / 10
                      </span>
                      <div className="hidden sm:block w-24 h-2 bg-black/60 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${bloco.nota * 10}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* First Impact */}
          <div className="bg-gradient-to-br from-[#2dd4bf]/10 to-transparent border border-[#2dd4bf]/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Target className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-[#2dd4bf]" />
                <h3 className="text-lg font-bold text-white">
                  Primeira Ação Recomendada (First Impact)
                </h3>
              </div>
              <div className="text-xl font-bold text-white mb-2">
                {scoringData.first_impact.acao}
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">
                {scoringData.first_impact.descricao}
              </p>
            </div>
          </div>
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
