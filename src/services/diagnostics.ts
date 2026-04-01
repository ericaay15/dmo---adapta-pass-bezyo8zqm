import { supabase } from '@/lib/supabase/client'
import { DiagnosisState } from '@/stores/useDiagnosisStore'

export const submitDiagnosis = async (data: DiagnosisState) => {
  const payload = {
    A1: parseInt(data.a1),
    A2: parseInt(data.a2),
    A3: parseInt(data.a3),
    A4: parseInt(data.a4),
    A5: parseInt(data.a5),
    S1: parseInt(data.s1),
    S2: parseInt(data.s2),
    S3: parseInt(data.s3),
    S4: parseInt(data.s4),
    S5: parseInt(data.s5),
    Au1: parseInt(data.au1),
    Au2: parseInt(data.au2),
    Au3: parseInt(data.au3),
    Au4: parseInt(data.au4),
    Au5: parseInt(data.au5),
    T1: data.t1,
    T2: data.t2,
    T3: data.t3,
    A6: data.a6,
    S6: data.s6,
    Au6: data.au6,
    T4: data.t4,
  }

  const numericFields = [
    payload.A1,
    payload.A2,
    payload.A3,
    payload.A4,
    payload.A5,
    payload.S1,
    payload.S2,
    payload.S3,
    payload.S4,
    payload.S5,
    payload.Au1,
    payload.Au2,
    payload.Au3,
    payload.Au4,
    payload.Au5,
    payload.T1,
    payload.T2,
    payload.T3,
  ]

  if (numericFields.some((val) => typeof val === 'number' && Number.isNaN(val))) {
    throw new Error('Algumas respostas numéricas estão inválidas. Por favor, revise o formulário.')
  }

  const { data: scoringData, error: scoringError } = await supabase.functions.invoke(
    'calcular_scoring',
    {
      body: payload,
    },
  )

  if (scoringError) throw new Error(`Erro ao calcular scoring: ${scoringError.message}`)
  if (scoringData?.error) throw new Error(`Erro de validação do servidor: ${scoringData.error}`)

  let empresaId: string
  const cnpjValue = data.cnpj || 'Não informado'

  const { data: existingEmpresa, error: findEmpresaError } = await supabase
    .from('empresas')
    .select('id')
    .eq('cnpj', cnpjValue)
    .limit(1)
    .maybeSingle()

  if (findEmpresaError) {
    throw new Error(`Erro ao verificar empresa: ${findEmpresaError.message}`)
  }

  if (existingEmpresa) {
    empresaId = existingEmpresa.id
    const { error: updateError } = await supabase
      .from('empresas')
      .update({
        nome: data.companyName,
        email_admin: data.adminEmail || 'nao_informado@email.com',
        responsavel_nome: data.leadName,
        responsavel_email: data.leadEmail,
        segmento: data.segmento,
      } as any)
      .eq('id', empresaId)

    if (updateError) throw new Error(`Erro ao atualizar empresa: ${updateError.message}`)
  } else {
    const { data: newEmpresa, error: empresaError } = await supabase
      .from('empresas')
      .insert({
        cnpj: cnpjValue,
        nome: data.companyName,
        email_admin: data.adminEmail || 'nao_informado@email.com',
        responsavel_nome: data.leadName,
        responsavel_email: data.leadEmail,
        segmento: data.segmento,
      } as any)
      .select('id')
      .single()

    if (empresaError) throw new Error(`Erro ao salvar empresa: ${empresaError.message}`)
    empresaId = newEmpresa.id
  }

  const { data: diagnostico, error: diagnosticoError } = await supabase
    .from('diagnosticos')
    .insert({
      empresa_id: empresaId,
      quem_preencheu: data.userName,
      respostas_json: payload as any,
      nota_a: scoringData.blocos.A.nota,
      nota_s: scoringData.blocos.S.nota,
      nota_au: scoringData.blocos.Au.nota,
      nota_t: scoringData.blocos.T.nota,
      nota_geral: scoringData.nota_geral.valor,
      classificacao_a: scoringData.blocos.A.classificacao,
      classificacao_s: scoringData.blocos.S.classificacao,
      classificacao_au: scoringData.blocos.Au.classificacao,
      top_3_oportunidades_json: scoringData.top_3_oportunidades as any,
      metricas_json: scoringData.metricas_chave as any,
      first_impact_json: scoringData.first_impact as any,
    })
    .select('id')
    .single()

  if (diagnosticoError) throw new Error(`Erro ao salvar diagnóstico: ${diagnosticoError.message}`)

  const abertas = [
    {
      diagnostico_id: diagnostico.id,
      tipo_bloco: 'A',
      numero_pergunta: 6,
      resposta: data.a6 || '',
    },
    {
      diagnostico_id: diagnostico.id,
      tipo_bloco: 'S',
      numero_pergunta: 6,
      resposta: data.s6 || '',
    },
    {
      diagnostico_id: diagnostico.id,
      tipo_bloco: 'Au',
      numero_pergunta: 6,
      resposta: data.au6 || '',
    },
    {
      diagnostico_id: diagnostico.id,
      tipo_bloco: 'T',
      numero_pergunta: 4,
      resposta: data.t4 || '',
    },
  ].filter((a) => a.resposta.trim() !== '')

  if (abertas.length > 0) {
    const { error: abertasError } = await supabase.from('respostas_abertas').insert(abertas)

    if (abertasError) throw new Error(`Erro ao salvar respostas abertas: ${abertasError.message}`)
  }

  return { scoringData, diagnosticoId: diagnostico.id }
}

export const finalizeSuccessPlan = async (diagnosticoId: string, complemento: string) => {
  if (complemento && complemento.trim() !== '') {
    const { error: updateDiagError } = await supabase
      .from('diagnosticos')
      .update({ complemento_sucesso: complemento.trim() } as any)
      .eq('id', diagnosticoId)

    if (updateDiagError) {
      console.error('Erro ao atualizar complemento_sucesso no banco:', updateDiagError.message)
      throw new Error(`Erro ao atualizar plano de sucesso: ${updateDiagError.message}`)
    }

    const { error: abertasError } = await supabase.from('respostas_abertas').insert({
      diagnostico_id: diagnosticoId,
      tipo_bloco: 'P',
      numero_pergunta: 1,
      resposta: complemento.trim(),
    })

    if (abertasError) {
      throw new Error(`Erro ao salvar complemento em respostas: ${abertasError.message}`)
    }
  }

  // Define a URL da página de relatório do frontend
  const pdfUrl = `${window.location.origin}/relatorio/${diagnosticoId}`

  // Atualiza no banco para ficar registrado na tabela e triggar a exportação para o Sheets
  const { error: updatePdfError } = await supabase
    .from('diagnosticos')
    .update({ pdf_url: pdfUrl } as any)
    .eq('id', diagnosticoId)

  if (updatePdfError) {
    console.error('Erro ao atualizar pdf_url no banco:', updatePdfError.message)
  }

  supabase.functions
    .invoke('exportar_para_sheets', {
      body: { diagnostico_id: diagnosticoId },
    })
    .catch((err) => {
      console.error('Falha de rede ao tentar invocar exportar_para_sheets:', err)
    })

  return { pdfUrl }
}
