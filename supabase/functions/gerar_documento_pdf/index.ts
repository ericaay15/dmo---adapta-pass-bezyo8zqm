import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    let diagId = body.diagnostico_id

    // Logo Adapta Pass Dark Mode Format (White text, green icon)
    const defaultLogo =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjUwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yMCA0MEw0MCAxMEw2MCA0MEgyMFoiIGZpbGw9IiMyZGQ0YmYiLz48dGV4dCB4PSI3NSIgeT0iMzgiIGZpbGw9IiNmOGZhZmMiIGZvbnQtZmFtaWx5PSJJbnRlciwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZm9udC13ZWlnaHQ9ImJvbGQiPkFkYXB0YSBQYXNzPC90ZXh0Pjwvc3ZnPg=='
    const logoUrl = body.logoUrl || defaultLogo

    const supabase = createClient(supabaseUrl, supabaseKey)

    if (!diagId) {
      throw new Error('diagnostico_id is required')
    }

    const { data: diag, error } = await supabase
      .from('diagnosticos')
      .select('*, empresas(*), respostas_abertas(*)')
      .eq('id', diagId)
      .single()

    if (error || !diag) {
      throw new Error(`Diagnóstico não encontrado: ${error?.message || ''}`)
    }

    const html = generatePdfHtml(diag, logoUrl)

    const fileName = `plano-de-sucesso-${diagId}.html`

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

    await supabase.from('diagnosticos').update({ pdf_url: publicUrl }).eq('id', diagId)

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

  const historyHtml = ['A', 'S', 'Au', 'T']
    .map((prefix) => {
      const sectionKeys = Object.keys(questionsMap).filter((k) => k.startsWith(prefix))
      let sectionTitle =
        prefix === 'A'
          ? 'Amplificar'
          : prefix === 'S'
            ? 'Sistematizar'
            : prefix === 'Au'
              ? 'Automatizar'
              : 'Plano Estratégico (90 Dias)'

      let itemsHtml = sectionKeys
        .map((k) => {
          let resposta = diag.respostas_json?.[k]
          const isAberta = k.endsWith('6') || k === 'T4'

          if (isAberta) {
            const aberta = diag.respostas_abertas?.find(
              (a: any) =>
                (a.tipo_bloco === prefix && a.numero_pergunta === parseInt(k.replace(/\D/g, ''))) ||
                (a.tipo_bloco === 'T' && k === 'T4' && a.numero_pergunta === 4),
            )
            resposta = aberta ? aberta.resposta : 'Não respondido'
          }

          if (resposta === undefined || resposta === null) return ''

          let maxScore = k.startsWith('T') && k !== 'T4' ? 10 : 5
          let scoreHtml = ''
          if (!isAberta) {
            let val = Number(resposta)
            let percent = (val / maxScore) * 100
            let color = getScoreColor(val, maxScore)

            scoreHtml = `
          <div style="margin-top: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Pontuação</span>
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
          <div class="history-q">${questionsMap[k]}</div>
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
  <title>Plano de Sucesso e Diagnóstico de IA</title>
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
      <h1 class="title">Plano de Sucesso e Diagnóstico de IA</h1>
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
          ${getClassificacaoLabel(diag.nota_geral || 0)}
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
            <span>Automatizar (Au)</span>
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

    <div class="footer">
      <p>Este documento é confidencial e foi gerado pelo Adapta Pass para uso exclusivo de <strong>${empresa.nome || 'sua empresa'}</strong>.</p>
      <p>© ${new Date().getFullYear()} Adapta. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
  `
}
