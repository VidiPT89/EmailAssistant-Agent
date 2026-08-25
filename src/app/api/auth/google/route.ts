import { NextResponse } from 'next/server'
import { authUrl } from '@/lib/gmail'

export async function GET() {
  const url = authUrl()
  if (!url) {
    return NextResponse.redirect(new URL('/inbox', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
  }
  return NextResponse.redirect(url)
}
