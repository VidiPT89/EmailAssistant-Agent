export function formatWhen(iso: string, locale: 'pt' | 'en', now = Date.now()): string {
  const then = Date.parse(iso)
  if (Number.isNaN(then)) return iso
  const diff = Math.max(0, now - then)
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return locale === 'pt' ? 'agora' : 'now'
  if (minutes < 60) return locale === 'pt' ? `há ${minutes} min` : `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return locale === 'pt' ? `há ${hours} h` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return locale === 'pt' ? `há ${days} d` : `${days}d ago`
  return new Intl.DateTimeFormat(locale === 'pt' ? 'pt-PT' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(then)
}
