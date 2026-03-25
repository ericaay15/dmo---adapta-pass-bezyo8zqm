import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import logoImg from '@/assets/adapta-pass-logo-white-5b4d9.png'

const questionsMap: Record<string, string> = {
  A1: 'A1. Quantas pessoas do time usam IA no trabalho diário?',
  A2: 'A2. Qual a profundidade do uso de IA?',
  A3: 'A3. A liderança usa IA ativamente para pensar o negócio?',
  A4: 'A4. O time recebeu capacitação formal em IA nos últimos 6 meses?',
  A5: 'A5. A IA já gerou um resultado tangível e mensurável no negócio?',
  A6: 'A6. Qual foi o melhor resultado que você já teve usando IA? Se não teve, o que esperaria conseguir?',

  S1: 'S1. Os processos críticos da empresa estão documentados?',
  S2: 'S2. Quando alguém novo entra, existe um sistema de onboarding estruturado?',
  S3: 'S3. Se uma pessoa-chave saísse hoje, quanto conhecimento crítico se perderia?',
  S4: 'S4. A empresa usa ferramentas integradas (CRM, controles, fluxos) ou planilhas/WhatsApp?',
  S5: 'S5. Existe uma base de conhecimento interna que o time consulta?',
  S6: 'S6. Qual é o processo mais crítico da empresa que ainda mora na cabeça de alguém?',

  Au1: 'Au1. Quantas tarefas repetitivas do dia a dia já foram automatizadas?',
  Au2: 'Au2. A empresa tem automações rodando (follow-ups, relatórios, agendamentos)?',
  Au3: 'Au3. Existem processos que humanos fazem manualmente mas que poderiam ser automáticos?',
  Au4: 'Au4. O time gasta quanto tempo por semana em tarefas puramente operacionais/repetitivas?',
  Au5: 'Au5. A empresa monitora KPIs automaticamente ou alguém monta relatórios manualmente?',
  Au6: 'Au6. Qual tarefa do dia a dia você mais gostaria de nunca mais ter que fazer?',

  T1: 'T1. Numa escala de 1-10, o quanto a empresa funciona sem você (dono) no operacional diário?',
  T2: 'T2. Numa escala de 1-10, quanto controle você tem sobre os números do negócio em tempo real?',
  T3: 'T3. Numa escala de 1-10, o quanto você sente que a empresa está preparada pro futuro com IA?',
  T4: 'T4. Se você pudesse resolver UM problema do seu negócio nos próximos 90 dias, qual seria?',
}

const getScoreColor = (val: number, max: number) => {
  const r = val / max
  if (r < 0.4) return '#ef4444' // red-500
  if (r < 0.7) return '#f59e0b' // amber-500
  return '#2dd4bf' // teal-400
}

const getClassificationColor = (val: number) => {
  if (val < 4) return '#ef4444'
  if (val < 7) return '#f59e0b'
  return '#2dd4bf'
}

const getMetricaColor = (nivel: string = '') => {
  const n = nivel.toLowerCase()
  if (n.includes('crític') || n.includes('critica') || n.includes('critico')) return '#ec4899' // pink
  if (n.includes('moderad')) return '#f59e0b' // orange
  return '#2dd4bf' // teal
}

function getClassificacaoLabel(nota: number): string {
  if (nota < 4) return 'Inicial'
  if (nota < 7) return 'Em progresso'
  if (nota < 9) return 'Avançado'
  return 'Excelente'
}

