import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const googleServiceAccount =
  Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON') || Deno.env.get('GOOGLE_SERVICE_ACCOUNT')!
const spreadsheetId = '1-L214YNEEsIrePGZqVxIPQbYx9uiyZsEuw8Ex5_1ajo'

const supabase = createClient(supabaseUrl, supabaseKey)

const HEADER_TO_KEY: Record<string, string> = {
  // Metadata
  diagnostico_id: 'session_id',
  data_preenchimento: 'created_at',
  empresa_id: 'company_id',
  nome_empresa: 'company_name',
  cnpj: 'cnpj',
  email_admin: 'filler_email',
  responsavel_nome: 'responsible_name',
  responsavel_email: 'responsible_email',
  quem_preencheu: 'filled_by',

  // Individual answers (old flat columns → answers_json keys)
  resposta_a1: 'A1',
  resposta_a2: 'A2',
  resposta_a3: 'A3',
  resposta_a4: 'A4',
  resposta_a5: 'A5',
  resposta_aberta_a6: 'A6',
  resposta_s1: 'S1',
  resposta_s2: 'S2',
  resposta_s3: 'S3',
  resposta_s4: 'S4',
  resposta_s5: 'S5',
  resposta_aberta_s6: 'S6',
  resposta_au1: 'Au1',
  resposta_au2: 'Au2',
  resposta_au3: 'Au3',
  resposta_au4: 'Au4',
  resposta_au5: 'Au5',
  resposta_aberta_au6: 'Au6',
  resposta_t1: 'T1',
  resposta_t2: 'T2',
  resposta_t3: 'T3',
  resposta_aberta_t4: 'T4',

  // Scores (old columns → scoring_json paths)
  nota_a: 'nota_a',
  classificacao_a: 'classificacao_a',
  nota_s: 'nota_s',
  classificacao_s: 'classificacao_s',
  nota_au: 'nota_au',
  classificacao_au: 'classificacao_au',
  nota_t: 'nota_t',
  nota_geral: 'nota_geral',

  // Old columns with no new equivalent
  resposta_plano_sucesso: 'success_complement',
  pdf_url: 'pdf_url',
  atualizado_em: 'updated_at',

  // New columns (AQ–AX) — key matches header directly
  segmento: 'segmento',
  classificacao_t: 'classificacao_t',
  classificacao_geral: 'classificacao_geral',
  top_oportunidades: 'top_oportunidades',
  metricas_chave: 'metricas_chave',
  first_impact: 'first_impact',
  temas_selecionados: 'temas_selecionados',
  tema_outros: 'tema_outros',
}

function buildDataMap(
  session: any,
  company: any,
  scoring: any,
  answersJson: Record<string, any>,
): Record<string, string> {
  const map: Record<string, string> = {}

  // --- Metadata ---
  map['session_id'] = session.id ?? ''
  map['created_at'] = session.created_at ?? ''
  map['company_id'] = company.id ?? ''
  map['company_name'] = company.name ?? ''
  map['cnpj'] = company.cnpj ?? ''
  map['filler_email'] = company.filler_email ?? ''
  map['responsible_name'] = session.responsible_name ?? ''
  map['responsible_email'] = session.responsible_email ?? ''
  map['filled_by'] = session.filled_by ?? ''
  map['segmento'] = company.segment ?? ''

  // --- Scores from scoring_json ---
  map['nota_a'] = String(scoring?.blocos?.A?.nota ?? '')
  map['classificacao_a'] = scoring?.blocos?.A?.classificacao ?? ''
  map['nota_s'] = String(scoring?.blocos?.S?.nota ?? '')
  map['classificacao_s'] = scoring?.blocos?.S?.classificacao ?? ''
  map['nota_au'] = String(scoring?.blocos?.Au?.nota ?? '')
  map['classificacao_au'] = scoring?.blocos?.Au?.classificacao ?? ''
  map['nota_t'] = String(scoring?.blocos?.T?.nota ?? '')
  map['classificacao_t'] = scoring?.blocos?.T?.classificacao ?? ''
  map['nota_geral'] = String(scoring?.nota_geral?.valor ?? '')
  map['classificacao_geral'] = scoring?.nota_geral?.classificacao ?? ''
  map['top_oportunidades'] = JSON.stringify(scoring?.top_3_oportunidades ?? [])
  map['metricas_chave'] = JSON.stringify(scoring?.metricas_chave ?? {})
  map['first_impact'] = JSON.stringify(scoring?.first_impact ?? {})

  // --- Extras ---
  map['success_complement'] = session.success_complement ?? ''
  map['pdf_url'] = session.pdf_url ?? ''
  map['updated_at'] = session.updated_at ?? ''

  // --- Dynamic question answers ---
  const TEMAS_KEYS = new Set(['temasSelecionados', 'temaOutros'])
  for (const [key, value] of Object.entries(answersJson ?? {})) {
    if (!TEMAS_KEYS.has(key)) {
      map[key] = String(value ?? '')
    }
  }

  // --- SEG block (if present) ---
  if (answersJson?.temasSelecionados) {
    map['temas_selecionados'] =
      typeof answersJson.temasSelecionados === 'string'
        ? answersJson.temasSelecionados
        : JSON.stringify(answersJson.temasSelecionados)
  }
  if (answersJson?.temaOutros) {
    map['tema_outros'] = String(answersJson.temaOutros)
  }

  return map
}

