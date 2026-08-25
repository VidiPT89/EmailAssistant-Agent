import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE = 'selo-session'

export type Session = {
  accessToken?: string
  refreshToken?: string
}

function secret(): string {
  return process.env.SESSION_SECRET?.trim() || 'dev-only-session-secret-change-me'
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export async function readSession(): Promise<Session> {
  const raw = (await cookies()).get(COOKIE)?.value
  if (!raw) return {}
  const [payload, mac] = raw.split('.')
  if (!payload || !mac) return {}
  const expected = sign(payload)
  const a = Buffer.from(mac)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return {}
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Session
  } catch {
    return {}
  }
}

export async function writeSession(session: Session): Promise<void> {
  const payload = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url')
  const value = `${payload}.${sign(payload)}`
  ;(await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearSession(): Promise<void> {
  ;(await cookies()).delete(COOKIE)
}
