import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

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

    const { data: answersDb } = await supabase
      .from('answers')
      .select('question_name, question_label')
      .eq('session_id', sessionId)

    const labelsFromDb: Record<string, string> = {}
    if (answersDb) {
      answersDb.forEach((a: any) => {
        labelsFromDb[a.question_name] = a.question_label
      })
    }

    const scoring: any = session.scoring_json || {}
    const answersJson: any = aggregatedAnswers?.answers_json || {}

    const answersArray: any[] = []

    const keysToProcess = [
      'A1',
      'A2',
      'A3',
      'A4',
      'A5',
      'A6',
      'S1',
      'S2',
      'S3',
      'S4',
      'S5',
      'S6',
      'Au1',
      'Au2',
      'Au3',
      'Au4',
      'Au5',
      'Au6',
      'T1',
      'T2',
      'T3',
      'T4',
    ]
    for (const key of keysToProcess) {
      const val = answersJson[key]
      if (val !== undefined && val !== null && val !== '') {
        const block = key.startsWith('Au') ? 'Au' : key.replace(/[0-9]/g, '')
        answersArray.push({
          key,
          label: labelsFromDb[key] || key,
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
        label: labelsFromDb['temasSelecionados'] || 'Temas selecionados para aprofundamento',
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
        label: labelsFromDb['temaOutros'] || 'Outros temas mencionados',
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
