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

async function addRowToGoogleSheets(values: string[], accessToken: string) {
  const range = 'Sheet1!A:P'

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

  return await response.json()
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()

    const values = [
      body.cnpj,
      body.email_admin,
      body.responsavel,
      body.data,
      body.nota_a,
      body.nota_s,
      body.nota_au,
      body.nota_geral,
      body.classificacao_a,
      body.classificacao_s,
      body.classificacao_au,
      body.top_3_oportunidades,
      body.metricas,
      body.first_impact,
      body.complemento_plano,
      body.link_documento_pdf,
    ]

    const accessToken = await getGoogleAccessToken()
    const result = await addRowToGoogleSheets(values, accessToken)

    return new Response(
      JSON.stringify({ success: true, message: 'Dados adicionados ao Sheets', result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error: any) {
    console.error('Erro:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
