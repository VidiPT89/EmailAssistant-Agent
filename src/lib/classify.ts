import type { Label } from './types'

const SPAM = [
  'winner',
  'lottery',
  'viagra',
  'crypto giveaway',
  'nigerian',
  'click here now',
  'unsubscribe all',
  'congratulations you won',
  'premio',
  'ganhou',
  'oferta exclusiva só hoje',
]

const URGENT = [
  'asap',
  'urgent',
  'urgente',
  'immediately',
  'hoje',
  'today',
  'deadline',
  'overdue',
  'action required',
  'invoice unpaid',
  'pagamento em atraso',
  'meeting in',
  'reunião às',
]

const COMMERCIAL = [
  'pricing',
  'preço',
  'quote',
  'orçamento',
  'partnership',
  'parceria',
  'newsletter',
  'promo',
  'desconto',
  'subscription',
  'trial',
  'invoice',
  'fatura',
  'proposta',
  'proposal',
]

function hits(text: string, words: string[]): number {
  return words.reduce((n, word) => n + (text.includes(word) ? 1 : 0), 0)
}

export function classifyMail(subject: string, body: string, from = ''): Label {
  const text = `${subject} ${body} ${from}`.toLowerCase()
  if (hits(text, SPAM) >= 1 && hits(text, URGENT) === 0) return 'spam'
  if (hits(text, URGENT) >= 1) return 'urgent'
  if (hits(text, COMMERCIAL) >= 1) return 'commercial'
  return 'general'
}
