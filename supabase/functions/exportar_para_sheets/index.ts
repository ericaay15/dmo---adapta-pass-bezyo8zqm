import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.45.6'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { diagnostico_id } = body

    if (!diagnostico_id) {
      throw new Error('diagnostico_id é obrigatório')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variáveis de ambiente do Supabase ausentes')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch Diagnostic and Empresa Data
    const { data: diagnostico, error: diagError } = await supabase
      .from('diagnosticos')
      .select(`
        *,
        empresas (
          cnpj,
          email_admin,
          responsavel_nome
        )
      `)
      .eq('id', diagnostico_id)
      .single()

    if (diagError || !diagnostico) {
      throw new Error(`Erro ao buscar diagnóstico: ${diagError?.message}`)
    }

    // 2. Fetch Open Answers (Respostas Abertas)
    const { data: respostas, error: respError } = await supabase
      .from('respostas_abertas')
      .select('*')
      .eq('diagnostico_id', diagnostico_id)

    if (respError) {
      throw new Error(`Erro ao buscar respostas abertas: ${respError.message}`)
    }

    // Extract specifically P1 for "Complemento do Plano"
    const p1Resposta =
      respostas?.find((r) => r.tipo_bloco === 'P' && r.numero_pergunta === 1)?.resposta || ''

    // 3. Format Data for Google Sheets
    const empresas = Array.isArray(diagnostico.empresas)
      ? diagnostico.empresas[0]
      : diagnostico.empresas

    const top3Array = (diagnostico.top_3_oportunidades_json || []) as any[]
    const top3Texto = top3Array
      .map((o: any, i: number) => `${i + 1}. ${o.nome} (${o.classificacao} - Nota ${o.nota})`)
      .join('\n')

    const metricas = (diagnostico.metricas_json as any) || {}
    const metricasTexto = `Pessoas Impactadas: ${metricas.pessoas_impactadas?.nivel || 'N/A'} | Horas Recuperadas: ${metricas.horas_recuperadas?.nivel || 'N/A'} | Dependência do Dono: ${metricas.dependencia_do_dono?.nivel || 'N/A'}`

    const firstImpact = (diagnostico.first_impact_json as any) || {}
    const firstImpactTexto = `Ação: ${firstImpact.acao || 'N/A'} - Descrição: ${firstImpact.descricao || 'N/A'}`

    const payload = {
      cnpj: empresas?.cnpj || 'N/A',
      email_admin: empresas?.email_admin || 'N/A',
      responsavel: empresas?.responsavel_nome || diagnostico.quem_preencheu || 'N/A',
      data: new Date(diagnostico.data_preenchimento).toLocaleString('pt-BR'),
      nota_a: diagnostico.nota_a,
      nota_s: diagnostico.nota_s,
      nota_au: diagnostico.nota_au,
      nota_geral: diagnostico.nota_geral,
      classificacoes: `A: ${diagnostico.classificacao_a} | S: ${diagnostico.classificacao_s} | Au: ${diagnostico.classificacao_au}`,
      top_3_oportunidades: top3Texto,
      metricas: metricasTexto,
      first_impact: firstImpactTexto,
      complemento_plano: p1Resposta,
      link_pdf: (diagnostico as any).pdf_url || '',
    }

    // 4. Send to Google Apps Script
    const appsScriptUrl =
      Deno.env.get('GOOGLE_APPS_SCRIPT_URL') ||
      'https://script.google.com/a/macros/adapta.org/s/AKfycbyND2KvIWJUGUbD64luFdwjdH8KyxLsZwxJ4I7OLFj2nxtww4jTRwZz2I8fooi4_DA/exec'

    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Google Apps Script retornou erro: ${response.status} ${response.statusText}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Exportado para o Sheets com sucesso' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
