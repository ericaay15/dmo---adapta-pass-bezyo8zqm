import { supabase } from '@/lib/supabase/client'
import { DiagnosisState } from '@/stores/useDiagnosisStore'
import { questionsMap } from '@/constants/questionsMap'

export const submitDiagnosis = async (data: DiagnosisState) => {
  const payload = {
    motivacao: data.motivacao,
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
    ferramentas: data.ferramentasUsadas,
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

  // WRITE 1: Upsert into companies
  let companyId: string
  const cnpjValue = data.cnpj || 'Não informado'

  const { data: existingCompany, error: findCompanyError } = await supabase
    .from('companies')
    .select('id')
    .eq('cnpj', cnpjValue)
    .limit(1)
    .maybeSingle()

  if (findCompanyError) {
    throw new Error(`Erro ao verificar company: ${findCompanyError.message}`)
  }

  if (existingCompany) {
    companyId = existingCompany.id
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        name: data.companyName,
        segment: data.segmento,
        filler_email: data.adminEmail || 'nao_informado@email.com',
      } as any)
      .eq('id', companyId)

    if (updateError) throw new Error(`Erro ao atualizar company: ${updateError.message}`)
  } else {
    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({
        cnpj: cnpjValue,
        name: data.companyName,
        segment: data.segmento,
        filler_email: data.adminEmail || 'nao_informado@email.com',
      } as any)
      .select('id')
      .single()

    if (companyError) throw new Error(`Erro ao salvar company: ${companyError.message}`)
    companyId = newCompany.id
  }

  // WRITE 2: Insert into sessions
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      company_id: companyId,
      filled_by: data.userName,
      responsible_name: data.leadName,
      responsible_email: data.leadEmail,
      scoring_json: scoringData as any,
    })
    .select('id')
    .single()

  if (sessionError) throw new Error(`Erro ao salvar session: ${sessionError.message}`)
  const sessionId = session.id

  // WRITE 3: Batch insert into answers
  const rawAnswers = [
    {
      block: 'INTRO',
      question_name: 'motivacao',
      question_type: 'text',
      question_answer: data.motivacao,
    },
    { block: 'A', question_name: 'A1', question_type: 'numeric', question_answer: String(data.a1) },
    { block: 'A', question_name: 'A2', question_type: 'numeric', question_answer: String(data.a2) },
    { block: 'A', question_name: 'A3', question_type: 'numeric', question_answer: String(data.a3) },
    { block: 'A', question_name: 'A4', question_type: 'numeric', question_answer: String(data.a4) },
    { block: 'A', question_name: 'A5', question_type: 'numeric', question_answer: String(data.a5) },
    { block: 'A', question_name: 'A6', question_type: 'text', question_answer: data.a6 },

    { block: 'S', question_name: 'S1', question_type: 'numeric', question_answer: String(data.s1) },
    { block: 'S', question_name: 'S2', question_type: 'numeric', question_answer: String(data.s2) },
    { block: 'S', question_name: 'S3', question_type: 'numeric', question_answer: String(data.s3) },
    { block: 'S', question_name: 'S4', question_type: 'numeric', question_answer: String(data.s4) },
    { block: 'S', question_name: 'S5', question_type: 'numeric', question_answer: String(data.s5) },
    { block: 'S', question_name: 'S6', question_type: 'text', question_answer: data.s6 },

    {
      block: 'Au',
      question_name: 'Au1',
      question_type: 'numeric',
      question_answer: String(data.au1),
    },
    {
      block: 'Au',
      question_name: 'Au2',
      question_type: 'numeric',
      question_answer: String(data.au2),
    },
    {
      block: 'Au',
      question_name: 'Au3',
      question_type: 'numeric',
      question_answer: String(data.au3),
    },
    {
      block: 'Au',
      question_name: 'Au4',
      question_type: 'numeric',
      question_answer: String(data.au4),
    },
    {
      block: 'Au',
      question_name: 'Au5',
      question_type: 'numeric',
      question_answer: String(data.au5),
    },
    { block: 'Au', question_name: 'Au6', question_type: 'text', question_answer: data.au6 },

    { block: 'T', question_name: 'T1', question_type: 'numeric', question_answer: String(data.t1) },
    { block: 'T', question_name: 'T2', question_type: 'numeric', question_answer: String(data.t2) },
    { block: 'T', question_name: 'T3', question_type: 'numeric', question_answer: String(data.t3) },
    { block: 'T', question_name: 'T4', question_type: 'text', question_answer: data.t4 },
    {
      block: 'FERR',
      question_name: 'ferramentas',
      question_type: 'text',
      question_answer: data.ferramentasUsadas,
    },

    {
      block: 'SEG',
      question_name: 'temasSelecionados',
      question_type: 'array',
      question_answer: (data.temasSelecionados || []).join(', '),
    },
    {
      block: 'SEG',
      question_name: 'temaOutros',
      question_type: 'text',
      question_answer: data.temaOutros,
    },
  ]

  const answersToInsert = rawAnswers
    .filter(
      (a) =>
        a.question_answer !== undefined &&
        a.question_answer !== null &&
        a.question_answer !== '' &&
        a.question_answer !== 'undefined',
    )
    .map((a) => ({
      ...a,
      session_id: sessionId,
      company_id: companyId,
      question_label: questionsMap[a.question_name] || a.question_name,
    }))

  if (answersToInsert.length > 0) {
    const { error: answersError } = await supabase.from('answers').insert(answersToInsert)
    if (answersError) throw new Error(`Erro ao salvar answers: ${answersError.message}`)
  }

  // WRITE 4: Insert into aggregated_answers
  const { error: aggregatedError } = await supabase.from('aggregated_answers').insert({
    session_id: sessionId,
    company_id: companyId,
    answers_json: {
      ...payload,
      temasSelecionados: data.temasSelecionados,
      temaOutros: data.temaOutros,
    } as any,
  })

  if (aggregatedError)
    throw new Error(`Erro ao salvar aggregated_answers: ${aggregatedError.message}`)

  // Define a URL da página de relatório do frontend e salva antes de notificar as integrações
  const pdfUrl = `${window.location.origin}/relatorio/${sessionId}`

  const { error: updatePdfSessionError } = await supabase
    .from('sessions')
    .update({ pdf_url: pdfUrl })
    .eq('id', sessionId)

  if (updatePdfSessionError) {
    console.error('Erro ao atualizar pdf_url em sessions:', updatePdfSessionError.message)
  }

  supabase.functions
    .invoke('exportar_para_sheets', {
      body: { session_id: sessionId },
    })
    .catch((err) => {
      console.error('Falha de rede ao tentar invocar exportar_para_sheets:', err)
    })

  supabase.functions
    .invoke('enviar_webhook', {
      body: { session_id: sessionId },
    })
    .catch((err) => {
      console.error('Falha ao invocar enviar_webhook:', err)
    })

  // LEGACY — disabled, kept for reference.
  /*
  let empresaId: string
  const cnpjValueLegacy = data.cnpj || 'Não informado'

  const { data: existingEmpresa, error: findEmpresaError } = await supabase
    .from('empresas')
    .select('id')
    .eq('cnpj', cnpjValueLegacy)
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
        cnpj: cnpjValueLegacy,
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
      respostas_json: {
        ...payload,
        temasSelecionados: data.temasSelecionados,
        temaOutros: data.temaOutros,
      } as any,
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
    {
      diagnostico_id: diagnostico.id,
      tipo_bloco: 'SEG',
      numero_pergunta: 1,
      resposta: (data.temasSelecionados || []).join(', '),
    },
    {
      diagnostico_id: diagnostico.id,
      tipo_bloco: 'SEG',
      numero_pergunta: 2,
      resposta: data.temaOutros || '',
    },
  ].filter((a) => a.resposta.trim() !== '')

  if (abertas.length > 0) {
    const { error: abertasError } = await supabase.from('respostas_abertas').insert(abertas)

    if (abertasError) throw new Error(`Erro ao salvar respostas abertas: ${abertasError.message}`)
  }

  return { scoringData, diagnosticoId: diagnostico.id }
  */

  return { scoringData, sessionId }
}

