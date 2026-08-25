import assert from 'node:assert/strict'
import { test } from 'node:test'
import { classifyMail } from '../src/lib/classify'
import { draftReply } from '../src/lib/draft'
import { demoMail, runLocalAgent } from '../src/lib/demo-mail'
import { countByLabel, filterTray } from '../src/lib/filter'
import { filledKey } from '../src/lib/keys'
import { priorityFor, starFor } from '../src/lib/priority'
import { parseTheme } from '../src/lib/theme'
import { formatWhen } from '../src/lib/when'

test('spam prize mail is classified as spam', () => {
  assert.equal(classifyMail('Congratulations you won', 'crypto giveaway click here now'), 'spam')
})

test('same-day meeting is urgent', () => {
  assert.equal(classifyMail('Reunião às 16h', 'preciso de confirmação urgente hoje'), 'urgent')
})

test('pricing proposal is commercial', () => {
  assert.equal(classifyMail('Proposta comercial', 'Segue o pricing e o orçamento'), 'commercial')
})

test('priority follows the stamp', () => {
  assert.equal(priorityFor('spam', 'x', 'y'), 'low')
  assert.equal(priorityFor('urgent', 'x', 'y'), 'high')
  assert.equal(starFor('high'), true)
  assert.equal(starFor('low'), false)
})

test('local agent returns a draft in the asked tone', () => {
  const mail = demoMail[1]
  const formal = runLocalAgent(mail, 'formal', 'en')
  const brief = runLocalAgent(mail, 'brief', 'pt')
  assert.equal(formal.label, 'commercial')
  assert.match(formal.draft, /Kind regards/)
  assert.match(brief.draft, /Olá/)
  assert.match(draftReply(mail, 'firm', 'en'), /look forward/)
})

test('filledKey rejects empty secrets', () => {
  assert.equal(filledKey(''), false)
  assert.equal(filledKey('short'), false)
  assert.equal(filledKey('long-enough-secret'), true)
})

test('theme defaults to dark', () => {
  assert.equal(parseTheme(null), 'dark')
  assert.equal(parseTheme('light'), 'light')
  assert.equal(parseTheme('nope'), 'dark')
})

test('tray filter and search keep the matching mail', () => {
  const onlySpam = filterTray(demoMail, '', 'spam')
  assert.equal(onlySpam.length, 1)
  assert.equal(onlySpam[0].id, 'demo-3')
  const search = filterTray(demoMail, 'ensaio', 'all')
  assert.equal(search[0].id, 'demo-4')
  assert.equal(countByLabel(demoMail).urgent, 2)
})

test('relative time uses locale', () => {
  const now = Date.parse('2026-08-25T08:11:00.000Z')
  assert.equal(formatWhen('2026-08-25T08:10:00.000Z', 'pt', now), 'há 1 min')
  assert.equal(formatWhen('2026-08-25T08:10:00.000Z', 'en', now), '1m ago')
})
