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

    let values: string[] = []

    // Se receber apenas o diagnostico_id (como na nova implementação), busca do banco
    if (body.diagnostico_id) {
      console.log(`Buscando dados do diagnostico_id: ${body.diagnostico_id}`)

      const { data: diag, error: diagError } = await supabase
        .from('diagnosticos')
        .select('*, empresas(*)')
        .eq('id', body.diagnostico_id)
        .single()

      if (diagError || !diag) {
        throw new Error(`Diagnóstico não encontrado: ${diagError?.message || 'Erro desconhecido'}`)
      }

      console.log('Dados do diagnóstico resgatados com sucesso.')

      const top3Array = diag.top_3_oportunidades_json as any[]
      const top3Str = Array.isArray(top3Array)
        ? top3Array.map((op: any, i: number) => `${i + 1}. ${op.nome}`).join('\n')
        : ''

      const metricas = (diag.metricas_json as any) || {}
      const metricasStr = `Impactadas: ${metricas.pessoas_impactadas?.nivel || '-'}\nHoras: ${metricas.horas_recuperadas?.estimativa || '-'}\nDependência: ${metricas.dependencia_do_dono?.percentual || 0}%`

      const firstImpact = (diag.first_impact_json as any) || {}
      const firstImpactStr = Array.isArray(firstImpact.descricao)
        ? firstImpact.descricao.join('\n')
        : firstImpact.descricao || ''

      values = [
        diag.empresas?.cnpj || '',
        diag.empresas?.email_admin || '',
        diag.empresas?.responsavel_nome || '',
        new Date(diag.data_preenchimento).toLocaleDateString('pt-BR'),
        diag.nota_a?.toString() || '',
        diag.nota_s?.toString() || '',
        diag.nota_au?.toString() || '',
        diag.nota_geral?.toString() || '',
        diag.classificacao_a || '',
        diag.classificacao_s || '',
        diag.classificacao_au || '',
        top3Str,
        metricasStr,
        firstImpactStr,
        diag.complemento_sucesso || '',
        diag.pdf_url || '',
      ]
    } else {
      // Fallback legada caso receba os valores diretamente
      values = [
        body.cnpj || '',
        body.email_admin || '',
        body.responsavel || '',
        body.data || '',
        body.nota_a || '',
        body.nota_s || '',
        body.nota_au || '',
        body.nota_geral || '',
        body.classificacao_a || '',
        body.classificacao_s || '',
        body.classificacao_au || '',
        body.top_3_oportunidades || '',
        body.metricas || '',
        body.first_impact || '',
        body.complemento_plano || body.complemento_sucesso || '',
        body.link_documento_pdf || '',
      ]
    }

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
