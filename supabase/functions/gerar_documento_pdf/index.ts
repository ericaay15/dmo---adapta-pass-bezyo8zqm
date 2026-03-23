import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    let diagnosis = body.diagnosis

    // Fallback logo in case no URL is passed
    const defaultLogo =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjUwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yMCA0MEw0MCAxMEw2MCA0MEgyMFoiIGZpbGw9IiMxMGI5ODEiLz48dGV4dCB4PSI3NSIgeT0iMzgiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iSW50ZXIsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSJib2xkIj5BZGFwdGEgUGFzczwvdGV4dD48L3N2Zz4='
    const logoUrl = body.logoUrl || defaultLogo

    let diagId = body.diagnostico_id
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch complete data if diagnostico_id is provided
    if (!diagnosis && diagId) {
      const { data: diag, error } = await supabase
        .from('diagnosticos')
        .select('*, empresas(*)')
        .eq('id', diagId)
        .single()

      if (error || !diag) {
        throw new Error(`Diagnóstico não encontrado: ${error?.message || ''}`)
      }

      diagnosis = {
        company_name: diag.empresas?.nome || 'Sua Empresa',
        action_plan: {
          executive_summary:
            diag.complemento_sucesso ||
            'Plano de implementação de IA focado em resultados rápidos e escaláveis.',
          phases: [] as any[],
        },
        responses: {} as Record<string, any>,
      }

      if (diag.first_impact_json) {
        const fi = diag.first_impact_json as any
        diagnosis.action_plan.phases.push({
          title: fi.acao || 'Primeiros 90 Dias',
          details: Array.isArray(fi.descricao) ? fi.descricao.join('\n') : fi.descricao || '',
        })
      }

      if (diag.top_3_oportunidades_json) {
        const ops = diag.top_3_oportunidades_json as any[]
        if (Array.isArray(ops)) {
          diagnosis.action_plan.phases.push({
            title: 'Top 3 Oportunidades',
            details: ops
              .map((op: any, i: number) => `${i + 1}. ${op.nome} (${op.bloco})`)
              .join('\n\n'),
          })
        }
      }

      if (diag.metricas_json) {
        const m = diag.metricas_json as any
        diagnosis.responses['Métricas Chave'] =
          `Pessoas Impactadas: ${m.pessoas_impactadas?.nivel || '-'}\nHoras Recuperadas: ${m.horas_recuperadas?.estimativa || '-'}\nDependência do Dono: ${m.dependencia_do_dono?.percentual || '0'}%`
      }

      diagnosis.responses['Classificação de Maturidade'] =
        `Amplificar: ${diag.classificacao_a || '-'}\nSistematizar: ${diag.classificacao_s || '-'}\nAutomatizar: ${diag.classificacao_au || '-'}`
      diagnosis.responses['Nota Geral'] = diag.nota_geral || '-'
    }

    if (!diagnosis) {
      throw new Error('Diagnosis data or diagnostico_id is required')
    }

    const html = generatePdfHtml(diagnosis, logoUrl)

    // Save HTML as a document to Storage for robust printing and viewing
    const fileName = `plano-de-sucesso-${diagId || crypto.randomUUID()}.html`

    const { error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(fileName, html, {
        contentType: 'text/html; charset=utf-8',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Erro ao fazer upload do documento: ${uploadError.message}`)
    }

    const { data: publicUrlData } = supabase.storage.from('documentos').getPublicUrl(fileName)

    const publicUrl = publicUrlData.publicUrl

    if (diagId) {
      // Sync URL in database
      await supabase.from('diagnosticos').update({ pdf_url: publicUrl }).eq('id', diagId)
    }

    return new Response(JSON.stringify({ url: publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function generatePdfHtml(diagnosis: any, logoUrl: string) {
  const plan = diagnosis.action_plan || {}
  const responses = diagnosis.responses || {}
  const companyName = diagnosis.company_name || 'Sua Empresa'

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Plano de Sucesso - ${companyName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    :root {
      --bg-gradient: linear-gradient(135deg, #020617 0%, #064E3B 100%);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --card-bg: #1e293b;
      --card-border: #10b981;
      --primary: #10b981;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg-gradient);
      color: var(--text-main);
      line-height: 1.6;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      min-height: 100vh;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      width: 100%;
      overflow: hidden;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .logo {
      max-width: 240px;
      max-height: 80px;
      width: auto;
      height: auto;
      margin: 0 auto 20px auto;
      display: block;
      object-fit: contain;
    }

    .title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #ffffff;
      letter-spacing: -0.02em;
    }

    .subtitle {
      font-size: 18px;
      color: var(--text-muted);
    }

    .section {
      margin-bottom: 40px;
      width: 100%;
    }

    .section-title {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 24px;
      color: var(--primary);
      display: inline-block;
      border-bottom: 2px solid var(--primary);
      padding-bottom: 8px;
    }

    .card {
      background: var(--card-bg);
      border-left: 4px solid var(--card-border);
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 20px;
      page-break-inside: avoid;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      width: 100%;
      overflow: hidden;
    }

    .card-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #ffffff;
    }

    .card-content {
      font-size: 15px;
      color: #e2e8f0;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      max-width: 100%;
      line-height: 1.7;
    }

    .response-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }

    .response-item {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 20px;
      border-radius: 8px;
      page-break-inside: avoid;
      width: 100%;
      overflow: hidden;
    }

    .response-q {
      font-size: 14px;
      color: var(--primary);
      margin-bottom: 8px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .response-a {
      font-size: 16px;
      font-weight: 400;
      color: #ffffff;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      white-space: pre-wrap;
    }

    .footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.1);
      font-size: 13px;
      color: var(--text-muted);
      page-break-inside: avoid;
    }

    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
      }
      .title, .card-title, .response-a, .subtitle {
        color: #000000 !important;
      }
      .card {
        background: #f8fafc !important;
        border: 1px solid #e2e8f0 !important;
        border-left: 4px solid var(--primary) !important;
        box-shadow: none !important;
      }
      .response-item {
        background: #f8fafc !important;
        border: 1px solid #e2e8f0 !important;
      }
      .container {
        padding: 0;
        width: 100%;
        max-width: 100%;
      }
      @page {
        margin: 1.5cm;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${logoUrl ? `<img src="${logoUrl}" alt="Adapta" class="logo" />` : `<h1 class="title">Adapta Pass</h1>`}
      <h1 class="title">Plano de Sucesso</h1>
      <p class="subtitle">Preparado exclusivamente para <strong style="color: #fff">${companyName}</strong></p>
    </div>

    ${
      plan.executive_summary
        ? `
    <div class="section">
      <h2 class="section-title">Resumo Executivo</h2>
      <div class="card">
        <div class="card-content">${plan.executive_summary}</div>
      </div>
    </div>
    `
        : ''
    }

    ${
      plan.phases && plan.phases.length > 0
        ? `
    <div class="section">
      <h2 class="section-title">Ações e Oportunidades</h2>
      ${plan.phases
        .map(
          (phase: any, index: number) => `
        <div class="card">
          <h3 class="card-title">${phase.title || phase.name || `Fase ${index + 1}`}</h3>
          <div class="card-content">${phase.details || phase.description || ''}</div>
        </div>
      `,
        )
        .join('')}
    </div>
    `
        : ''
    }

    <div class="section">
      <h2 class="section-title">Resultados do Diagnóstico</h2>
      <div class="response-grid">
        ${Object.entries(responses)
          .map(
            ([key, value]) => `
          <div class="response-item">
            <div class="response-q">${formatQuestionKey(key)}</div>
            <div class="response-a">${typeof value === 'object' ? JSON.stringify(value) : value}</div>
          </div>
        `,
          )
          .join('')}
      </div>
    </div>

    <div class="footer">
      <p>Este documento é confidencial e foi gerado pelo Adapta Pass para uso exclusivo de ${companyName}.</p>
      <p>© ${new Date().getFullYear()} Adapta. Todos os direitos reservados.</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      // Auto trigger print dialog on load for seamless PDF generation experience
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `
}

function formatQuestionKey(key: string): string {
  if (!key) return ''
  const words = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}
