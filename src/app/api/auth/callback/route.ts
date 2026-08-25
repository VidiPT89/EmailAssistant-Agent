import { NextResponse } from 'next/server'
import { exchangeCode } from '@/lib/gmail'
import { writeSession } from '@/lib/session'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const origin = url.origin
  if (!code) return NextResponse.redirect(`${origin}/inbox`)
  const tokens = await exchangeCode(code)
  await writeSession({
    accessToken: tokens.access_token ?? undefined,
    refreshToken: tokens.refresh_token ?? undefined,
  })
  return NextResponse.redirect(`${origin}/inbox`)
}
