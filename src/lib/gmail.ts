import { google } from 'googleapis'
import { decorate } from './demo-mail'
import { hasGoogleOAuth } from './keys'
import type { MailItem } from './types'

function redirectUri(): string {
  return process.env.GOOGLE_REDIRECT_URI?.trim() || 'http://localhost:3000/api/auth/callback'
}

export function oauthClient() {
  if (!hasGoogleOAuth()) return null
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri(),
  )
}

export function authUrl(): string | null {
  const client = oauthClient()
  if (!client) return null
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
  })
}

export async function exchangeCode(code: string) {
  const client = oauthClient()
  if (!client) throw new Error('Google OAuth is not configured')
  const { tokens } = await client.getToken(code)
  return tokens
}

function decodePart(raw?: string | null): string {
  if (!raw) return ''
  const padded = raw.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(padded, 'base64').toString('utf8')
}

function walkBody(payload?: {
  mimeType?: string | null
  body?: { data?: string | null } | null
  parts?: unknown
}): string {
  if (!payload) return ''
  if (payload.mimeType?.startsWith('text/plain') && payload.body?.data) {
    return decodePart(payload.body.data)
  }
  const parts = Array.isArray(payload.parts) ? payload.parts : []
  for (const part of parts) {
    const text = walkBody(part as never)
    if (text) return text
  }
  return payload.body?.data ? decodePart(payload.body.data) : ''
}

function header(
  headers: Array<{ name?: string | null; value?: string | null }> | undefined,
  name: string,
): string {
  return headers?.find((item) => item.name?.toLowerCase() === name.toLowerCase())?.value || ''
}

export async function listGmail(accessToken: string, refreshToken?: string): Promise<MailItem[]> {
  const client = oauthClient()
  if (!client) return []
  client.setCredentials({ access_token: accessToken, refresh_token: refreshToken })
  const gmail = google.gmail({ version: 'v1', auth: client })
  const listed = await gmail.users.messages.list({ userId: 'me', maxResults: 12, q: 'in:inbox' })
  const ids = listed.data.messages?.map((row) => row.id).filter(Boolean) as string[]
  const items: MailItem[] = []
  for (const id of ids) {
    const full = await gmail.users.messages.get({ userId: 'me', id, format: 'full' })
    const payload = full.data.payload
    const headers = payload?.headers || []
    const body = walkBody(payload).slice(0, 4000)
    items.push(
      decorate({
        id,
        from: header(headers, 'From') || 'unknown',
        subject: header(headers, 'Subject') || '(no subject)',
        snippet: full.data.snippet || body.slice(0, 140),
        body: body || full.data.snippet || '',
        date: header(headers, 'Date') || new Date().toISOString(),
      }),
    )
  }
  return items
}

export async function applyGmailPriority(accessToken: string, id: string, starred: boolean, refreshToken?: string) {
  const client = oauthClient()
  if (!client) return
  client.setCredentials({ access_token: accessToken, refresh_token: refreshToken })
  const gmail = google.gmail({ version: 'v1', auth: client })
  await gmail.users.messages.modify({
    userId: 'me',
    id,
    requestBody: starred
      ? { addLabelIds: ['STARRED', 'IMPORTANT'] }
      : { removeLabelIds: ['STARRED'] },
  })
}
