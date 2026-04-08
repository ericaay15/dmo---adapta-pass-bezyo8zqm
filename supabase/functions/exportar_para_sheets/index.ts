import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const googleServiceAccount = Deno.env.get('GOOGLE_SERVICE_ACCOUNT')!
const spreadsheetId = '1RLEBIWiwhnAvCHCJFQ6hHSpH_q9Q-eYSPR8c97f3-lk'

const supabase = createClient(supabaseUrl, supabaseKey)

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

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  console.log('Criando payload e header JWT...')
  const headerEncoded = base64url(JSON.stringify(header))
  const payloadEncoded = base64url(JSON.stringify(payload))
  const signatureInput = `${headerEncoded}.${payloadEncoded}`

  const privateKey = serviceAccount.private_key
  const encoder = new TextEncoder()
  const data = encoder.encode(signatureInput)

  console.log('Lendo private key...')
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

  console.log('Importando chave criptográfica...')
  const keyData = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  console.log('Assinando JWT...')
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keyData, data)
  const signatureEncoded = base64urlBytes(new Uint8Array(signature))

  const jwt = `${signatureInput}.${signatureEncoded}`

  console.log('Fazendo fetch para https://oauth2.googleapis.com/token...')
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  const data_response = await response.json()
  console.log(
    'Token gerado com sucesso:',
    data_response.access_token ? 'Sim (Token Oculto)' : `Não: ${JSON.stringify(data_response)}`,
  )
  return data_response.access_token
}

async function addRowToGoogleSheets(values: string[], accessToken: string) {
  console.log('Iniciando adição de linha no Google Sheets com valores:', values)
  const range = 'Sheet1!A:P'

  console.log(
    `Fazendo requisição para a API do Google Sheets (Spreadsheet ID: ${spreadsheetId})...`,
  )
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [values],
      }),
    },
  )

  const jsonResponse = await response.json()
  console.log('Resposta da API do Google Sheets:', jsonResponse)
  return jsonResponse
}

Deno.serve(async (req: Request) => {
  console.log(`Recebendo nova requisição HTTP: ${req.method}`)

  if (req.method === 'OPTIONS') {
    console.log('Respondendo requisição OPTIONS com headers de CORS')
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
    console.log(`Buscando dados da session_id: ${sessionId}`)

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

    console.log('Dados da sessão resgatados com sucesso.')

    const scoring = (session.scoring_json as any) || {}

    const top3Array = (scoring.top_3_oportunidades as any[]) || []
    const top3Str = Array.isArray(top3Array)
      ? top3Array.map((op: any, i: number) => `${i + 1}. ${op.nome}`).join('\n')
      : ''

    const metricas = scoring.metricas_chave || {}
    const metricasStr = `Impactadas: ${metricas.pessoas_impactadas?.nivel || '-'}\nHoras: ${metricas.horas_recuperadas?.estimativa || '-'}\nDependência: ${metricas.dependencia_do_dono?.percentual || 0}%`

    const firstImpact = scoring.first_impact || {}
    const firstImpactStr = Array.isArray(firstImpact.descricao)
      ? firstImpact.descricao.join('\n')
      : firstImpact.descricao || ''

    const values = [
      company.cnpj || '',
      company.filler_email || '',
      session.responsible_name || '',
      new Date(session.created_at).toLocaleDateString('pt-BR'),
      scoring.blocos?.A?.nota?.toString() || '',
      scoring.blocos?.S?.nota?.toString() || '',
      scoring.blocos?.Au?.nota?.toString() || '',
      scoring.nota_geral?.valor?.toString() || '',
      scoring.blocos?.A?.classificacao || '',
      scoring.blocos?.S?.classificacao || '',
      scoring.blocos?.Au?.classificacao || '',
      top3Str,
      metricasStr,
      firstImpactStr,
      session.success_complement || '',
      session.pdf_url || '',
    ]

    console.log('Valores formatados para envio ao Sheets:', values)

    const accessToken = await getGoogleAccessToken()
    console.log('Google Access Token recuperado com sucesso.')

    const result = await addRowToGoogleSheets(values, accessToken)
    console.log('Operação no Google Sheets finalizada.')

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