const SectionResponses = ({ title, prefix, data }: any) => {
  const sectionKeys = Object.keys(questionsMap).filter((k) => {
    if (prefix === 'A') return k.startsWith('A') && !k.startsWith('Au')
    return k.startsWith(prefix)
  })

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest text-sm">
        {title}
      </h3>
      <div className="space-y-3">
        {sectionKeys.map((k) => {
          let resposta = data.respostas_json?.[k]
          const isAberta = k.endsWith('6') || k === 'T4'

          if (isAberta) {
            const aberta = data.respostas_abertas?.find(
              (a: any) =>
                (a.tipo_bloco === prefix && a.numero_pergunta === parseInt(k.replace(/\D/g, ''))) ||
                (a.tipo_bloco === 'T' && k === 'T4' && a.numero_pergunta === 4),
            )
            resposta = aberta?.resposta || resposta || 'Não respondido'
          }

          if (resposta === undefined || resposta === null || resposta === '') {
            if (!isAberta) return null
            resposta = 'Não respondido'
          }

          return (
            <div
              key={k}
              className="bg-[#171717] border border-[#262626] p-5 rounded-xl print-exact break-inside-avoid"
            >
              <div className="text-sm font-semibold text-slate-400 mb-3">{questionsMap[k]}</div>
              <div className="text-sm text-slate-200">
                {isAberta ? (
                  <span className="whitespace-pre-wrap leading-relaxed">{resposta}</span>
                ) : (
                  (() => {
                    const maxScore = k.startsWith('T') && k !== 'T4' ? 10 : 5
                    const numResp = Number(resposta)
                    const color = getScoreColor(numResp, maxScore)
                    return (
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Nota {resposta}
                          </span>
                          <span className="text-sm font-bold" style={{ color }}>
                            {resposta}{' '}
                            <span className="text-slate-500 text-xs font-medium">/ {maxScore}</span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#262626] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 print-exact"
                            style={{
                              width: `${(numResp / maxScore) * 100}%`,
                              backgroundColor: color,
                              printColorAdjust: 'exact',
                              WebkitPrintColorAdjust: 'exact',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })()
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Report() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return

      const { data: diag } = await supabase
        .from('diagnosticos')
        .select('*, empresas(*), respostas_abertas(*)')
        .eq('id', id)
        .single()

      setData(diag)
      setLoading(false)
    }

    fetchReport()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <Loader2 className="w-10 h-10 animate-spin text-[#2dd4bf]" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] p-6 text-center">
        <h2 className="text-2xl font-bold text-white">Relatório não encontrado.</h2>
        <p className="text-slate-400 mt-2">
          O link pode estar incorreto ou o relatório foi removido.
        </p>
      </div>
    )
  }

  const metricas = data.metricas_json || {}
  const top3 = data.top_3_oportunidades_json || []
  const firstImpact = data.first_impact_json || {}

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-50 py-10 print:py-0 print:bg-[#0a0a0a] font-sans">
      <style>
        {`
          @media print {
            body {
              background-color: #0a0a0a !important;
              color: #f8fafc !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-exact {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      <div className="max-w-[900px] mx-auto bg-[#0a0a0a] p-8 sm:p-12 print:p-8">
        <div className="fixed top-6 right-6 print:hidden z-50">
          <Button
            onClick={() => window.print()}
            className="bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold shadow-lg rounded-full px-6 h-12 flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Salvar PDF
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12 flex flex-col items-center">
          <img src={logoImg} alt="Adapta Pass" className="h-12 object-contain mb-6" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Plano de Sucesso e Diagnóstico de IA
          </h1>
        </div>

        {/* Dados da Empresa */}
        <div className="bg-[#171717] border border-[#262626] rounded-xl p-6 mb-8 print-exact break-inside-avoid">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-[#262626] pb-3">
            Dados da Empresa
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div>
              <span className="text-slate-400 mr-2">Empresa:</span>{' '}
              <strong className="text-slate-100">{data.empresas?.nome || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-400 mr-2">CNPJ:</span>{' '}
              <strong className="text-slate-100">{data.empresas?.cnpj || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-400 mr-2">Responsável:</span>{' '}
              <strong className="text-slate-100">{data.empresas?.responsavel_nome || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-400 mr-2">E-mail:</span>{' '}
              <strong className="text-slate-100">{data.empresas?.responsavel_email || '-'}</strong>
            </div>
          </div>
        </div>

        {/* Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Nota Geral */}
          <div className="bg-[#171717] border border-[#262626] rounded-xl p-6 print-exact break-inside-avoid flex flex-col justify-center">
            <h3 className="text-slate-400 text-sm font-semibold mb-2">Nota Geral</h3>
            <div className="text-6xl font-black text-white mb-2 leading-none">
              {data.nota_geral || '0.0'}
            </div>
            <div
              className="text-lg font-bold"
              style={{ color: getClassificationColor(data.nota_geral || 0) }}
            >
              {data.classificacao_geral || getClassificacaoLabel(data.nota_geral || 0)}
            </div>
          </div>

          {/* Maturidade por Dimensão */}
          <div className="md:col-span-2 bg-[#171717] border border-[#262626] rounded-xl p-6 print-exact break-inside-avoid flex flex-col justify-center">
            <h3 className="text-slate-400 text-sm font-semibold mb-6">Maturidade por Dimensão</h3>
            <div className="space-y-5">
              {[
                { label: 'Amplificar (A)', nota: data.nota_a },
                { label: 'Sistematizar (S)', nota: data.nota_s },
                { label: 'Automatizar (A)', nota: data.nota_au },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-200">{item.label}</span>
                    <span style={{ color: getScoreColor(item.nota || 0, 10) }}>
                      {item.nota || 0}/10
                    </span>
                  </div>
                  <div className="h-2.5 bg-[#262626] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 print-exact"
                      style={{
                        width: `${((item.nota || 0) / 10) * 100}%`,
                        backgroundColor: getScoreColor(item.nota || 0, 10),
                        printColorAdjust: 'exact',
                        WebkitPrintColorAdjust: 'exact',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Métricas Chave Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#171717] border border-[#262626] rounded-xl p-6 print-exact break-inside-avoid">
            <h3 className="text-slate-400 text-sm font-semibold mb-3">Pessoas Impactadas</h3>
            <div
              className="text-2xl font-black mb-2"
              style={{ color: getMetricaColor(metricas?.pessoas_impactadas?.nivel) }}
            >
              {metricas?.pessoas_impactadas?.nivel || '-'}
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {metricas?.pessoas_impactadas?.descricao || ''}
            </p>
          </div>

          <div className="bg-[#171717] border border-[#262626] rounded-xl p-6 print-exact break-inside-avoid">
            <h3 className="text-slate-400 text-sm font-semibold mb-3">Horas Recuperadas</h3>
            <div className="text-2xl font-black mb-2" style={{ color: '#ec4899' }}>
              {metricas?.horas_recuperadas?.estimativa || '-'}
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {metricas?.horas_recuperadas?.descricao || ''}
            </p>
          </div>

          <div className="bg-[#171717] border border-[#262626] rounded-xl p-6 print-exact break-inside-avoid">
            <h3 className="text-slate-400 text-sm font-semibold mb-3">Dependência do Dono</h3>
            <div className="text-2xl font-black mb-2" style={{ color: '#f59e0b' }}>
              {metricas?.dependencia_do_dono?.percentual || '0'}%
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {metricas?.dependencia_do_dono?.descricao || ''}
            </p>
          </div>
        </div>

        {/* Plano de Sucesso */}
        <h2 className="text-2xl font-bold text-[#2dd4bf] border-b border-[#262626] pb-3 mb-6 break-inside-avoid">
          Plano de Sucesso
        </h2>

        {data.complemento_sucesso && (
          <div className="bg-[#171717] border border-[#262626] rounded-xl p-6 mb-6 print-exact break-inside-avoid">
            <h3 className="text-lg font-bold text-white mb-4">Resumo Executivo</h3>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {data.complemento_sucesso}
            </div>
          </div>
        )}

        {firstImpact.acao && (
          <div className="bg-[#171717] border border-[#262626] rounded-xl p-6 mb-6 print-exact break-inside-avoid">
            <h3 className="text-lg font-bold text-white mb-4">{firstImpact.acao}</h3>
            <ul className="space-y-3">
              {(Array.isArray(firstImpact.descricao)
                ? firstImpact.descricao
                : [firstImpact.descricao]
              ).map((d: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                  <span className="text-[#2dd4bf] text-lg leading-none mt-0.5">•</span> {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {top3.length > 0 && (
          <div className="bg-[#171717] border border-[#262626] rounded-xl p-6 mb-12 print-exact break-inside-avoid">
            <h3 className="text-lg font-bold text-white mb-4">Top 3 Oportunidades</h3>
            <ul className="space-y-4">
              {top3.map((op: any, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className="text-[#2dd4bf] text-lg leading-none mt-0.5">•</span>
                  <div>
                    <strong className="text-white block sm:inline">{op.nome}</strong>
                    <span className="text-[#2dd4bf] text-xs font-bold uppercase tracking-wider block sm:inline sm:ml-2 mt-1 sm:mt-0">
                      ({op.bloco})
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* History */}
        <h2 className="text-2xl font-bold text-[#2dd4bf] border-b border-[#262626] pb-3 mb-6 break-inside-avoid mt-16 pt-8 print:mt-0 print:pt-0">
          Histórico de Respostas
        </h2>

        <SectionResponses title="Sessão Amplificar" prefix="A" data={data} />
        <SectionResponses title="Sessão Sistematizar" prefix="S" data={data} />
        <SectionResponses title="Sessão Automatizar" prefix="Au" data={data} />
        <SectionResponses title="Sessão Transformar" prefix="T" data={data} />

        <div className="mt-16 pt-8 border-t border-[#262626] text-center text-slate-500 text-xs">
          <p>
            Este documento é estritamente confidencial e foi gerado pelo Adapta Pass para uso
            exclusivo de <strong>{data.empresas?.nome || 'sua empresa'}</strong>.
          </p>
          <p className="mt-2">© {new Date().getFullYear()} Adapta. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}
