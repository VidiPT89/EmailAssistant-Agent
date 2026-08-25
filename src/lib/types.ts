export type Label = 'urgent' | 'commercial' | 'spam' | 'general'
export type Priority = 'high' | 'medium' | 'low'
export type Tone = 'formal' | 'warm' | 'brief' | 'firm'
export type Locale = 'pt' | 'en'

export type MailItem = {
  id: string
  from: string
  subject: string
  snippet: string
  body: string
  date: string
  label: Label
  priority: Priority
  starred: boolean
}

export const TONES: Tone[] = ['formal', 'warm', 'brief', 'firm']
