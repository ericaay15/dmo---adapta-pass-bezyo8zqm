import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import logoImg from '@/assets/adapta-pass-logo-white-5b4d9.png'

const questionsMap: Record<string, string> = {
  A1: 'Qual a proporção do seu time que já utiliza ferramentas de IA de forma independente?',
  A2: 'Como a empresa utiliza os dados para tomar decisões de negócio?',
  A3: 'Qual o nível de envolvimento da liderança com a adoção de novas tecnologias?',
  A4: 'A empresa possui programas de treinamento contínuo para a equipe?',
  A5: 'Como a empresa mede o sucesso de suas iniciativas de inovação e automação?',
  A6: 'Descreva brevemente a principal iniciativa ou processo que você gostaria de melhorar (Bloco A).',

  S1: 'Como os processos principais da empresa são documentados?',
  S2: 'Como ocorre o processo de integração (onboarding) de um novo colaborador?',
  S3: 'Qual o nível de dependência da empresa em relação a pessoas-chave (incluindo o dono)?',
  S4: 'Onde a maior parte das informações operacionais da empresa é armazenada?',
  S5: 'Como a empresa constrói e atualiza sua base de conhecimento interna?',
  S6: 'Existe alguma ferramenta que você considera essencial para o funcionamento do seu negócio? Qual?',

  Au1: 'Quanto do trabalho diário da equipe é composto por tarefas manuais e repetitivas?',
  Au2: 'Como a empresa lida com fluxos constantes de trabalho (ex: follow-ups, emissões)?',
  Au3: 'Há um mapeamento claro dos processos antes de tentar automatizá-los?',
  Au4: 'Qual o foco principal da sua empresa ao tentar automatizar processos?',
  Au5: 'Como é feito o acompanhamento de metas e KPIs na empresa?',
  Au6: 'Se você pudesse automatizar uma única tarefa hoje, qual seria e por quê?',

  T1: 'Nível de sobrecarga da equipe e impacto em produtividade',
  T2: 'Quantidade de horas semanais dedicadas a tarefas estritamente operacionais ou "apagar incêndios"',
  T3: 'Nível de urgência para implementar melhorias e ver resultados no curto prazo',
  T4: 'Qual é o principal desafio estratégico que você espera resolver nos próximos 90 dias?',
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
  const sectionKeys = Object.keys(questionsMap).filter((k) => k.startsWith(prefix))

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
            resposta = aberta ? aberta.resposta : 'Não respondido'
          }

          if (resposta === undefined || resposta === null) return null

          return (
            <div
              key={k}
              className="bg-[#171717] border border-[#262626] p-5 rounded-xl print-exact break-inside-avoid"
            >
              <div className="text-sm font-semibold text-slate-400 mb-2">{questionsMap[k]}</div>
              <div className="text-sm text-slate-200">
                {isAberta ? (
                  <span className="whitespace-pre-wrap leading-relaxed">{resposta}</span>
                ) : (
                  <span>
                    <strong className="text-[#2dd4bf] text-base">{resposta}</strong>{' '}
                    <span className="text-slate-500">
                      / {k.startsWith('T') && k !== 'T4' ? 10 : 5}
                    </span>
                  </span>
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
                { label: 'Automatizar (Au)', nota: data.nota_au },
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
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${((item.nota || 0) / 10) * 100}%`,
                        backgroundColor: getScoreColor(item.nota || 0, 10),
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

        <SectionResponses title="Amplificar" prefix="A" data={data} />
        <SectionResponses title="Sistematizar" prefix="S" data={data} />
        <SectionResponses title="Automatizar" prefix="Au" data={data} />
        <SectionResponses title="Plano Estratégico" prefix="T" data={data} />

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
