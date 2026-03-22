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
    let page = pdfDoc.addPage([595.28, 841.89]) // A4 Size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    let y = 780

    const checkPageBreak = (needed: number) => {
      if (y - needed < 50) {
        page = pdfDoc.addPage([595.28, 841.89])
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
    page.drawText('ADAPTA PASS', { x: 50, y, size: 24, font: boldFont, color: rgb(0.1, 0.1, 0.1) })
    page.drawText('Plano de Ação e Diagnóstico', {
      x: 50,
      y: y - 20,
      size: 14,
      font,
      color: rgb(0.4, 0.4, 0.4),
    })
    y -= 50

    // Company Data
    const empresa = diagnostico.empresas || {}
    page.drawText('Dados da Empresa:', { x: 50, y, size: 12, font: boldFont })
    y -= 20

    page.drawText(`Empresa: ${empresa.nome || 'Não informado'}`, { x: 50, y, size: 10, font })
    page.drawText(`CNPJ: ${empresa.cnpj || 'Não informado'}`, { x: 300, y, size: 10, font })
    y -= 15

    page.drawText(`Responsável: ${empresa.responsavel_nome || 'Não informado'}`, {
      x: 50,
      y,
      size: 10,
      font,
    })
    page.drawText(`E-mail: ${empresa.responsavel_email || 'Não informado'}`, {
      x: 300,
      y,
      size: 10,
      font,
    })
    y -= 15

    page.drawText(`Preenchido por: ${diagnostico.quem_preencheu || 'Não informado'}`, {
      x: 50,
      y,
      size: 10,
      font,
    })
    const rawDate = diagnostico.data_preenchimento
    let dataPreenchimento = ''
    if (rawDate) {
      try {
        const d = new Date(rawDate)
        dataPreenchimento = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
      } catch (e) {}
    }
    if (dataPreenchimento) {
      page.drawText(`Data: ${dataPreenchimento}`, { x: 300, y, size: 10, font })
    }
    y -= 40

    // Nota Geral
    page.drawText(`Nota Geral: ${diagnostico.nota_geral}`, { x: 50, y, size: 20, font: boldFont })
    const getClas = (n: number) =>
      n <= 3 ? 'Inicial' : n <= 6 ? 'Em progresso' : n <= 8 ? 'Avançado' : 'Excelente'
    page.drawText(`Classificação: ${getClas(diagnostico.nota_geral)}`, {
      x: 250,
      y,
      size: 14,
      font,
      color: rgb(0.4, 0.4, 0.4),
    })
    y -= 50

    // Barras ASA
    const drawBar = (label: string, score: number) => {
      page.drawText(label, { x: 50, y, size: 12, font: boldFont })
      page.drawText(score.toString(), { x: 150, y, size: 12, font: boldFont })

      page.drawRectangle({ x: 200, y: y - 2, width: 300, height: 12, color: rgb(0.9, 0.9, 0.9) })

      const barW = (score / 10) * 300
      let c = rgb(0.9, 0.2, 0.2) // Vermelho 0-3
      if (score > 3 && score <= 6)
        c = rgb(0.94, 0.76, 0.05) // Amarelo 4-6
      else if (score > 6 && score <= 8)
        c = rgb(0.13, 0.77, 0.36) // Verde 7-8
      else if (score > 8) c = rgb(0.18, 0.5, 0.92) // Azul 9-10

      page.drawRectangle({ x: 200, y: y - 2, width: barW, height: 12, color: c })
      y -= 30
    }

    drawBar('Atrair (A)', diagnostico.nota_a)
    drawBar('Sistematizar (S)', diagnostico.nota_s)
    drawBar('Automatizar (Au)', diagnostico.nota_au)
    y -= 30

    // Cards de Métricas
    page.drawText('Métricas de Impacto', { x: 50, y, size: 16, font: boldFont })
    y -= 30

    const metricas = (diagnostico.metricas_json || {}) as any
    const drawCard = (x: number, title: string, val: string, desc: string) => {
      page.drawRectangle({
        x,
        y: y - 70,
        width: 150,
        height: 70,
        color: rgb(0.97, 0.97, 0.97),
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      })
      page.drawText(title, { x: x + 10, y: y - 20, size: 10, font: boldFont })
      page.drawText(val, {
        x: x + 10,
        y: y - 40,
        size: 14,
        font: boldFont,
        color: rgb(0.1, 0.5, 0.8),
      })
      const dLines = wrapText(desc, 130, font, 8)
      dLines.forEach((l, i) => {
        page.drawText(l, { x: x + 10, y: y - 55 - i * 10, size: 8, font })
      })
    }

    drawCard(
      50,
      'Pessoas Impactadas',
      metricas.pessoas_impactadas?.nivel || 'N/A',
      metricas.pessoas_impactadas?.descricao || '',
    )
    drawCard(
      220,
      'Horas Recuperadas',
      metricas.horas_recuperadas?.estimativa || 'N/A',
      metricas.horas_recuperadas?.descricao || '',
    )
    drawCard(
      390,
      'Dependência do Dono',
      `${metricas.dependencia_do_dono?.percentual || 0}%`,
      metricas.dependencia_do_dono?.descricao || '',
    )
    y -= 110

    // Top 3 Oportunidades
    page.drawText('Top 3 Oportunidades', { x: 50, y, size: 16, font: boldFont })
    y -= 25
    const top3 = (diagnostico.top_3_oportunidades_json || []) as any[]
    top3.forEach((op, i) => {
      const text = `${i + 1}. ${op.nome} (Dimensão: ${op.bloco} - Nota: ${op.nota})`
      const lines = wrapText(text, 490, font, 12)
      lines.forEach((l) => {
        checkPageBreak(15)
        page.drawText(l, { x: 50, y, size: 12, font })
        y -= 15
      })
      y -= 10
    })

    // First Impact
    checkPageBreak(150)
    page.drawText('First Impact (Meta para os próximos 90 dias)', {
      x: 50,
      y,
      size: 16,
      font: boldFont,
    })
    y -= 25
    const fi = (diagnostico.first_impact_json || {}) as any

    if (Array.isArray(fi.descricao)) {
      fi.descricao.forEach((item: string) => {
        const itemLines = wrapText(`• ${item}`, 490, font, 12)
        itemLines.forEach((l) => {
          checkPageBreak(15)
          page.drawText(l, { x: 50, y, size: 12, font })
          y -= 15
        })
        y -= 5
      })
    } else {
      const fiDesc = wrapText(fi.descricao || '', 490, font, 12)
      fiDesc.forEach((l) => {
        checkPageBreak(15)
        page.drawText(l, { x: 50, y, size: 12, font })
        y -= 15
      })
    }
    y -= 15

    // Complemento do Plano
    const p1 =
      respostas.find((r: any) => r.tipo_bloco === 'P' && r.numero_pergunta === 1)?.resposta || ''
    const compText = diagnostico.complemento_sucesso || p1
    if (compText) {
      checkPageBreak(100)
      page.drawText('Complemento do Plano (Sua Visão):', { x: 50, y, size: 14, font: boldFont })
      y -= 20
      const p1Lines = wrapText(compText, 490, font, 10)
      p1Lines.forEach((l) => {
        checkPageBreak(20)
        page.drawText(l, { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) })
        y -= 15
      })
    }

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
