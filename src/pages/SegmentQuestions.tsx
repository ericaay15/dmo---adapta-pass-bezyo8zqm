import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Logo } from '@/components/Logo'
import useDiagnosisStore from '@/stores/useDiagnosisStore'

const segmentQuestions: Record<string, string[]> = {
  Medicina: [
    'Análise de exames e laudos',
    'Redação de prontuários',
    'Atendimento e triagem inicial',
    'Material educativo para pacientes',
    'Automação de whatsapp com IA',
    'Pesquisa científica e literatura',
    'Posologia e Receituário médico',
    'Criação de slides e apresentações',
  ],
  Saúde: [
    'Triagem e pré-diagnóstico',
    'Gestão de agendamentos ou escalas',
    'Suporte administrativo',
    'Educação de pacientes',
    'Análise de dados clínicos',
    'Comunicação com pacientes',
    'Preenchimento de prontuários',
    'Elaboração de dieta para pacientes',
    'Criação de anamnese para pacientes',
  ],
  'Construção / Engenharia': [
    'Renderização de projetos e plantas',
    'Análise de viabilidade técnica',
    'Orçamentos de compras e planilhas',
    'Gestão de projetos',
    'Relatórios técnicos',
    'Análise de documentação de obra',
    'Cálculos de base estrutural e demais cálculos',
  ],
  'E-commerce': [
    'Análise de campanhas de tráfego',
    'Atendimento ao cliente',
    'Descrição e título de produtos',
    'Gestão de inventário',
    'Criação de imagens com IA',
    'Pesquisa de fornecedores',
  ],
  'Varejo / Comércio': [
    'Atendimento ao cliente',
    'Análise de vendas',
    'Gestão de estoque',
    'Gestão de compras',
    'Criação de promoções',
    'Elaboração e melhoria de planilhas',
  ],
  Financeiro: [
    'Análise de resultados financeiros',
    'Elaboração de relatórios e pareceres contábeis',
    'Propostas e materiais educativos de investimento',
    'Estruturação de fluxo financeiro',
    'Criação de relatórios e dashboards',
    'Atendimento ao cliente',
  ],
  Vendas: [
    'Prospecção e qualificação de leads',
    'Pesquisa de prospects pré-reunião',
    'Argumentação de venda e quebra de objeções',
    'Follow-up com prospectos',
    'Estruturação de propostas',
    'Simulação de vendas com roleplay',
  ],
  Marketing: [
    'Criação de conteúdo para redes sociais',
    'Copywriting de anúncios',
    'Análise de campanhas e resultados',
    'Formulação de estratégias',
    'Análise de briefings',
    'Pesquisa de mercado e concorrentes',
  ],
  Tecnologia: [
    'Criação de documentos de requisitos (PRD)',
    'Desenvolvimento e revisão de código com IA',
    'Leitura e interpretação de documentações técnicas',
    'Configuração e parametrização de sistemas',
    'Pesquisa e análise de concorrentes e suas funcionalidades',
    'Criação e atualização de documentação interna',
    'Geração de casos de teste e QA',
    'Suporte técnico e resolução de chamados',
  ],
}

export default function SegmentQuestions() {
  const navigate = useNavigate()
  const { data: storeData, updateData } = useDiagnosisStore()
  const [selected, setSelected] = useState<string[]>(storeData.temasSelecionados || [])
  const [otherText, setOtherText] = useState(storeData.temaOutros || '')

  const segmento = storeData.segmento
  const predefined = segmentQuestions[segmento] || []
  const isOtherOnly = predefined.length === 0

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
      storeData.t4,
    )
  }

  const isPreviousValid = hasCompletedPreviousBlocks()
  const isFormValid = isOtherOnly
    ? otherText.trim().length > 0
    : selected.length > 0 || otherText.trim().length > 0
  const canSubmit = isPreviousValid && isFormValid

  const toggleItem = (item: string) => {
    setSelected((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    updateData({ temasSelecionados: selected, temaOutros: otherText })
    navigate('/ferramentas')
  }

  return (
    <div className="flex-1 flex flex-col items-center py-10 md:py-20 animate-fade-in-up">
      <div className="w-full max-w-2xl mb-8 flex flex-col gap-6 px-4 md:px-0">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            asChild
            className="text-slate-400 hover:text-white hover:bg-white/5 -ml-4"
          >
            <Link to="/bloco-t">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
          <Logo className="text-2xl" />
          <div className="w-[88px]" />
        </div>

        <div className="space-y-2 w-full">
          <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
            <span>Passo 6: Personalização</span>
            <span>90%</span>
          </div>
          <Progress value={90} className="h-1.5 bg-white/10 [&>div]:bg-[#2dd4bf]" />
        </div>
      </div>

      <div className="w-full max-w-2xl relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2dd4bf]/30 to-[#f45961]/30 rounded-3xl blur-xl opacity-50 z-0"></div>

        <div className="relative bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-10 shadow-2xl z-10">
          <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-3">
              Aprofundando no seu segmento:{' '}
              <span className="bg-gradient-to-r from-[#4bb7a5] via-[#957588] to-[#f45961] bg-clip-text text-transparent font-extrabold uppercase">
                {segmento || 'Outros'}
              </span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base font-normal leading-relaxed">
              {isOtherOnly
                ? 'Descreva as atividades que mais tomam tempo da sua semana hoje:'
                : `Esses são os temas mais abordados por clientes de ${segmento?.toLowerCase()} em consultoria. Selecione os que você mais gostaria de trabalhar.`}
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
              {!isOtherOnly && (
                <div className="grid grid-cols-1 gap-4">
                  {predefined.map((item) => (
                    <label
                      key={item}
                      className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={selected.includes(item)}
                        onCheckedChange={() => toggleItem(item)}
                        className="border-slate-500 data-[state=checked]:bg-[#2dd4bf] data-[state=checked]:border-[#2dd4bf] data-[state=checked]:text-black w-5 h-5"
                      />
                      <span className="text-slate-200 text-sm md:text-base font-medium">
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm md:text-base text-slate-300 font-medium block">
                  {isOtherOnly
                    ? 'Descreva abaixo:'
                    : 'Caso tenha uma ideia fora da lista, responda em OUTROS:'}
                </label>
                {isOtherOnly ? (
                  <Textarea
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder="Quais atividades tomam mais tempo?"
                    className="bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#2dd4bf] min-h-[120px] resize-y"
                  />
                ) : (
                  <Input
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder="Outro tema..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#2dd4bf] h-12"
                  />
                )}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <Button
                type="button"
                variant="outline"
                asChild
                className="w-full sm:w-1/3 border-white/10 text-white hover:bg-white/5 hover:text-white h-14 text-lg rounded-xl"
              >
                <Link to="/bloco-t">Voltar</Link>
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full sm:w-2/3 bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold h-14 text-lg rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] disabled:opacity-50 disabled:hover:shadow-none group"
              >
                Próximo Passo
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
