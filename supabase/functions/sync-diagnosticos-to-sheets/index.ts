import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

function base64url(str: string) {
  return btoa(str).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64urlBytes(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

async function getGoogleAccessToken(serviceAccountJson: string) {
  const serviceAccount = JSON.parse(serviceAccountJson)

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

  if (!response.ok) {
    throw new Error('Failed to authenticate with Google')
  }
  const data_response = await response.json()
  return data_response.access_token
}

async function appendToSheets(values: any[], accessToken: string, retries = 0): Promise<any> {
  const maxRetries = 3
  const spreadsheetId = '1-L214YNEEsIrePGZqVxIPQbYx9uiyZsEuw8Ex5_1ajo'
  const range = 'relatorio_diagnosticos_completos!A:AP'

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [values] }),
    },
  )

  if (!response.ok) {
    const status = response.status
    console.error(`Google Sheets API Error: ${status} ${response.statusText}`)

    if (status === 503 && retries < maxRetries) {
      const backoff = Math.pow(2, retries + 1) * 1000 // 2s, 4s, 8s
      console.log(`503 received, retrying in ${backoff}ms (retry ${retries + 1} of ${maxRetries})`)
      await new Promise((r) => setTimeout(r, backoff))
      return appendToSheets(values, accessToken, retries + 1)
    }

    throw new Error(`Google Sheets API error: ${status}`)
  }
  return response.json()
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let body
    try {
      body = await req.json()
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, error: 'Corpo da requisição inválido.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const requiredFields = [
      'diagnostico_id',
      'data_preenchimento',
      'empresa_id',
      'nome_empresa',
      'cnpj',
      'email_admin',
      'responsavel_nome',
      'responsavel_email',
      'quem_preencheu',
      'resposta_a1',
      'resposta_a2',
      'resposta_a3',
      'resposta_a4',
      'resposta_a5',
      'resposta_aberta_a6',
      'nota_a',
      'classificacao_a',
      'resposta_s1',
      'resposta_s2',
      'resposta_s3',
      'resposta_s4',
      'resposta_s5',
      'resposta_aberta_s6',
      'nota_s',
      'classificacao_s',
      'resposta_au1',
      'resposta_au2',
      'resposta_au3',
      'resposta_au4',
      'resposta_au5',
      'resposta_aberta_au6',
      'nota_au',
      'classificacao_au',
      'resposta_t1',
      'resposta_t2',
      'resposta_t3',
      'resposta_aberta_t4',
      'nota_t',
      'nota_geral',
      'resposta_plano_sucesso',
      'pdf_url',
      'atualizado_em',
    ]

    const missingFields = requiredFields.filter((f) => body[f] === undefined)
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
    if (!serviceAccountJson) {
      console.error('Missing GOOGLE_SERVICE_ACCOUNT_JSON secret')
      throw new Error('Configuration error')
    }

    const accessToken = await getGoogleAccessToken(serviceAccountJson)
    const values = requiredFields.map((f) => (body[f] === null ? '' : String(body[f])))

    const result = await appendToSheets(values, accessToken)

    return new Response(
      JSON.stringify({ success: true, row_number: result.updates?.updatedRange }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    console.error('Internal Error:', error.message || error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Nao foi possivel sincronizar com Google Sheets. Tente novamente.',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
