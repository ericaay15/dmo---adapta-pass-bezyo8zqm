import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    let sessionId = body.session_id

    // Logo Adapta Pass Dark Mode Format (White text, green icon)
    const defaultLogo =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjUwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yMCA0MEw0MCAxMEw2MCA0MEgyMFoiIGZpbGw9IiMyZGQ0YmYiLz48dGV4dCB4PSI3NSIgeT0iMzgiIGZpbGw9IiNmOGZhZmMiIGZvbnQtZmFtaWx5PSJJbnRlciwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZm9udC13ZWlnaHQ9ImJvbGQiPkFkYXB0YSBQYXNzPC90ZXh0Pjwvc3ZnPg=='
    const logoUrl = body.logoUrl || defaultLogo

    const supabase = createClient(supabaseUrl, supabaseKey)

    if (!sessionId) {
      throw new Error('session_id is required')
    }

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      throw new Error(`Sessão não encontrada: ${sessionError?.message || ''}`)
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', session.company_id)
      .single()

    if (companyError || !company) {
      throw new Error(`Empresa não encontrada: ${companyError?.message || ''}`)
    }

    const { data: aggregatedAnswers, error: aggregatedAnswersError } = await supabase
      .from('aggregated_answers')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (aggregatedAnswersError || !aggregatedAnswers) {
      throw new Error(`Respostas não encontradas: ${aggregatedAnswersError?.message || ''}`)
    }

    const { data: answersDb } = await supabase
      .from('answers')
      .select('question_name, question_label, question_answer, block')
      .eq('session_id', sessionId)

    const labelsFromDb: Record<string, string> = {}
    const segAnswers: any[] = []
    const ferrAnswers: any[] = []
    if (answersDb) {
      answersDb.forEach((a: any) => {
        labelsFromDb[a.question_name] = a.question_label
        
        if (a.block === 'SEG') {
          let answerText = a.question_answer || 'Não respondido'
          try {
            const parsed = JSON.parse(answerText)
            if (Array.isArray(parsed)) {
              answerText = parsed.join(', ')
            }
          } catch(e) {}
          segAnswers.push({ label: a.question_label, answer: answerText })
        }
        
        if (a.block === 'FERR') {
          ferrAnswers.push({ label: a.question_label, answer: a.question_answer || 'Não respondido' })
        }
      })
    }

    const answersJson: any = aggregatedAnswers.answers_json || {}
    const scoring: any = session.scoring_json || {}

    const diag = {
      labelsFromDb,
      // Company info mapped to the old field names the HTML template uses
      empresas: {
        nome: company.name,
        cnpj: company.cnpj,
        responsavel_nome: session.responsible_name,
        responsavel_email: session.responsible_email,
        segmento: company.segment,
      },
      segAnswers,
      ferrAnswers,

      // All form answers used by questionsMap rendering
      respostas_json: answersJson,

      // Scoring extracted from the JSONB blob
      nota_a: scoring.blocos?.A?.nota,
      nota_s: scoring.blocos?.S?.nota,
      nota_au: scoring.blocos?.Au?.nota,
      nota_t: scoring.blocos?.T?.nota,
      nota_geral: scoring.nota_geral?.valor,
      classificacao_a: scoring.blocos?.A?.classificacao,
      classificacao_s: scoring.blocos?.S?.classificacao,
      classificacao_au: scoring.blocos?.Au?.classificacao,
      classificacao_t: scoring.blocos?.T?.classificacao,
      classificacao_geral: scoring.nota_geral?.classificacao ?? '',
      top_3_oportunidades_json: scoring.top_3_oportunidades,
      metricas_json: scoring.metricas_chave,
      first_impact_json: scoring.first_impact,

      // Success plan
      complemento_sucesso: session.success_complement,

      // Open answers built from answersJson to match the shape the HTML template expects
      respostas_abertas: [
        { tipo_bloco: 'INTRO', numero_pergunta: 1, resposta: answersJson.motivacao || '' },
        { tipo_bloco: 'A', numero_pergunta: 6, resposta: answersJson.A6 || '' },
        { tipo_bloco: 'S', numero_pergunta: 6, resposta: answersJson.S6 || '' },
        { tipo_bloco: 'Au', numero_pergunta: 6, resposta: answersJson.Au6 || '' },
        { tipo_bloco: 'T', numero_pergunta: 4, resposta: answersJson.T4 || '' },
      ],
    }

    const html = generatePdfHtml(diag, logoUrl)

    const fileName = `plano-de-sucesso-${sessionId}.html`

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

    await supabase.from('sessions').update({ pdf_url: publicUrl }).eq('id', sessionId)

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

