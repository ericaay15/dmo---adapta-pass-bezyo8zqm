import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.45.6'
import { PDFDocument, rgb, StandardFonts } from 'npm:pdf-lib@1.17.1'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { diagnostico_id } = body

    if (!diagnostico_id) throw new Error('diagnostico_id é obrigatório')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: diagnostico, error: diagError } = await supabase
      .from('diagnosticos')
      .select('*, empresas(nome, cnpj, responsavel_nome, responsavel_email)')
      .eq('id', diagnostico_id)
      .single()

    if (diagError || !diagnostico) throw new Error('Diagnóstico não encontrado')

    const { data: respostas, error: respError } = await supabase
      .from('respostas_abertas')
      .select('*')
      .eq('diagnostico_id', diagnostico_id)

    if (respError) throw new Error('Erro ao buscar respostas abertas')

    const pdfDoc = await PDFDocument.create()

    // Theme Colors
    const darkBg = rgb(0.04, 0.04, 0.04) // Almost black background
    const cardBg = rgb(0.08, 0.08, 0.08) // Dark gray for cards
    const cardBorder = rgb(0.15, 0.15, 0.15) // Lighter border
    const textWhite = rgb(0.95, 0.95, 0.95) // Main text
    const textGray = rgb(0.65, 0.65, 0.65) // Muted text
    const teal = rgb(0.176, 0.831, 0.749) // #2dd4bf Primary Accent
    const pink = rgb(0.957, 0.447, 0.71) // #f472b6 Secondary Accent
    const amber = rgb(0.961, 0.62, 0.043) // #f59e0b Warning/Alert

    // Score Colors
    const scoreRose = rgb(0.957, 0.247, 0.365) // #f43f5e (0-3)
    const scoreAmber = rgb(0.961, 0.62, 0.043) // #f59e0b (4-6)
    const scoreEmerald = rgb(0.063, 0.725, 0.506) // #10b981 (7-8)
    const scoreBlue = rgb(0.231, 0.51, 0.965) // #3b82f6 (9-10)

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    let page = pdfDoc.addPage([595.28, 841.89]) // A4 Size
    // Fill first page background
    page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: darkBg })

    let y = 780

    const checkPageBreak = (needed: number) => {
      if (y - needed < 50) {
        page = pdfDoc.addPage([595.28, 841.89])
        page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: darkBg })
        y = 780
      }
    }

    const wrapText = (
      text: string,
      maxWidth: number,
      textFont: any,
      fontSize: number,
    ): string[] => {
      if (!text) return []
      const words = text.split(' ')
      const lines: string[] = []
      let currentLine = words[0] || ''

      for (let i = 1; i < words.length; i++) {
        const word = words[i]
        const testLine = currentLine + ' ' + word
        const testWidth = textFont.widthOfTextAtSize(testLine, fontSize)
        if (testWidth > maxWidth) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      }
      if (currentLine) lines.push(currentLine)
      return lines
    }

    // Header
    page.drawText('ADAPTA', { x: 40, y, size: 28, font: boldFont, color: textWhite })
    page.drawText('PASS', { x: 160, y, size: 28, font: boldFont, color: teal })
    page.drawText('Plano de Sucesso e Diagnóstico de IA', {
      x: 40,
      y: y - 22,
      size: 12,
      font,
      color: textGray,
    })
    y -= 60

    // Company Data Card
    const empresa = diagnostico.empresas || {}
    checkPageBreak(90)
    page.drawRectangle({
      x: 40,
      y: y - 75,
      width: 515,
      height: 75,
      color: cardBg,
      borderColor: cardBorder,
      borderWidth: 1,
    })

    page.drawText('Dados da Empresa', {
      x: 55,
      y: y - 20,
      size: 12,
      font: boldFont,
      color: textWhite,
    })

    page.drawText(`Empresa:`, { x: 55, y: y - 40, size: 9, font: boldFont, color: textGray })
    page.drawText(`${empresa.nome || 'Não informado'}`, {
      x: 110,
      y: y - 40,
      size: 9,
      font,
      color: textWhite,
    })

    page.drawText(`CNPJ:`, { x: 300, y: y - 40, size: 9, font: boldFont, color: textGray })
    page.drawText(`${empresa.cnpj || 'Não informado'}`, {
      x: 335,
      y: y - 40,
      size: 9,
      font,
      color: textWhite,
    })

    page.drawText(`Responsável:`, { x: 55, y: y - 58, size: 9, font: boldFont, color: textGray })
    page.drawText(`${empresa.responsavel_nome || 'Não informado'}`, {
      x: 125,
      y: y - 58,
      size: 9,
      font,
      color: textWhite,
    })

    page.drawText(`E-mail:`, { x: 300, y: y - 58, size: 9, font: boldFont, color: textGray })
    page.drawText(`${empresa.responsavel_email || 'Não informado'}`, {
      x: 335,
      y: y - 58,
      size: 9,
      font,
      color: textWhite,
    })
    y -= 100

    // Nota Geral & Bars section
    checkPageBreak(120)

    // Nota Geral Card
    page.drawRectangle({
      x: 40,
      y: y - 100,
      width: 140,
      height: 100,
      color: cardBg,
      borderColor: cardBorder,
      borderWidth: 1,
    })
    page.drawText('Nota Geral', { x: 55, y: y - 25, size: 10, font: boldFont, color: textGray })

    const nGeral = diagnostico.nota_geral || 0
    const getScoreColor = (score: number) => {
      if (score <= 3) return scoreRose
      if (score <= 6) return scoreAmber
      if (score <= 8) return scoreEmerald
      return scoreBlue
    }

    page.drawText(`${nGeral}`, { x: 55, y: y - 65, size: 36, font: boldFont, color: textWhite })

    const getClas = (n: number) =>
      n <= 3 ? 'Inicial' : n <= 6 ? 'Em progresso' : n <= 8 ? 'Avançado' : 'Excelente'
    page.drawText(`${getClas(nGeral)}`, {
      x: 55,
      y: y - 85,
      size: 11,
      font: boldFont,
      color: getScoreColor(nGeral),
    })

    // Bars
    page.drawRectangle({
      x: 195,
      y: y - 100,
      width: 360,
      height: 100,
      color: cardBg,
      borderColor: cardBorder,
      borderWidth: 1,
    })
    page.drawText('Maturidade por Dimensão', {
      x: 210,
      y: y - 25,
      size: 10,
      font: boldFont,
      color: textGray,
    })

    const drawBar = (label: string, score: number, by: number) => {
      page.drawText(label, { x: 210, y: by, size: 9, font: boldFont, color: textWhite })
      page.drawText(`${score}/10`, {
        x: 520,
        y: by,
        size: 9,
        font: boldFont,
        color: getScoreColor(score),
      })

      // Track
      page.drawRectangle({ x: 210, y: by - 12, width: 330, height: 6, color: rgb(0.2, 0.2, 0.2) })

      // Fill
      const barW = (score / 10) * 330
      page.drawRectangle({
        x: 210,
        y: by - 12,
        width: barW,
        height: 6,
        color: getScoreColor(score),
      })
    }

    drawBar('Amplificar (A)', diagnostico.nota_a || 0, y - 45)
    drawBar('Sistematizar (S)', diagnostico.nota_s || 0, y - 68)
    drawBar('Automatizar (Au)', diagnostico.nota_au || 0, y - 91)

    y -= 125

    // Metrics Cards
    checkPageBreak(120)
    const metricas = (diagnostico.metricas_json || {}) as any

    const drawMetricCard = (
      x: number,
      title: string,
      val: string,
      desc: string,
      iconColor: any,
    ) => {
      page.drawRectangle({
        x,
        y: y - 100,
        width: 161,
        height: 100,
        color: cardBg,
        borderColor: cardBorder,
        borderWidth: 1,
      })
      page.drawText(title, { x: x + 15, y: y - 20, size: 10, font: boldFont, color: textGray })
      page.drawText(val, { x: x + 15, y: y - 45, size: 16, font: boldFont, color: iconColor })
      const dLines = wrapText(desc, 131, font, 8)
      dLines.forEach((l, i) => {
        if (i < 4)
          page.drawText(l, { x: x + 15, y: y - 62 - i * 11, size: 8, font, color: textGray })
      })
    }

    drawMetricCard(
      40,
      'Pessoas Impactadas',
      metricas.pessoas_impactadas?.nivel || 'N/A',
      metricas.pessoas_impactadas?.descricao || '',
      teal,
    )
    drawMetricCard(
      217,
      'Horas Recuperadas',
      metricas.horas_recuperadas?.estimativa || 'N/A',
      metricas.horas_recuperadas?.descricao || '',
      pink,
    )
    drawMetricCard(
      394,
      'Dependência do Dono',
      `${metricas.dependencia_do_dono?.percentual || 0}%`,
      metricas.dependencia_do_dono?.descricao || '',
      amber,
    )

    y -= 125

    // Top 3 Oportunidades
    checkPageBreak(150)
    page.drawText('Top 3 Oportunidades', { x: 40, y, size: 14, font: boldFont, color: textWhite })
    y -= 25

    const top3 = (diagnostico.top_3_oportunidades_json || []) as any[]
    top3.forEach((op, i) => {
      const text = `${op.nome}`
      const lines = wrapText(text, 440, font, 10)
      const cardH = lines.length * 14 + 35
      checkPageBreak(cardH + 15)

      page.drawRectangle({
        x: 40,
        y: y - cardH,
        width: 515,
        height: cardH,
        color: cardBg,
        borderColor: cardBorder,
        borderWidth: 1,
      })

      // Number badge
      page.drawRectangle({ x: 55, y: y - 28, width: 22, height: 22, color: rgb(0.05, 0.2, 0.2) })
      page.drawText(`${i + 1}`, { x: 63, y: y - 21, size: 11, font: boldFont, color: teal })

      lines.forEach((l, li) => {
        page.drawText(l, { x: 95, y: y - 21 - li * 14, size: 10, font: boldFont, color: textWhite })
      })

      page.drawText(`Dimensão: ${op.bloco}   |   Nota: ${op.nota}/5`, {
        x: 95,
        y: y - cardH + 12,
        size: 8,
        font,
        color: textGray,
      })

      y -= cardH + 10
    })

    y -= 10

    // First Impact Card
    let fiLines: string[] = []
    const fi = (diagnostico.first_impact_json || {}) as any
    if (Array.isArray(fi.descricao)) {
      fi.descricao.forEach((item: string) => {
        fiLines.push(...wrapText(`• ${item}`, 470, font, 11))
      })
    } else {
      fiLines = wrapText(fi.descricao || '', 470, font, 11)
    }

    const fiHeight = 70 + fiLines.length * 16
    checkPageBreak(fiHeight + 30)

    // Gradient-like subtle background for First Impact
    page.drawRectangle({
      x: 40,
      y: y - fiHeight,
      width: 515,
      height: fiHeight,
      color: rgb(0.04, 0.12, 0.11),
      borderColor: rgb(0.1, 0.3, 0.3),
      borderWidth: 1,
    })
    page.drawText('First Impact', { x: 60, y: y - 30, size: 16, font: boldFont, color: textWhite })
    page.drawText('Meta dos primeiros 90 dias', { x: 60, y: y - 50, size: 12, font, color: teal })

    let fiY = y - 75
    fiLines.forEach((l) => {
      page.drawText(l, { x: 60, y: fiY, size: 11, font, color: textWhite })
      fiY -= 16
    })

    y -= fiHeight + 30

    // Complemento do Plano
    const p1 =
      respostas.find((r: any) => r.tipo_bloco === 'P' && r.numero_pergunta === 1)?.resposta || ''
    const compText = diagnostico.complemento_sucesso || p1
    if (compText) {
      const compLines = wrapText(compText, 475, font, 10)
      const compH = 45 + compLines.length * 14
      checkPageBreak(compH + 20)

      page.drawRectangle({
        x: 40,
        y: y - compH,
        width: 515,
        height: compH,
        color: cardBg,
        borderColor: cardBorder,
        borderWidth: 1,
      })
      page.drawText('Sua Visão de Sucesso:', {
        x: 60,
        y: y - 25,
        size: 12,
        font: boldFont,
        color: textWhite,
      })

      let cY = y - 45
      compLines.forEach((l) => {
        page.drawText(l, { x: 60, y: cY, size: 10, font, color: textGray })
        cY -= 14
      })
      y -= compH + 20
    }

    // Detalhamento por Sessão
    checkPageBreak(100)
    y -= 10
    page.drawText('Auditoria Técnica', { x: 40, y, size: 16, font: boldFont, color: textWhite })
    y -= 30

    const dict: Record<string, string> = {
      A1: 'Qual o percentual do time que usa IA regularmente no dia a dia?',
      A2: 'Como a IA é utilizada hoje pela equipe?',
      A3: 'Qual o nível de engajamento da liderança com o uso de IA?',
      A4: 'Como é feita a capacitação do time para o uso de IA?',
      A5: 'Qual o foco atual das iniciativas de IA na empresa?',
      A6: 'Observações adicionais sobre Amplificar (pessoas)',
      S1: 'Como os processos críticos da empresa estão documentados hoje?',
      S2: 'Como é o processo de onboarding de novos colaboradores?',
      S3: 'Onde o conhecimento da empresa está centralizado?',
      S4: 'Como as informações e fluxos da empresa estão integrados?',
      S5: 'Como o time acessa informações para resolver problemas diários?',
      S6: 'Observações adicionais sobre Sistematizar (processos)',
      Au1: 'Como são executadas as tarefas repetitivas do dia a dia?',
      Au2: 'Como funcionam os fluxos constantes (follow-ups, agendamentos)?',
      Au3: 'Qual o nível de automação dos processos operacionais?',
      Au4: 'Quanto tempo o time gasta com tarefas operacionais manuais?',
      Au5: 'Como são gerados e acompanhados os KPIs da empresa?',
      Au6: 'Observações adicionais sobre Automatizar',
      T1: 'Como você avalia a atual dependência do negócio em relação aos donos?',
      T2: 'Quão claro é o principal gargalo atual da empresa?',
      T3: 'O quão bem definida está a visão de futuro da empresa?',
      T4: 'Qual é o principal desafio estratégico para os próximos 90 dias?',
    }

    const blockSpecs = [
      { id: 'A', title: 'Amplificar (Pessoas)', keys: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'] },
      { id: 'S', title: 'Sistematizar (Processos)', keys: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
      {
        id: 'Au',
        title: 'Automatizar (Tecnologia)',
        keys: ['Au1', 'Au2', 'Au3', 'Au4', 'Au5', 'Au6'],
      },
      { id: 'T', title: 'Transformação & Visão', keys: ['T1', 'T2', 'T3', 'T4'] },
    ]

    const respostasJson = diagnostico.respostas_json || {}

    blockSpecs.forEach((block) => {
      checkPageBreak(70)
      page.drawText(block.title, { x: 40, y, size: 14, font: boldFont, color: teal })
      y -= 25

      block.keys.forEach((key) => {
        const qText = dict[key] || `Pergunta ${key}`
        let ans = respostasJson[key]

        if (ans === undefined || ans === null || (typeof ans === 'string' && ans.trim() === '')) {
          const blockTypeMatch = key.replace(/[0-9]/g, '')
          const numMatch = parseInt(key.replace(/\D/g, ''))
          const aberta = respostas.find(
            (r: any) => r.tipo_bloco === blockTypeMatch && r.numero_pergunta === numMatch,
          )
          if (aberta && aberta.resposta) {
            ans = aberta.resposta
          }
        }

        if (ans !== undefined && ans !== null && ans !== '') {
          const qLines = wrapText(`${key}. ${qText}`, 515, boldFont, 10)
          const isText = typeof ans === 'string'
          const ansText = isText ? ans : `Nota registrada: ${ans}`
          const aLines = wrapText(ansText, 500, font, 10)

          const totalH = qLines.length * 15 + aLines.length * 15 + 15
          checkPageBreak(totalH + 10)

          qLines.forEach((l) => {
            page.drawText(l, { x: 40, y, size: 10, font: boldFont, color: textWhite })
            y -= 15
          })

          aLines.forEach((l) => {
            page.drawText(l, { x: 55, y, size: 10, font, color: textGray })
            y -= 15
          })

          y -= 10
        }
      })

      y -= 10
    })

    const pdfBytes = await pdfDoc.save()

    // Upload to Supabase Storage
    const fileName = `${diagnostico_id}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('diagnosticos')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) throw new Error(`Erro no upload do PDF: ${uploadError.message}`)

    const { data: publicUrlData } = supabase.storage.from('diagnosticos').getPublicUrl(fileName)

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrlData.publicUrl,
      }),
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
