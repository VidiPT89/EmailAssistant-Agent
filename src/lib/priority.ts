import type { Label, Priority } from './types'

export function priorityFor(label: Label, subject: string, body: string): Priority {
  const text = `${subject} ${body}`.toLowerCase()
  if (label === 'spam') return 'low'
  if (label === 'urgent') return 'high'
  if (label === 'commercial' && /(invoice|fatura|overdue|atraso)/.test(text)) return 'high'
  if (label === 'commercial') return 'medium'
  return 'medium'
}

export function starFor(priority: Priority): boolean {
  return priority === 'high'
}
