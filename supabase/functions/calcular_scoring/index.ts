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
    const { A1, A2, A3, A4, A5, S1, S2, S3, S4, S5, Au1, Au2, Au3, Au4, Au5, T1, T2, T3 } = body

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

    const top_3_oportunidades = sortedBlocos.map((b) => ({
      bloco: b.id,
      nome: b.nome,
      nota: b.nota,
      classificacao: getClassificacao(b.nota),
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
      horasRecuperadasEstimativa = '15h+'
      horasRecuperadasTexto = 'Muitas horas perdidas em tarefas manuais.'
    } else if (horasRecuperadasSum <= 9) {
      horasRecuperadasNivel = 'Moderado'
      horasRecuperadasEstimativa = '8–15h'
      horasRecuperadasTexto = 'Oportunidade considerável de ganho de tempo.'
    } else if (horasRecuperadasSum <= 12) {
      horasRecuperadasNivel = 'Em progresso'
      horasRecuperadasEstimativa = '2–8h'
      horasRecuperadasTexto = 'Boas automações em vigor, mas com espaço para otimização.'
    } else {
      horasRecuperadasNivel = 'Avançado'
      horasRecuperadasEstimativa = '<2h'
      horasRecuperadasTexto = 'Alta eficiência em automação, equipe focada no estratégico.'
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

    const firstImpactBloco = sortedBlocos[0]
    let acao = ''
    let descricao = ''
    if (firstImpactBloco.id === 'A') {
      acao = 'Otimizar Atração'
      descricao =
        'Foque em estruturar seus canais de aquisição e melhorar as taxas de conversão de leads.'
    } else if (firstImpactBloco.id === 'S') {
      acao = 'Implementar Sistemas'
      descricao =
        'Comece padronizando os processos críticos e centralizando as informações do negócio.'
    } else {
      acao = 'Criar Automações'
      descricao =
        'Identifique a tarefa manual mais repetitiva e implemente uma automação simples para ela.'
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
        prazo: '60 dias',
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
