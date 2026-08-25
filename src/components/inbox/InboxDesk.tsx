'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import type { Dictionary } from '@/i18n/dictionaries'
import type { Label, MailItem, Priority, Tone } from '@/lib/types'
import { TONES } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'

type Payload = {
  items: MailItem[]
  demo: boolean
  oauthReady: boolean
  connected: boolean
  liveModel: boolean
}

function stamp(t: Dictionary, label: Label) {
  return t[label]
}

function prio(t: Dictionary, priority: Priority) {
  return t[priority]
}

export function InboxDesk() {
  const { t, locale } = useLocale()
  const [data, setData] = useState<Payload | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [tone, setTone] = useState<Tone>('formal')
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/mail')
    const json = (await res.json()) as Payload
    setData(json)
    setSelected((prev) => prev ?? json.items[0]?.id ?? null)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const mail = useMemo(
    () => data?.items.find((item) => item.id === selected) ?? null,
    [data, selected],
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
          <h1 className="display text-4xl tracking-[-0.03em] text-[#ffaa00]">{t.inbox}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#f4e6c8]/70">{t.oauthHint}</p>
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

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="sheet p-3">
          {!data?.items.length ? (
            <p className="p-4 text-[#f4e6c8]/60">{t.noMail}</p>
          ) : (
            data.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`row ${item.id === selected ? 'active' : ''}`}
                onClick={() => {
                  setSelected(item.id)
                  setDraft('')
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{item.from.split('<')[0]}</p>
                  <span className="stamp">{stamp(t, item.label)}</span>
                </div>
                <p className="mt-1 text-sm text-[#ffaa00]">{item.subject}</p>
                <p className="mt-1 line-clamp-2 text-sm text-[#f4e6c8]/65">{item.snippet}</p>
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
                <p className="text-xs uppercase tracking-[0.18em] text-[#f4e6c8]/50">{t.from}</p>
                <p className="mt-1">{mail.from}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#f4e6c8]/50">{t.subject}</p>
                <h2 className="display mt-1 text-3xl text-[#ffaa00]">{mail.subject}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="stamp">{stamp(t, mail.label)}</span>
                  <span className="stamp">
                    {t.priority}: {prio(t, mail.priority)}
                  </span>
                </div>
                <div className="filament my-5" />
                <p className="whitespace-pre-wrap leading-relaxed text-[#f4e6c8]/85">{mail.body}</p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <label className="text-sm">
                    {t.tone}
                    <select
                      className="field ml-2 w-auto cursor-pointer"
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
                {error ? <p className="mt-3 text-sm text-[#ffaa00]">{error}</p> : null}
                {draft ? (
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#f4e6c8]/50">{t.reply}</p>
                      <button type="button" className="btn-ghost" onClick={() => void copyDraft()}>
                        {copied ? t.copied : t.copy}
                      </button>
                    </div>
                    <textarea className="field mt-2 min-h-40" value={draft} onChange={(event) => setDraft(event.target.value)} />
                  </div>
                ) : null}
              </motion.div>
            ) : (
              <p className="text-[#f4e6c8]/60">{t.empty}</p>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  )
}
