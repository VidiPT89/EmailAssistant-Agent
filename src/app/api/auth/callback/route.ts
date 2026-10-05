import { NextResponse } from 'next/server'
import { exchangeCode } from '@/lib/gmail'
import { writeSession } from '@/lib/session'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  const inbox = new URL('/inbox', origin)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  if (error || !code) {
    inbox.searchParams.set('gmail', 'denied')
    return NextResponse.redirect(inbox)
  }
  try {
    const tokens = await exchangeCode(code)
    if (!tokens.access_token) {
      inbox.searchParams.set('gmail', 'fail')
      return NextResponse.redirect(inbox)
    }
    await writeSession({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? undefined,
    })
    inbox.searchParams.set('gmail', 'ok')
    return NextResponse.redirect(inbox)
  } catch {
    inbox.searchParams.set('gmail', 'fail')
    return NextResponse.redirect(inbox)
  }
}
