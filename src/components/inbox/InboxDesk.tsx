'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import type { Dictionary } from '@/i18n/dictionaries'
import { countByLabel, filterTray, type TrayFilter } from '@/lib/filter'
import type { Label, MailItem, Priority, Tone } from '@/lib/types'
import { TONES } from '@/lib/types'
import { useQueryFlag, useStoredChoice } from '@/lib/stored-choice'
import { formatWhen } from '@/lib/when'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'

type Payload = {
  items: MailItem[]
  demo: boolean
  oauthReady: boolean
  connected: boolean
  liveModel: boolean
}

const FILTERS: TrayFilter[] = ['all', 'urgent', 'commercial', 'spam', 'general']

function stamp(t: Dictionary, label: Label) {
  return t[label]
}

function prio(t: Dictionary, priority: Priority) {
  return t[priority]
}

async function fetchMail(): Promise<Payload> {
  const res = await fetch('/api/mail')
  return (await res.json()) as Payload
}

export function InboxDesk() {
  const { t, locale } = useLocale()
  const [data, setData] = useState<Payload | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [tone, setTone] = useStoredChoice<Tone>('selo-tone', TONES, 'formal')
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<TrayFilter>('all')

  const gmailFlag = useQueryFlag('gmail')
  const gmailNote = gmailFlag === 'denied' ? t.gmailDenied : gmailFlag === 'fail' ? t.gmailFail : ''

  const apply = useCallback((json: Payload) => {
    setData(json)
    setSelected((prev) => prev ?? json.items[0]?.id ?? null)
  }, [])

  useEffect(() => {
    let ignore = false
    fetchMail()
      .then((json) => {
        if (!ignore) apply(json)
      })
      .catch(() => {
        /* offline: the tray stays empty */
      })
    return () => {
      ignore = true
    }
  }, [apply])

  const hint = data?.connected ? t.connectedHint : data?.oauthReady ? t.oauthReadyHint : t.oauthHint


  const counts = useMemo(() => countByLabel(data?.items ?? []), [data])
  const visible = useMemo(
    () => filterTray(data?.items ?? [], query, filter),
    [data, query, filter],
  )
  const mail = useMemo(
    () => data?.items.find((item) => item.id === selected) ?? visible[0] ?? null,
    [data, selected, visible],
  )

  async function act(action: 'classify' | 'draft' | 'priority') {
    if (!mail) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/mail/act', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: mail.id, action, tone, locale, mail }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'fail')
      if (json.draft) setDraft(json.draft)
      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          items: prev.items.map((item) => (item.id === mail.id ? { ...item, ...json.mail } : item)),
        }
      })
    } catch {
      setError(t.error)
    } finally {
      setBusy(false)
    }
  }

  async function copyDraft() {
    if (!draft) return
    await navigator.clipboard.writeText(draft)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display amber text-4xl tracking-[-0.03em]">{t.inbox}</h1>
          <p className="muted mt-2 max-w-2xl text-sm">{hint}</p>
          {gmailNote ? <p className="amber mt-2 max-w-2xl text-sm">{gmailNote}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="stamp">{data?.connected ? t.liveMode : t.demoMode}</span>
          <span className="stamp">{data?.liveModel ? t.liveModel : t.localTools}</span>
          {data?.oauthReady && !data.connected ? (
            <a href="/api/auth/google" className="btn">
              {t.connect}
            </a>
          ) : null}
          {data?.connected ? (
            <a href="/api/auth/logout" className="btn-ghost">
              {t.disconnect}
            </a>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            className={filter === item ? 'btn' : 'btn-ghost'}
            onClick={() => setFilter(item)}
          >
            {t[item]} {counts[item]}
          </button>
        ))}
        <input
          className="field max-w-xs"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.search}
          aria-label={t.search}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="sheet p-3">
          {!data ? (
            <p className="muted p-4">{t.working}</p>
          ) : !visible.length ? (
            <p className="muted p-4">{data.items.length ? t.noMatch : t.noMail}</p>
          ) : (
            visible.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`row ${item.id === mail?.id ? 'active' : ''}`}
                onClick={() => {
                  setSelected(item.id)
                  setDraft('')
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{item.from.split('<')[0]}</p>
                  <span className={`stamp ${item.label}`}>{stamp(t, item.label)}</span>
                </div>
                <p className="amber mt-1 text-sm">{item.subject}</p>
                <p className="muted mt-1 line-clamp-2 text-sm">{item.snippet}</p>
                <p className="faint mt-2 text-xs">
                  {formatWhen(item.date, locale)}
                  {item.starred ? ` · ${t.starred}` : ''}
                </p>
              </button>
            ))
          )}
        </section>

        <section className="sheet min-h-[28rem] p-6">
          <AnimatePresence mode="wait">
            {mail ? (
              <motion.div
                key={mail.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              >
                <p className="faint text-xs uppercase tracking-[0.18em]">{t.from}</p>
                <p className="mt-1">{mail.from}</p>
                <p className="faint mt-4 text-xs uppercase tracking-[0.18em]">{t.subject}</p>
                <h2 className="display amber mt-1 text-3xl">{mail.subject}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`stamp ${mail.label}`}>{stamp(t, mail.label)}</span>
                  <span className="stamp">
                    {t.priority}: {prio(t, mail.priority)}
                  </span>
                  <span className="faint text-xs self-center">{formatWhen(mail.date, locale)}</span>
                </div>
                <div className="filament my-5" />
                <p className="whitespace-pre-wrap leading-relaxed">{mail.body}</p>

                <div className="actions mt-6">
                  <label className="tone">
                    <span>{t.tone}</span>
                    <select
                      className="field cursor-pointer"
                      value={tone}
                      onChange={(event) => setTone(event.target.value as Tone)}
                    >
                      {TONES.map((item) => (
                        <option key={item} value={item}>
                          {t[item]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="button" className="btn-ghost" disabled={busy} onClick={() => void act('classify')}>
                    {t.classify}
                  </button>
                  <button type="button" className="btn" disabled={busy} onClick={() => void act('draft')}>
                    {busy ? t.working : t.draft}
                  </button>
                  <button type="button" className="btn-ghost" disabled={busy} onClick={() => void act('priority')}>
                    {t.apply}
                  </button>
                </div>
                {error ? <p className="amber mt-3 text-sm">{error}</p> : null}
                {draft ? (
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <p className="faint text-xs uppercase tracking-[0.18em]">{t.reply}</p>
                      <button type="button" className="btn-ghost" onClick={() => void copyDraft()}>
                        {copied ? t.copied : t.copy}
                      </button>
                    </div>
                    <textarea className="field mt-2 min-h-40" value={draft} onChange={(event) => setDraft(event.target.value)} />
                  </div>
                ) : null}
              </motion.div>
            ) : (
              <p className="muted">{t.empty}</p>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  )
}