function getClassificacaoLabel(nota: number): string {
  if (nota < 4) return 'Inicial'
  if (nota < 7) return 'Em progresso'
  if (nota < 9) return 'Avançado'
  return 'Excelente'
}

function generatePdfHtml(diag: any, logoUrl: string) {
  const empresa = diag.empresas || {}
  const labelsFromDb = diag.labelsFromDb || {}
  const allKeys = [
    'motivacao',
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
  const metricas = diag.metricas_json || {}
  const firstImpact = diag.first_impact_json || {}
  const top3 = diag.top_3_oportunidades_json || []

  const getScoreColor = (val: number, max: number) => {
    const r = val / max
    if (r < 0.4) return '#ef4444'
    if (r < 0.7) return '#f59e0b'
    return '#2dd4bf'
  }

  const getMetricaColor = (nivel: string = '') => {
    const n = nivel.toLowerCase()
    if (n.includes('crític') || n.includes('critica') || n.includes('critico')) return '#ec4899'
    if (n.includes('moderad')) return '#f59e0b'
    return '#2dd4bf'
  }

  const historyHtml = ['INTRO', 'A', 'S', 'Au', 'T']
    .map((prefix) => {
      const sectionKeys = allKeys.filter((k) => {
        if (prefix === 'INTRO') return k === 'motivacao'
        if (prefix === 'A') return k.startsWith('A') && !k.startsWith('Au')
        return k.startsWith(prefix)
      })

      let sectionTitle =
        prefix === 'INTRO'
          ? 'Motivação'
          : prefix === 'A'
            ? 'Sessão Amplificar'
            : prefix === 'S'
              ? 'Sessão Sistematizar'
              : prefix === 'Au'
                ? 'Sessão Automatizar'
                : 'Sessão Transformar'

      let itemsHtml = sectionKeys
        .map((k) => {
          let resposta = diag.respostas_json?.[k]
          const isAberta = k.endsWith('6') || k === 'T4' || k === 'motivacao' || k === 'ferramentas'

          if (isAberta) {
            const aberta = diag.respostas_abertas?.find(
              (a: any) =>
                (a.tipo_bloco === prefix && a.numero_pergunta === parseInt(k.replace(/\D/g, ''))) ||
                (a.tipo_bloco === 'T' && k === 'T4' && a.numero_pergunta === 4) ||
                (a.tipo_bloco === 'INTRO' && k === 'motivacao' && a.numero_pergunta === 1),
            )
            resposta = aberta?.resposta || resposta || 'Não respondido'
          }

          if (resposta === undefined || resposta === null || resposta === '') {
            if (!isAberta) return ''
            resposta = 'Não respondido'
          }

          let maxScore = k.startsWith('T') && k !== 'T4' ? 10 : 5
          let scoreHtml = ''
          if (!isAberta) {
            let val = Number(resposta)
            let percent = (val / maxScore) * 100
            let color = getScoreColor(val, maxScore)

            scoreHtml = `
          <div style="margin-top: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Nota ${val}</span>
              <span style="color: ${color}; font-weight: 800; font-size: 14px;">${val} <span style="color: #64748b; font-weight: 500; font-size: 12px;">/ ${maxScore}</span></span>
            </div>
            <div style="height: 6px; background: #262626; border-radius: 4px; overflow: hidden; width: 100%;">
              <div style="height: 100%; background: ${color}; border-radius: 4px; width: ${percent}%;"></div>
            </div>
          </div>
        `
          }

          return `
        <div class="history-item">
          <div class="history-q">${k}. ${labelsFromDb[k] || k}</div>
          <div class="history-a">${
            isAberta ? String(resposta).replace(/\n/g, '<br/>') : scoreHtml
          }</div>
        </div>
      `
        })
        .join('')

      return itemsHtml
        ? `
      <div style="margin-bottom: 32px;">
        <h3 class="history-section-title">${sectionTitle}</h3>
        ${itemsHtml}
      </div>
    `
        : ''
    })
    .join('')

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Plano de Sucesso Inicial</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    :root {
      --bg-main: #0a0a0a;
      --card-bg: #171717;
      --card-border: #262626;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #2dd4bf;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg-main) !important;
      color: var(--text-main) !important;
      line-height: 1.5;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      padding: 40px;
    }

    @page {
      margin: 0;
      size: A4;
    }
    
    @media print {
      body {
        background-color: #0a0a0a !important;
        color: #f8fafc !important;
        padding: 40px;
      }
      .card, .metrica-card, .history-item {
        background-color: #171717 !important;
        border-color: #262626 !important;
      }
      .text-muted { color: #94a3b8 !important; }
      .text-main { color: #f8fafc !important; }
    }

    .container { max-width: 900px; margin: 0 auto; }

    .header { text-align: center; margin-bottom: 40px; }
    .logo { max-height: 50px; margin-bottom: 24px; object-fit: contain; }
    .title { font-size: 32px; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em; }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    .card-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 20px;
      color: var(--text-main);
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 12px;
    }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .data-item { font-size: 14px; font-weight: 600; color: var(--text-main); }
    .data-item span { color: var(--text-muted); margin-right: 8px; font-weight: 400; }

    .grid-scores {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    .score-geral { text-align: left; display: flex; flex-direction: column; justify-content: center; }
    .score-geral .val {
      font-size: 56px;
      font-weight: 900;
      line-height: 1;
      margin-bottom: 8px;
      color: var(--text-main);
    }
    .score-geral .classificacao {
      font-size: 18px;
      font-weight: 700;
    }

    .progress-item { margin-bottom: 20px; }
    .progress-item:last-child { margin-bottom: 0; }
    .progress-header {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #e2e8f0;
    }
    .progress-bar-bg {
      background: #262626;
      height: 10px;
      border-radius: 5px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 5px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    .metrica-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 24px;
      page-break-inside: avoid;
    }
    .metrica-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 12px;
    }
    .metrica-val {
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 8px;
      line-height: 1.2;
    }
    .metrica-desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .section-title {
      font-size: 24px;
      font-weight: 800;
      color: var(--primary);
      margin-top: 48px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 12px;
      page-break-after: avoid;
    }
    
    .history-section-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .history-item {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .history-q {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 12px;
    }
    .history-a {
      font-size: 14px;
      color: #e2e8f0;
      line-height: 1.6;
    }

    .list-item {
      margin-bottom: 12px;
      font-size: 14px;
      color: #e2e8f0;
      padding-left: 20px;
      position: relative;
      line-height: 1.6;
    }
    .list-item::before {
      content: "•";
      position: absolute;
      left: 0;
      color: var(--primary);
      font-size: 18px;
      line-height: 1;
      top: -2px;
    }
    
    .footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 24px;
      border-top: 1px solid var(--card-border);
      font-size: 12px;
      color: var(--text-muted);
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${logoUrl ? `<img src="${logoUrl}" alt="Adapta Pass" class="logo" />` : ''}
      <h1 class="title">Plano de Sucesso Inicial</h1>
    </div>

    <div class="card">
      <h2 class="card-title">Dados da Empresa</h2>
      <div class="grid-2">
        <div class="data-item"><span>Empresa:</span> ${empresa.nome || '-'}</div>
        <div class="data-item"><span>CNPJ:</span> ${empresa.cnpj || '-'}</div>
        <div class="data-item"><span>Responsável:</span> ${empresa.responsavel_nome || '-'}</div>
        <div class="data-item"><span>E-mail:</span> ${empresa.responsavel_email || '-'}</div>
      </div>
    </div>

    <div class="grid-scores">
      <div class="card score-geral" style="margin-bottom: 0; border: none; background: #171717; border: 1px solid #262626;">
        <div style="margin-bottom: 8px; color: var(--text-muted); font-size: 14px; font-weight: 600;">Nota Geral</div>
        <div class="val">${diag.nota_geral || '0.0'}</div>
        <div class="classificacao" style="color: ${getScoreColor(diag.nota_geral || 0, 10)}">
          ${diag.classificacao_geral || getClassificacaoLabel(diag.nota_geral || 0)}
        </div>
      </div>

      <div class="card" style="margin-bottom: 0;">
        <div style="margin-bottom: 24px; color: var(--text-muted); font-size: 14px; font-weight: 600;">Maturidade por Dimensão</div>
        
        <div class="progress-item">
          <div class="progress-header">
            <span>Amplificar (A)</span>
            <span style="color: ${getScoreColor(diag.nota_a || 0, 10)}">${diag.nota_a || 0}/10</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${((diag.nota_a || 0) / 10) * 100}%; background-color: ${getScoreColor(diag.nota_a || 0, 10)}"></div>
          </div>
        </div>

        <div class="progress-item">
          <div class="progress-header">
            <span>Sistematizar (S)</span>
            <span style="color: ${getScoreColor(diag.nota_s || 0, 10)}">${diag.nota_s || 0}/10</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${((diag.nota_s || 0) / 10) * 100}%; background-color: ${getScoreColor(diag.nota_s || 0, 10)}"></div>
          </div>
        </div>

        <div class="progress-item">
          <div class="progress-header">
            <span>Automatizar (A)</span>
            <span style="color: ${getScoreColor(diag.nota_au || 0, 10)}">${diag.nota_au || 0}/10</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${((diag.nota_au || 0) / 10) * 100}%; background-color: ${getScoreColor(diag.nota_au || 0, 10)}"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-3">
      <div class="metrica-card">
        <div class="metrica-title">Pessoas Impactadas</div>
        <div class="metrica-val" style="color: ${getMetricaColor(metricas?.pessoas_impactadas?.nivel)}">${metricas?.pessoas_impactadas?.nivel || '-'}</div>
        <div class="metrica-desc">${metricas?.pessoas_impactadas?.descricao || ''}</div>
      </div>

      <div class="metrica-card">
        <div class="metrica-title">Horas Recuperadas</div>
        <div class="metrica-val" style="color: #ec4899">${metricas?.horas_recuperadas?.estimativa || '-'}</div>
        <div class="metrica-desc">${metricas?.horas_recuperadas?.descricao || ''}</div>
      </div>

      <div class="metrica-card">
        <div class="metrica-title">Dependência do Dono</div>
        <div class="metrica-val" style="color: #f59e0b">${metricas?.dependencia_do_dono?.percentual || '0'}%</div>
        <div class="metrica-desc">${metricas?.dependencia_do_dono?.descricao || ''}</div>
      </div>
    </div>

    <h2 class="section-title">Plano de Sucesso</h2>
    
    ${
      diag.complemento_sucesso
        ? `
      <div class="card">
        <h3 class="card-title" style="border: none; margin-bottom: 16px;">Resumo Executivo</h3>
        <div style="font-size: 14px; color: #e2e8f0; line-height: 1.6; white-space: pre-wrap;">${diag.complemento_sucesso}</div>
      </div>
    `
        : ''
    }

    ${
      firstImpact.acao
        ? `
      <div class="card">
        <h3 class="card-title" style="border: none; margin-bottom: 16px;">${firstImpact.acao}</h3>
        <div>
          ${(Array.isArray(firstImpact.descricao) ? firstImpact.descricao : [firstImpact.descricao])
            .map(
              (d: string) => `
            <div class="list-item">${d}</div>
          `,
            )
            .join('')}
        </div>
      </div>
    `
        : ''
    }

    ${
      top3.length > 0
        ? `
      <div class="card">
        <h3 class="card-title" style="border: none; margin-bottom: 16px;">Top 3 Oportunidades</h3>
        <div>
          ${top3
            .map(
              (op: any) => `
            <div class="list-item"><strong>${op.nome}</strong> <span style="font-size: 11px; color: var(--primary); text-transform: uppercase; margin-left: 8px; font-weight: 700;">(${op.bloco})</span></div>
          `,
            )
            .join('')}
        </div>
      </div>
    `
        : ''
    }

    <h2 class="section-title">Histórico de Respostas</h2>
    ${historyHtml}

    <h2 class="section-title">Informações Adicionais</h2>
    <div style="margin-bottom: 32px;">
      
      ${(diag.ferrAnswers || []).map((ans: any) => `
      <div class="history-item">
        <div class="history-q">${ans.label || 'Quais ferramentas ou sistemas que você já usa na sua empresa?'}</div>
        <div class="history-a">${String(ans.answer).replace(/\n/g, '<br/>')}</div>
      </div>
      `).join('')}

      <div class="history-item">
        <div class="history-q">Segmento da Empresa</div>
        <div class="history-a">${empresa.segmento || 'Não informado'}</div>
      </div>

      ${(diag.segAnswers || []).map((ans: any) => `
      <div class="history-item">
        <div class="history-q">${ans.label || 'Pergunta de Segmento'}</div>
        <div class="history-a">${String(ans.answer).replace(/\n/g, '<br/>')}</div>
      </div>
      `).join('')}
    </div>

    <div class="footer">
      <p>Este documento é confidencial e foi gerado pelo Adapta Pass para uso exclusivo de <strong>${empresa.nome || 'sua empresa'}</strong>.</p>
      <p>© ${new Date().getFullYear()} Adapta. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
  `
}
