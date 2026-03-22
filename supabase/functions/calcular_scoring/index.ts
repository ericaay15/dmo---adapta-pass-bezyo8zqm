import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

function getClassificacao(nota: number): string {
  if (nota < 4) return 'Inicial'
  if (nota < 7) return 'Em progresso'
  if (nota < 9) return 'Avançado'
  return 'Excelente'
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { A1, A2, A3, A4, A5, S1, S2, S3, S4, S5, Au1, Au2, Au3, Au4, Au5, T1, T2, T3, T4 } = body

    const validate1to5 = (val: any, name: string) => {
      if (!Number.isInteger(val) || val < 1 || val > 5) {
        throw new Error(`O campo ${name} deve ser um inteiro entre 1 e 5.`)
      }
    }

    const validate1to10 = (val: any, name: string) => {
      if (!Number.isInteger(val) || val < 1 || val > 10) {
        throw new Error(`O campo ${name} deve ser um inteiro entre 1 e 10.`)
      }
    }

    try {
      ;['A1', 'A2', 'A3', 'A4', 'A5'].forEach((k) => validate1to5(body[k], k))
      ;['S1', 'S2', 'S3', 'S4', 'S5'].forEach((k) => validate1to5(body[k], k))
      ;['Au1', 'Au2', 'Au3', 'Au4', 'Au5'].forEach((k) => validate1to5(body[k], k))
      ;['T1', 'T2', 'T3'].forEach((k) => validate1to10(body[k], k))
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const somaA = A1 + A2 + A3 + A4 + A5
    const somaS = S1 + S2 + S3 + S4 + S5
    const somaAu = Au1 + Au2 + Au3 + Au4 + Au5
    const somaT = T1 + T2 + T3

    const round1 = (num: number) => Math.round(num * 10) / 10

    const notaA = round1(((somaA - 5) / 20) * 10)
    const notaS = round1(((somaS - 5) / 20) * 10)
    const notaAu = round1(((somaAu - 5) / 20) * 10)
    const notaT = round1(((somaT - 3) / 27) * 10)

    const notaGeral = round1((notaA + notaS + notaAu + notaT) / 4)

    const blocosArray = [
      { id: 'A', nome: 'Atrair', nota: notaA, soma_raw: somaA },
      { id: 'S', nome: 'Sistematizar', nota: notaS, soma_raw: somaS },
      { id: 'Au', nome: 'Automatizar', nota: notaAu, soma_raw: somaAu },
    ]

    const priority = { Au: 3, A: 2, S: 1 }

    const sortedBlocos = [...blocosArray].sort((a, b) => {
      if (a.nota !== b.nota) return a.nota - b.nota
      return priority[b.id as keyof typeof priority] - priority[a.id as keyof typeof priority]
    })

    const questionMap = [
      {
        id: 'A1',
        val: A1,
        bloco: 'Amplificar',
        rec: 'Trazer mais pessoas do time para usar a IA no trabalho diário.',
      },
      {
        id: 'A2',
        val: A2,
        bloco: 'Amplificar',
        rec: 'Aprofundar o uso de IA além de tarefas básicas, explorando simulações e decisões estratégicas.',
      },
      {
        id: 'A3',
        val: A3,
        bloco: 'Amplificar',
        rec: 'Engajar a liderança no uso ativo de IA para o pensamento e planejamento do negócio.',
      },
      {
        id: 'A4',
        val: A4,
        bloco: 'Amplificar',
        rec: 'Estruturar um programa de capacitação formal em IA para nivelar o conhecimento da equipe.',
      },
      {
        id: 'A5',
        val: A5,
        bloco: 'Amplificar',
        rec: 'Focar em projetos e rotinas de IA que gerem resultados tangíveis e mensuráveis rapidamente.',
      },
      {
        id: 'S1',
        val: S1,
        bloco: 'Sistematizar',
        rec: 'Mapear e documentar os processos críticos da empresa para que fiquem claros e acessíveis a todos.',
      },
      {
        id: 'S2',
        val: S2,
        bloco: 'Sistematizar',
        rec: 'Criar um sistema completo de onboarding estruturado para facilitar a entrada de novos colaboradores.',
      },
      {
        id: 'S3',
        val: S3,
        bloco: 'Sistematizar',
        rec: 'Sistematizar o conhecimento crítico da empresa para reduzir drasticamente a dependência de pessoas-chave.',
      },
      {
        id: 'S4',
        val: S4,
        bloco: 'Sistematizar',
        rec: 'Adotar sistemas integrados (CRM, ERPs) para substituir controles dispersos em planilhas e WhatsApp.',
      },
      {
        id: 'S5',
        val: S5,
        bloco: 'Sistematizar',
        rec: 'Criar e alimentar uma base de conhecimento interna para que o time tenha onde consultar informações rapidamente.',
      },
      {
        id: 'Au1',
        val: Au1,
        bloco: 'Automatizar',
        rec: 'Identificar e aplicar automações nas tarefas mais repetitivas que sobrecarregam o dia a dia da equipe.',
      },
      {
        id: 'Au2',
        val: Au2,
        bloco: 'Automatizar',
        rec: 'Implementar automações ativas para fluxos constantes como follow-ups, agendamentos e emissões de relatórios.',
      },
      {
        id: 'Au3',
        val: Au3,
        bloco: 'Automatizar',
        rec: 'Mapear todos os processos operacionais ainda manuais e arquitetar fluxos de automação para eles.',
      },
      {
        id: 'Au4',
        val: Au4,
        bloco: 'Automatizar',
        rec: 'Recuperar horas da equipe automatizando processos para que foquem em trabalho mais estratégico.',
      },
      {
        id: 'Au5',
        val: Au5,
        bloco: 'Automatizar',
        rec: 'Implementar a coleta de dados e criação de dashboards automáticos para o acompanhamento de KPIs.',
      },
    ]

    questionMap.sort((a, b) => a.val - b.val)

    const top_3_oportunidades = questionMap.slice(0, 3).map((q) => ({
      bloco: q.bloco,
      nome: q.rec,
      nota: q.val,
      classificacao: q.val <= 2 ? 'Crítico' : q.val <= 3 ? 'Atenção' : 'Oportunidade de Melhoria',
    }))

    const pessoasImpactadasSum = A1 + A4 + A5
    let pessoasImpactadasNivel = ''
    let pessoasImpactadasTexto = ''
    if (pessoasImpactadasSum <= 5) {
      pessoasImpactadasNivel = 'Crítico'
      pessoasImpactadasTexto = 'Alto impacto negativo na equipe devido à sobrecarga operacional.'
    } else if (pessoasImpactadasSum <= 9) {
      pessoasImpactadasNivel = 'Moderado'
      pessoasImpactadasTexto = 'Impacto moderado, com oportunidades de aliviar a operação.'
    } else if (pessoasImpactadasSum <= 12) {
      pessoasImpactadasNivel = 'Em expansão'
      pessoasImpactadasTexto = 'Equipe com boa produtividade, mas pode escalar mais.'
    } else {
      pessoasImpactadasNivel = 'Avançado'
      pessoasImpactadasTexto = 'Operação altamente eficiente com baixo impacto negativo na equipe.'
    }

    const horasRecuperadasSum = Au1 + Au2 + Au4
    let horasRecuperadasNivel = ''
    let horasRecuperadasTexto = ''
    let horasRecuperadasEstimativa = ''

    if (horasRecuperadasSum <= 5) {
      horasRecuperadasNivel = 'Crítico'
      horasRecuperadasEstimativa = '15h+ por colaborador'
      horasRecuperadasTexto = 'Alto potencial de ganho em processes manuais.'
    } else if (horasRecuperadasSum <= 10) {
      horasRecuperadasNivel = 'Moderado'
      horasRecuperadasEstimativa = '8h+ por colaborador'
      horasRecuperadasTexto = 'Otimização de gargalos operacionais.'
    } else {
      horasRecuperadasNivel = 'Avançado'
      horasRecuperadasEstimativa = '5h+ por colaborador'
      horasRecuperadasTexto =
        'Manutenção da eficiência com ganho incremental, garantindo o patamar mínimo dos estudos de mercado.'
    }

    const depDonoPercent = Math.max(0, Math.min(100, Math.round(100 - notaT * 10)))
    let depDonoNivel = ''
    let depDonoTexto = ''
    if (depDonoPercent >= 70) {
      depDonoNivel = 'Crítica'
      depDonoTexto = 'A empresa é altamente dependente de você para funcionar.'
    } else if (depDonoPercent >= 40) {
      depDonoNivel = 'Moderada'
      depDonoTexto = 'Você ainda apaga muitos incêndios operacionais.'
    } else if (depDonoPercent >= 20) {
      depDonoNivel = 'Baixa'
      depDonoTexto = 'A operação roda bem na maior parte do tempo sem você.'
    } else {
      depDonoNivel = 'Mínima'
      depDonoTexto = 'Negócio independente e escalável.'
    }

    const isT4Invalid = (text: any) => {
      if (!text || typeof text !== 'string') return true
      const t = text.trim().toLowerCase()
      if (t.length < 3) return true
      const invalidList = [
        'não sei',
        'nao sei',
        'nenhum',
        'nenhuma',
        'nada',
        'sei la',
        'sei lá',
        'não tenho',
        'nao tenho',
        'nao pensei',
        'não pensei',
      ]
      return invalidList.some((invalid) => t.includes(invalid)) && t.length < 15
    }

    const firstImpactBloco = sortedBlocos[0]
    let acao = ''
    let descricao: string[] = []

    if (!isT4Invalid(T4)) {
      acao = 'Foco no Desafio Estratégico de 90 Dias'
      descricao = [
        `Resolver o desafio principal: ${T4.trim()}`,
        'Trazer adoção de IA para toda a equipe',
        'Criar o primeiro sistema para tarefa repetitiva do dia a dia',
        'Automatizar os primeiros fluxos de rotina',
      ]
    } else {
      if (firstImpactBloco.id === 'A') {
        acao = 'Otimizar Atração e Capacitação'
        descricao = [
          'Estruturar a adoção de IA para toda a equipe e melhorar as taxas de conversão de leads',
          'Criar o primeiro sistema para tarefas repetitivas do dia a dia',
          'Automatizar os fluxos de rotina',
        ]
      } else if (firstImpactBloco.id === 'S') {
        acao = 'Implementar Sistemas e Processos'
        descricao = [
          'Criar o primeiro sistema para as tarefas repetitivas do dia a dia e centralizar as informações do negócio',
          'Trazer a adoção de IA para toda a equipe',
          'Automatizar os primeiros fluxos de rotina',
        ]
      } else {
        acao = 'Criar Automações Iniciais'
        descricao = [
          'Identificar a tarefa manual mais repetitiva e focar em automatizar os primeiros fluxos de rotina',
          'Trazer a adoção de IA para toda a equipe',
          'Criar o primeiro sistema para tarefas repetitivas do dia a dia',
        ]
      }
    }

    const responseData = {
      blocos: {
        A: { soma_raw: somaA, nota: notaA, classificacao: getClassificacao(notaA) },
        S: { soma_raw: somaS, nota: notaS, classificacao: getClassificacao(notaS) },
        Au: { soma_raw: somaAu, nota: notaAu, classificacao: getClassificacao(notaAu) },
        T: { soma_raw: somaT, nota: notaT, classificacao: getClassificacao(notaT) },
      },
      nota_geral: {
        valor: notaGeral,
        classificacao: getClassificacao(notaGeral),
      },
      top_3_oportunidades: top_3_oportunidades,
      metricas_chave: {
        pessoas_impactadas: {
          valor_bruto: pessoasImpactadasSum,
          nivel: pessoasImpactadasNivel,
          descricao: pessoasImpactadasTexto,
        },
        horas_recuperadas: {
          valor_bruto: horasRecuperadasSum,
          nivel: horasRecuperadasNivel,
          estimativa: horasRecuperadasEstimativa,
          descricao: horasRecuperadasTexto,
        },
        dependencia_do_dono: {
          percentual: depDonoPercent,
          nivel: depDonoNivel,
          descricao: depDonoTexto,
        },
      },
      first_impact: {
        acao: acao,
        descricao: descricao,
        prazo: '90 dias',
        bloco: firstImpactBloco.id,
      },
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
