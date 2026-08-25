import { NextResponse } from 'next/server'
import { demoMail } from '@/lib/demo-mail'
import { listGmail } from '@/lib/gmail'
import { hasGoogleOAuth, hasLiveModel } from '@/lib/keys'
import { readSession } from '@/lib/session'

export async function GET() {
  const session = await readSession()
  const connected = Boolean(session.accessToken)
  let items = demoMail
  if (connected && session.accessToken) {
    try {
      items = await listGmail(session.accessToken, session.refreshToken)
    } catch {
      items = demoMail
    }
  }
  return NextResponse.json({
    items,
    demo: !connected,
    oauthReady: hasGoogleOAuth(),
    connected,
    liveModel: hasLiveModel(),
  })
}
