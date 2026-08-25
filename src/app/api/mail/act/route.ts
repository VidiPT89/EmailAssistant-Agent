import { NextResponse } from 'next/server'
import { runAgent, runLocalAgent } from '@/lib/agent'
import { applyGmailPriority } from '@/lib/gmail'
import { readSession } from '@/lib/session'
import type { Locale, MailItem, Tone } from '@/lib/types'

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action?: 'classify' | 'draft' | 'priority'
    tone?: Tone
    locale?: Locale
    mail?: MailItem
  }
  if (!body.mail || !body.action) {
    return NextResponse.json({ error: 'missing mail' }, { status: 400 })
  }
  const tone: Tone = body.tone ?? 'formal'
  const locale: Locale = body.locale === 'en' ? 'en' : 'pt'
  const result =
    body.action === 'priority'
      ? runLocalAgent(body.mail, tone, locale)
      : await runAgent(body.mail, tone, locale)

  const mail: MailItem = {
    ...body.mail,
    label: result.label,
    priority: result.priority,
    starred: result.starred,
  }

  if (body.action === 'priority') {
    const session = await readSession()
    if (session.accessToken) {
      try {
        await applyGmailPriority(session.accessToken, mail.id, mail.starred, session.refreshToken)
      } catch {
        /* demo tray still updates locally */
      }
    }
  }

  return NextResponse.json({
    mail,
    draft: body.action === 'draft' || body.action === 'classify' ? result.draft : undefined,
  })
}
