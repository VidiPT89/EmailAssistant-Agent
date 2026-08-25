import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { groq } from '@ai-sdk/groq'
import { openai } from '@ai-sdk/openai'
import { generateText, stepCountIs, tool } from 'ai'
import { z } from 'zod'
import { classifyMail } from './classify'
import { draftReply } from './draft'
import { filledKey, hasLiveModel } from './keys'
import { priorityFor, starFor } from './priority'
import { runLocalAgent } from './demo-mail'
import type { Label, Locale, MailItem, Priority, Tone } from './types'

export { runLocalAgent }

function chatModel() {
  if (filledKey(process.env.GROQ_API_KEY)) {
    return groq(process.env.AI_MODEL?.trim() || 'llama-3.1-8b-instant')
  }
  if (filledKey(process.env.GOOGLE_GENERATIVE_AI_API_KEY)) {
    return google(process.env.AI_MODEL?.trim() || 'gemini-2.0-flash')
  }
  if (filledKey(process.env.OPENAI_API_KEY)) {
    const id = process.env.AI_MODEL?.trim()
    return openai(id && !id.startsWith('claude') ? id : 'gpt-4o-mini')
  }
  if (filledKey(process.env.ANTHROPIC_API_KEY)) {
    const id = process.env.AI_MODEL?.trim()
    return anthropic(id && id.startsWith('claude') ? id : 'claude-3-5-haiku-latest')
  }
  return null
}

export async function runAgent(mail: MailItem, tone: Tone, locale: Locale) {
  const model = chatModel()
  if (!model || !hasLiveModel()) return runLocalAgent(mail, tone, locale)

  let label: Label = mail.label
  let priority: Priority = mail.priority
  let draft = ''

  await generateText({
    model,
    stopWhen: stepCountIs(6),
    system:
      'You classify one email and draft a reply. Always call the tools. Never invent facts that are not in the email.',
    prompt: `Locale: ${locale}\nTone: ${tone}\nFrom: ${mail.from}\nSubject: ${mail.subject}\nBody:\n${mail.body}`,
    tools: {
      classify_email: tool({
        description: 'Classify the email as urgent, commercial, spam or general.',
        inputSchema: z.object({
          label: z.enum(['urgent', 'commercial', 'spam', 'general']),
        }),
        execute: async ({ label: next }) => {
          label = next
          priority = priorityFor(label, mail.subject, mail.body)
          return { label, priority }
        },
      }),
      set_priority: tool({
        description: 'Set inbox priority after classification.',
        inputSchema: z.object({
          priority: z.enum(['high', 'medium', 'low']),
        }),
        execute: async ({ priority: next }) => {
          priority = next
          return { priority, starred: starFor(priority) }
        },
      }),
      draft_reply: tool({
        description: 'Write the reply in the requested tone and locale.',
        inputSchema: z.object({
          text: z.string().min(8),
        }),
        execute: async ({ text }) => {
          draft = text.trim()
          return { ok: true }
        },
      }),
    },
  })

  if (!draft) {
    const fallback = runLocalAgent({ ...mail, label, priority, starred: starFor(priority) }, tone, locale)
    draft = fallback.draft
    label = fallback.label
    priority = fallback.priority
  }

  if (label === mail.label && label === 'general') {
    label = classifyMail(mail.subject, mail.body, mail.from)
    priority = priorityFor(label, mail.subject, mail.body)
  }

  return { label, priority, starred: starFor(priority), draft: draft || draftReply(mail, tone, locale) }
}
