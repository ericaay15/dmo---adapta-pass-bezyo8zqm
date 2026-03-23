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

const SectionResponses = ({ title, prefix, json, questions, abertas }: any) => {
  const sectionKeys = Object.keys(questions).filter((k) => k.startsWith(prefix))

  return (
    <div className="mb-8 break-inside-avoid">
      <h3 className="text-xl font-bold text-teal-700 mb-4 border-b-2 border-slate-100 pb-2 flex items-center">
        <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-sm mr-3">
          {prefix}
        </span>
        {title}
      </h3>
      <div className="space-y-4">
        {sectionKeys.map((k) => {
          let resposta = json?.[k]
          const max = k.startsWith('T') && k !== 'T4' ? 10 : 5
          const isAberta = k.endsWith('6') || k === 'T4'

          if (isAberta) {
            const abertaData = abertas?.find(
              (a: any) =>
                (a.tipo_bloco === prefix && a.numero_pergunta === parseInt(k.replace(/\D/g, ''))) ||
                (a.tipo_bloco === 'T' && k === 'T4' && a.numero_pergunta === 4),
            )
            resposta = abertaData ? abertaData.resposta : 'Não respondido'
          }

          if (resposta === undefined || resposta === null) return null

          return (
            <div
              key={k}
              className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm break-inside-avoid"
            >
              <div className="font-bold text-slate-700 mb-2">{questions[k]}</div>
              <div className="text-slate-600 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                {isAberta ? (
                  <span className="whitespace-pre-wrap">{resposta}</span>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden print:border print:border-slate-300">
                      <div
                        className="h-full bg-teal-500 rounded-full print:bg-teal-600"
                        style={{ width: `${(Number(resposta) / max) * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-teal-700">
                      {resposta} <span className="text-slate-400 font-normal">/ {max}</span>
                    </span>
                  </div>
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Relatório não encontrado.</h2>
        <p className="text-slate-500 mt-2">
          O link pode estar incorreto ou o relatório foi removido.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 print:py-0 print:bg-white font-sans text-slate-900">
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none p-10 sm:p-16 print:p-0">
        {/* Floating Print Button */}
        <div className="fixed top-6 right-6 print:hidden z-50">
          <Button
            onClick={() => window.print()}
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg rounded-full px-6 h-12 flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Imprimir / Salvar PDF
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-teal-600 pb-8 mb-10 gap-6">
          <div>
            <div className="text-sm font-bold tracking-widest text-teal-600 uppercase mb-2">
              Adapta Pass
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              Plano de Sucesso <br /> e Diagnóstico de IA
            </h1>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl print:bg-slate-900 print:print-color-adjust-exact">
            <img src={logoImg} alt="Adapta" className="h-8 object-contain" />
          </div>
        </div>

        {/* Company Data */}
        <div className="bg-slate-50 rounded-2xl p-6 mb-10 border border-slate-100 print:border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="block text-slate-500 mb-1 text-xs uppercase font-bold tracking-wider">
                Empresa
              </span>
              <strong className="text-slate-900 text-base">
                {data.empresas?.nome || 'Não informado'}
              </strong>
            </div>
            <div>
              <span className="block text-slate-500 mb-1 text-xs uppercase font-bold tracking-wider">
                CNPJ
              </span>
              <strong className="text-slate-900 text-base">
                {data.empresas?.cnpj || 'Não informado'}
              </strong>
            </div>
            <div>
              <span className="block text-slate-500 mb-1 text-xs uppercase font-bold tracking-wider">
                Responsável
              </span>
              <strong className="text-slate-900 text-base">
                {data.empresas?.responsavel_nome || 'Não informado'}
              </strong>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <span className="block text-slate-500 mb-1 text-xs uppercase font-bold tracking-wider">
                Email
              </span>
              <strong className="text-slate-900 text-base break-all">
                {data.empresas?.responsavel_email || 'Não informado'}
              </strong>
            </div>
            <div>
              <span className="block text-slate-500 mb-1 text-xs uppercase font-bold tracking-wider">
                Data do Diagnóstico
              </span>
              <strong className="text-slate-900 text-base">
                {new Date(data.data_preenchimento).toLocaleDateString('pt-BR')}
              </strong>
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          <div className="bg-teal-50 border-2 border-teal-100 p-8 rounded-3xl flex-1 text-center flex flex-col justify-center print:border-teal-200">
            <div className="text-teal-800 font-bold mb-3 uppercase tracking-widest text-sm">
              Maturidade Geral
            </div>
            <div className="text-7xl font-black text-teal-600 mb-2">{data.nota_geral}</div>
            <div className="inline-flex items-center justify-center bg-teal-100 text-teal-800 px-4 py-1.5 rounded-full text-sm font-bold mx-auto print:border print:border-teal-200">
              de 10 pontos
            </div>
          </div>

          <div className="flex-[2] grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col items-center justify-center shadow-sm print:border-slate-200">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-teal-600 font-bold mb-3 shadow-sm print:border print:border-slate-200">
                A
              </div>
              <div className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">
                Amplificar
              </div>
              <div className="text-3xl font-black text-slate-800 mb-2">{data.nota_a}</div>
              <div className="text-xs font-medium bg-slate-200 text-slate-700 px-3 py-1 rounded-full print:border print:border-slate-300">
                {data.classificacao_a || '-'}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col items-center justify-center shadow-sm print:border-slate-200">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-teal-600 font-bold mb-3 shadow-sm print:border print:border-slate-200">
                S
              </div>
              <div className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">
                Sistematizar
              </div>
              <div className="text-3xl font-black text-slate-800 mb-2">{data.nota_s}</div>
              <div className="text-xs font-medium bg-slate-200 text-slate-700 px-3 py-1 rounded-full print:border print:border-slate-300">
                {data.classificacao_s || '-'}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col items-center justify-center shadow-sm print:border-slate-200">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-teal-600 font-bold mb-3 shadow-sm print:border print:border-slate-200">
                Au
              </div>
              <div className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">
                Automatizar
              </div>
              <div className="text-3xl font-black text-slate-800 mb-2">{data.nota_au}</div>
              <div className="text-xs font-medium bg-slate-200 text-slate-700 px-3 py-1 rounded-full print:border print:border-slate-300">
                {data.classificacao_au || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Success Plan Summary */}
        <div className="mb-12 print:break-inside-avoid">
          <h2 className="text-2xl font-black text-slate-900 border-b-2 border-slate-100 pb-3 mb-6">
            Resumo Executivo do Plano
          </h2>

          {data.complemento_sucesso && (
            <div className="bg-slate-800 text-white p-6 sm:p-8 rounded-2xl mb-8 shadow-md print:bg-slate-100 print:text-slate-900 print:print-color-adjust-exact">
              <p className="whitespace-pre-wrap leading-relaxed text-lg">
                {data.complemento_sucesso}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.first_impact_json && (
              <div className="bg-teal-50/50 border border-teal-100 p-6 rounded-2xl print:border-teal-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-teal-100 text-teal-700 p-2 rounded-lg print:border print:border-teal-200">
                    🚀
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">Ação de Primeiros 90 Dias</h3>
                </div>
                <strong className="block text-teal-700 mb-4 text-lg leading-tight">
                  {data.first_impact_json.acao}
                </strong>
                <ul className="space-y-3">
                  {(data.first_impact_json.descricao || []).map((d: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 flex-shrink-0" />
                      <span className="leading-snug">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.top_3_oportunidades_json && (
              <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl print:border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-lg print:border print:border-blue-200">
                    💡
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">Top 3 Oportunidades</h3>
                </div>
                <ul className="space-y-4">
                  {data.top_3_oportunidades_json.map((op: any, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5 print:border print:border-blue-300">
                        {i + 1}
                      </div>
                      <div>
                        <strong className="block text-slate-800 leading-snug">{op.nome}</strong>
                        <span className="text-blue-600 text-xs font-bold uppercase tracking-wider mt-1 block">
                          {op.bloco}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Answers History */}
        <div className="print:break-before-page pt-8">
          <h2 className="text-2xl font-black text-slate-900 border-b-2 border-slate-100 pb-3 mb-8">
            Detalhamento das Respostas
          </h2>

          <SectionResponses
            title="Amplificar"
            prefix="A"
            json={data.respostas_json}
            questions={questionsMap}
            abertas={data.respostas_abertas}
          />
          <SectionResponses
            title="Sistematizar"
            prefix="S"
            json={data.respostas_json}
            questions={questionsMap}
            abertas={data.respostas_abertas}
          />
          <SectionResponses
            title="Automatizar"
            prefix="Au"
            json={data.respostas_json}
            questions={questionsMap}
            abertas={data.respostas_abertas}
          />
          <SectionResponses
            title="Plano Estratégico (90 Dias)"
            prefix="T"
            json={data.respostas_json}
            questions={questionsMap}
            abertas={data.respostas_abertas}
          />
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
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