export const finalizeSuccessPlan = async (sessionId: string, complemento: string) => {
  if (complemento && complemento.trim() !== '') {
    const { error: updateSessionError } = await supabase
      .from('sessions')
      .update({ success_complement: complemento.trim() })
      .eq('id', sessionId)

    if (updateSessionError) {
      console.error('Erro ao atualizar success_complement no banco:', updateSessionError.message)
      throw new Error(`Erro ao atualizar plano de sucesso: ${updateSessionError.message}`)
    }

    const { data: sessionData, error: sessionQueryError } = await supabase
      .from('sessions')
      .select('company_id')
      .eq('id', sessionId)
      .single()

    if (sessionQueryError) {
      throw new Error(`Erro ao buscar company_id: ${sessionQueryError.message}`)
    }

    const { error: answersError } = await supabase.from('answers').insert({
      session_id: sessionId,
      company_id: sessionData.company_id,
      block: 'P',
      question_name: 'success_complement',
      question_type: 'text',
      question_answer: complemento.trim(),
      question_label: questionsMap['success_complement'] || 'success_complement',
    })

    if (answersError) {
      throw new Error(`Erro ao salvar complemento em answers: ${answersError.message}`)
    }

    // LEGACY — disabled, kept for reference.
    /*
    const { error: updateDiagError } = await supabase
      .from('diagnosticos')
      .update({ complemento_sucesso: complemento.trim() } as any)
      .eq('id', sessionId)

    if (updateDiagError) {
      console.error('Erro ao atualizar complemento_sucesso no banco:', updateDiagError.message)
      throw new Error(`Erro ao atualizar plano de sucesso: ${updateDiagError.message}`)
    }

    const { error: abertasError } = await supabase.from('respostas_abertas').insert({
      diagnostico_id: sessionId,
      tipo_bloco: 'P',
      numero_pergunta: 1,
      resposta: complemento.trim(),
    })

    if (abertasError) {
      throw new Error(`Erro ao salvar complemento em respostas: ${abertasError.message}`)
    }
    */
  }

  const pdfUrl = `${window.location.origin}/relatorio/${sessionId}`

  // As funções de integração (Sheets e Webhook) agora são chamadas automaticamente
  // dentro do submitDiagnosis para garantir que os dados sejam registrados mesmo se
  // o usuário fechar a aba antes de finalizar o Plano de Sucesso.

  return { pdfUrl }
}