function columnLetterFromIndex(index: number): string {
  let letter = ''
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter
    index = Math.floor(index / 26) - 1
  }
  return letter
}

function base64url(str: string) {
  return btoa(str).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64urlBytes(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

async function getGoogleAccessToken() {
  console.log('Iniciando geração de token do Google...')
  const serviceAccount = JSON.parse(googleServiceAccount)

  const header = { alg: 'RS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const headerEncoded = base64url(JSON.stringify(header))
  const payloadEncoded = base64url(JSON.stringify(payload))
  const signatureInput = `${headerEncoded}.${payloadEncoded}`

  const privateKey = serviceAccount.private_key
  const encoder = new TextEncoder()
  const data = encoder.encode(signatureInput)

  const pemHeader = '-----BEGIN PRIVATE KEY-----'
  const pemFooter = '-----END PRIVATE KEY-----'
  const pemContents = privateKey
    .substring(privateKey.indexOf(pemHeader) + pemHeader.length, privateKey.indexOf(pemFooter))
    .replace(/\s/g, '')

  const binaryDerString = atob(pemContents)
  const binaryDer = new Uint8Array(binaryDerString.length)
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i)
  }

  const keyData = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keyData, data)
  const signatureEncoded = base64urlBytes(new Uint8Array(signature))
  const jwt = `${signatureInput}.${signatureEncoded}`

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  const data_response = await response.json()
  return data_response.access_token
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('Body recebido:', body)

    if (!body.session_id) {
      return new Response(JSON.stringify({ success: false, error: 'session_id is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const sessionId = body.session_id

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      throw new Error(`Sessão não encontrada: ${sessionError?.message || 'Erro desconhecido'}`)
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', session.company_id)
      .single()

    if (companyError || !company) {
      throw new Error(`Empresa não encontrada: ${companyError?.message || 'Erro desconhecido'}`)
    }

    const { data: aggregatedAnswers, error: aggregatedAnswersError } = await supabase
      .from('aggregated_answers')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (aggregatedAnswersError) {
      console.log(`Aviso: erro ao buscar aggregated_answers: ${aggregatedAnswersError.message}`)
    }

    const accessToken = await getGoogleAccessToken()

    // 1. Dynamic tab name discovery
    const spreadsheetRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    if (!spreadsheetRes.ok) throw new Error('Falha ao obter propriedades da planilha')
    const spreadsheetData = await spreadsheetRes.json()
    const tabName = spreadsheetData.sheets?.[0]?.properties?.title
    if (!tabName) throw new Error('Aba não encontrada')

    // 2. Dynamic header row reading
    const headerRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tabName}!1:1`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    if (!headerRes.ok) throw new Error('Falha ao obter cabeçalhos da planilha')
    const headerData = await headerRes.json()
    const headers = headerData.values?.[0] || []

    // 3. buildDataMap
    const scoring = (session.scoring_json as any) || {}
    const answersJson = (aggregatedAnswers?.answers_json as any) || {}
    const dataMap = buildDataMap(session, company, scoring, answersJson)

    // 4. Row construction — key-based projection
    const row = headers.map((header: string) => {
      const key = HEADER_TO_KEY[header] ?? header
      return dataMap[key] ?? ''
    })

    // 5. Auto-detect and append new columns
    const coveredKeys = new Set(headers.map((h: string) => HEADER_TO_KEY[h] ?? h))
    const newKeys = Object.keys(dataMap).filter((k) => !coveredKeys.has(k) && dataMap[k] !== '')

    if (newKeys.length > 0) {
      const startCol = columnLetterFromIndex(headers.length)
      const endCol = columnLetterFromIndex(headers.length + newKeys.length - 1)
      const headerRange = `${tabName}!${startCol}1:${endCol}1`

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${headerRange}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values: [newKeys] }),
        },
      )

      row.push(...newKeys.map((k) => dataMap[k]))
    }

    // 6. Write the row
    const lastCol = columnLetterFromIndex(row.length - 1)
    const appendRange = `${tabName}!A:${lastCol}`

    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${appendRange}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [row] }),
      },
    )
    if (!appendRes.ok) {
      const errorData = await appendRes.text()
      throw new Error(`Falha ao inserir linha: ${errorData}`)
    }
    const result = await appendRes.json()

    return new Response(
      JSON.stringify({ success: true, message: 'Dados adicionados ao Sheets', result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error: any) {
    console.error('Erro capturado no fluxo principal da função:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
