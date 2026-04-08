import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const sessionId = body.session_id

    if (!sessionId) {
      return new Response(JSON.stringify({ success: false, error: 'session_id is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const webhookUrl = Deno.env.get('WEBHOOK_URL')
    if (!webhookUrl) {
      return new Response(JSON.stringify({ success: false, error: 'Webhook URL not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return new Response(JSON.stringify({ success: false, error: 'Session not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', session.company_id)
      .single()

    const { data: aggregatedAnswers } = await supabase
      .from('aggregated_answers')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    const scoring: any = session.scoring_json || {}
    const answersJson: any = aggregatedAnswers?.answers_json || {}

    const questionsMap: Record<string, string> = {
      A1: 'Quantas pessoas do time usam IA no trabalho diário?',
      A2: 'Qual a profundidade do uso de IA?',
      A3: 'A liderança usa IA ativamente para pensar o negócio?',
      A4: 'O time recebeu capacitação formal em IA nos últimos 6 meses?',
      A5: 'A IA já gerou um resultado tangível e mensurável no negócio?',
      A6: 'Qual foi o melhor resultado que você já teve usando IA? Se não teve, o que esperaria conseguir?',
      S1: 'Os processos críticos da empresa estão documentados?',
      S2: 'Quando alguém novo entra, existe um sistema de onboarding estruturado?',
      S3: 'Se uma pessoa-chave saísse hoje, quanto conhecimento crítico se perderia?',
      S4: 'A empresa usa ferramentas integradas (CRM, controles, fluxos) ou planilhas/WhatsApp?',
      S5: 'Existe uma base de conhecimento interna que o time consulta?',
      S6: 'Qual é o processo mais crítico da empresa que ainda mora na cabeça de alguém?',
      Au1: 'Quantas tarefas repetitivas do dia a dia já foram automatizadas?',
      Au2: 'A empresa tem automações rodando (follow-ups, relatórios, agendamentos)?',
      Au3: 'Existem processos que humanos fazem manualmente mas que poderiam ser automáticos?',
      Au4: 'O time gasta quanto tempo por semana em tarefas puramente operacionais/repetitivas?',
      Au5: 'A empresa monitora KPIs automaticamente ou alguém monta relatórios manualmente?',
      Au6: 'Qual tarefa do dia a dia você mais gostaria de nunca mais ter que fazer?',
      T1: 'Numa escala de 1-10, o quanto a empresa funciona sem você (dono) no operacional diário?',
      T2: 'Numa escala de 1-10, quanto controle você tem sobre os números do negócio em tempo real?',
      T3: 'Numa escala de 1-10, o quanto você sente que a empresa está preparada pro futuro com IA?',
      T4: 'Se você pudesse resolver UM problema do seu negócio nos próximos 90 dias, qual seria?',
    }

    const answersArray: any[] = []

    for (const [key, label] of Object.entries(questionsMap)) {
      const val = answersJson[key]
      if (val !== undefined && val !== null && val !== '') {
        const block = key.startsWith('Au') ? 'Au' : key.replace(/[0-9]/g, '')
        answersArray.push({
          key,
          label,
          block,
          type: key.endsWith('6') || key === 'T4' ? 'text' : 'numeric',
          value: String(val),
        })
      }
    }

    if (
      answersJson.temasSelecionados !== undefined &&
      answersJson.temasSelecionados !== null &&
      answersJson.temasSelecionados !== '' &&
      (Array.isArray(answersJson.temasSelecionados)
        ? answersJson.temasSelecionados.length > 0
        : true)
    ) {
      answersArray.push({
        key: 'temasSelecionados',
        label: 'Temas selecionados para aprofundamento',
        block: 'SEG',
        type: 'array',
        value: Array.isArray(answersJson.temasSelecionados)
          ? answersJson.temasSelecionados.join(', ')
          : String(answersJson.temasSelecionados),
      })
    }

    if (
      answersJson.temaOutros !== undefined &&
      answersJson.temaOutros !== null &&
      answersJson.temaOutros !== ''
    ) {
      answersArray.push({
        key: 'temaOutros',
        label: 'Outros temas mencionados',
        block: 'SEG',
        type: 'text',
        value: String(answersJson.temaOutros),
      })
    }

    const topOportunidades = (scoring.top_3_oportunidades || []).map(
      (item: any, index: number) => ({
        posicao: index + 1,
        bloco: item.bloco,
        recomendacao: item.nome,
        nota: item.nota,
        classificacao: item.classificacao,
      }),
    )

    const payload = {
      event: 'diagnosis_completed',
      timestamp: new Date().toISOString(),
      session_id: session.id,
      pdf_url: session.pdf_url || '',
      company_name: company?.name || '',
      company_cnpj: company?.cnpj || '',
      company_segment: company?.segment || '',
      company_filler_email: company?.filler_email || '',
      filled_by: session.filled_by || '',
      responsible_name: session.responsible_name || '',
      responsible_email: session.responsible_email || '',
      score_a: scoring.blocos?.A?.nota ?? null,
      score_s: scoring.blocos?.S?.nota ?? null,
      score_au: scoring.blocos?.Au?.nota ?? null,
      score_t: scoring.blocos?.T?.nota ?? null,
      score_geral: scoring.nota_geral?.valor ?? null,
      classification_a: scoring.blocos?.A?.classificacao || '',
      classification_s: scoring.blocos?.S?.classificacao || '',
      classification_au: scoring.blocos?.Au?.classificacao || '',
      classification_t: scoring.blocos?.T?.classificacao || '',
      classification_geral: scoring.nota_geral?.classificacao || '',
      metric_pessoas_impactadas_nivel: scoring.metricas_chave?.pessoas_impactadas?.nivel || '',
      metric_pessoas_impactadas_descricao:
        scoring.metricas_chave?.pessoas_impactadas?.descricao || '',
      metric_horas_recuperadas_nivel: scoring.metricas_chave?.horas_recuperadas?.nivel || '',
      metric_horas_recuperadas_estimativa:
        scoring.metricas_chave?.horas_recuperadas?.estimativa || '',
      metric_horas_recuperadas_descricao:
        scoring.metricas_chave?.horas_recuperadas?.descricao || '',
      metric_dependencia_dono_percentual:
        scoring.metricas_chave?.dependencia_do_dono?.percentual ?? null,
      metric_dependencia_dono_nivel: scoring.metricas_chave?.dependencia_do_dono?.nivel || '',
      metric_dependencia_dono_descricao:
        scoring.metricas_chave?.dependencia_do_dono?.descricao || '',
      top_oportunidades: topOportunidades,
      first_impact_acao: scoring.first_impact?.acao || '',
      first_impact_prazo: scoring.first_impact?.prazo || '',
      first_impact_bloco: scoring.first_impact?.bloco || '',
      first_impact_descricao: scoring.first_impact?.descricao || [],
      success_complement: session.success_complement || '',
      answers: answersArray,
    }

    try {
      const hookRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!hookRes.ok) {
        console.error(`Webhook returned status ${hookRes.status}: ${hookRes.statusText}`)
      }
    } catch (hookErr: any) {
      console.error(`Failed to send webhook: ${hookErr.message}`)
    }

    return new Response(JSON.stringify({ success: true, message: 'Webhook sent' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
