import type { Locale, MailItem, Tone } from './types'

const closings: Record<Locale, Record<Tone, string>> = {
  pt: {
    formal: 'Com os melhores cumprimentos,\nDavid',
    warm: 'Um abraço,\nDavid',
    brief: 'Obrigado,\nDavid',
    firm: 'Fico a aguardar,\nDavid',
  },
  en: {
    formal: 'Kind regards,\nDavid',
    warm: 'All the best,\nDavid',
    brief: 'Thanks,\nDavid',
    firm: 'I look forward to your reply,\nDavid',
  },
}

export function draftReply(mail: MailItem, tone: Tone, locale: Locale): string {
  const who = mail.from.split('<')[0]?.trim() || mail.from
  const greeting =
    locale === 'pt'
      ? tone === 'brief'
        ? `Olá ${who},`
        : `Olá ${who},\n`
      : tone === 'brief'
        ? `Hi ${who},`
        : `Hi ${who},\n`

  const body = bodyFor(mail, tone, locale)
  return `${greeting}\n${body}\n\n${closings[locale][tone]}`.trim()
}

function bodyFor(mail: MailItem, tone: Tone, locale: Locale): string {
  if (mail.label === 'spam') {
    return locale === 'pt'
      ? 'Não vou responder a esta mensagem. Marquei-a como spam.'
      : 'I will not reply to this message. I marked it as spam.'
  }

  const about = mail.subject.replace(/^re:\s*/i, '')
  if (tone === 'brief') {
    return locale === 'pt'
      ? `Recebi a tua nota sobre «${about}». Confirmo e avanço.`
      : `Got your note about “${about}”. Confirmed, I will move ahead.`
  }
  if (tone === 'firm') {
    return locale === 'pt'
      ? `Recebi a mensagem sobre «${about}». Preciso de uma resposta clara até amanhã para não atrasar o resto.`
      : `I received your message about “${about}”. I need a clear answer by tomorrow so the rest does not slip.`
  }
  if (tone === 'warm') {
    return locale === 'pt'
      ? `Obrigado pela mensagem sobre «${about}». Li com atenção e respondo em baixo ao que pediste.`
      : `Thanks for writing about “${about}”. I read it carefully and I am answering what you asked.`
  }
  return locale === 'pt'
    ? `Agradeço o contacto relativamente a «${about}». Analisei o pedido e fico disponível para os próximos passos.`
    : `Thank you for writing regarding “${about}”. I reviewed the request and I am available for the next steps.`
}
