import { classifyMail } from './classify'
import { draftReply } from './draft'
import { priorityFor, starFor } from './priority'
import type { Label, Locale, MailItem, Priority, Tone } from './types'

export const demoMail: MailItem[] = [
  {
    id: 'demo-1',
    from: 'Ana Costa <ana@estudio.pt>',
    subject: 'Reunião às 16h: preciso de confirmação urgente',
    snippet: 'Consegues estar hoje às 16h? O cliente entra na call.',
    body: 'Olá David, consegues estar hoje às 16h? O cliente entra na call e preciso de confirmação urgente.',
    date: '2026-08-25T08:10:00.000Z',
    label: 'urgent',
    priority: 'high',
    starred: true,
  },
  {
    id: 'demo-2',
    from: 'Lumen Studio <hello@lumen.studio>',
    subject: 'Proposta comercial e orçamento do site',
    snippet: 'Segue o pricing da landing e o prazo de entrega.',
    body: 'Segue a proposta comercial, o pricing da landing e o prazo de entrega. Podemos fechar esta semana?',
    date: '2026-08-24T15:40:00.000Z',
    label: 'commercial',
    priority: 'medium',
    starred: false,
  },
  {
    id: 'demo-3',
    from: 'Prize Desk <winner@not-a-bank.test>',
    subject: 'Congratulations you won a crypto giveaway',
    snippet: 'Click here now to claim your prize.',
    body: 'Congratulations you won a crypto giveaway. Click here now to claim. Unsubscribe all.',
    date: '2026-08-24T11:02:00.000Z',
    label: 'spam',
    priority: 'low',
    starred: false,
  },
  {
    id: 'demo-4',
    from: 'Miguel Santos <miguel@atelier.pt>',
    subject: 'Fotos do ensaio de sábado',
    snippet: 'Envio as pastas do ensaio quando as tiver prontas.',
    body: 'David, envio as pastas do ensaio de sábado quando as tiver prontas. Diz-me se queres JPEG ou TIFF.',
    date: '2026-08-23T19:18:00.000Z',
    label: 'general',
    priority: 'medium',
    starred: false,
  },
  {
    id: 'demo-5',
    from: 'Célia Finance <billing@vidi-clients.test>',
    subject: 'Fatura em atraso: action required',
    snippet: 'A invoice #441 está overdue.',
    body: 'A invoice #441 está overdue. Action required: pagamento em atraso até hoje.',
    date: '2026-08-23T09:00:00.000Z',
    label: 'urgent',
    priority: 'high',
    starred: true,
  },
]

export function decorate(item: Omit<MailItem, 'label' | 'priority' | 'starred'>): MailItem {
  const label = classifyMail(item.subject, item.body, item.from)
  const priority = priorityFor(label, item.subject, item.body)
  return { ...item, label, priority, starred: starFor(priority) }
}

export type AgentAction = {
  label: Label
  priority: Priority
  starred: boolean
  draft: string
}

export function runLocalAgent(mail: MailItem, tone: Tone, locale: Locale): AgentAction {
  const label = classifyMail(mail.subject, mail.body, mail.from)
  const priority = priorityFor(label, mail.subject, mail.body)
  const next: MailItem = { ...mail, label, priority, starred: starFor(priority) }
  return {
    label,
    priority,
    starred: next.starred,
    draft: draftReply(next, tone, locale),
  }
}
