import type { Label, MailItem } from './types'

export type TrayFilter = 'all' | Label

export function filterTray(items: MailItem[], query: string, filter: TrayFilter): MailItem[] {
  const needle = query.trim().toLowerCase()
  return items.filter((item) => {
    if (filter !== 'all' && item.label !== filter) return false
    if (!needle) return true
    const hay = `${item.from} ${item.subject} ${item.snippet} ${item.body}`.toLowerCase()
    return hay.includes(needle)
  })
}

export function countByLabel(items: MailItem[]): Record<TrayFilter, number> {
  return {
    all: items.length,
    urgent: items.filter((item) => item.label === 'urgent').length,
    commercial: items.filter((item) => item.label === 'commercial').length,
    spam: items.filter((item) => item.label === 'spam').length,
    general: items.filter((item) => item.label === 'general').length,
  }
}
