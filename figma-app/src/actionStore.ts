import { AKCIJE, type Akcija } from './data'

export const ACTIONS_KEY = 'portal-figma-actions-v1'

export function loadActions(): Akcija[] {
  try {
    const stored = JSON.parse(localStorage.getItem(ACTIONS_KEY) || 'null')
    return Array.isArray(stored) ? stored : [...AKCIJE]
  } catch {
    return [...AKCIJE]
  }
}

export function saveActions(actions: Akcija[]) {
  localStorage.setItem(ACTIONS_KEY, JSON.stringify(actions))
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
}
