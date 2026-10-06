import type { Akcija } from './data'

const baseUrl = (import.meta.env.VITE_DEMO_API_URL || '').replace(/\/$/, '')
const accessCode = import.meta.env.VITE_DEMO_ACCESS_CODE || ''
export const connectedDemoEnabled = Boolean(baseUrl)

export type DemoAction = { id: string; title: string; date: string; startTime: string; endTime: string; venue: string; city: string; capacity: number; status: 'planned' | 'published' | 'completed' | 'cancelled'; reservationRequired: boolean; slots: string[]; receptionCode?: string }
export type DemoReservation = { id: string; personaId: string; actionId: string; time: string; code: string; status: 'reserved' | 'checked_in' | 'no_show' }
export type DemoSummary = { actions: DemoAction[]; counts: { action_id: string; status: string; total: string }[] }
export type DemoNews = { id: string; title: string; author: string; category: string; content: string; imageId: string | null; imageUrl: string | null; status: 'nacrt' | 'recenzija' | 'odobreno' | 'objavljeno' | 'arhivirano'; version: number; createdAt: string; updatedAt: string; publishedAt: string | null }
export type DemoNewsInput = { title: string; author: string; category: string; content: string; imageId: string | null }
export function demoMediaUrl(path: string | null) { return path ? `${baseUrl}${path}` : null }

export type DemoServiceHealth = {
  status: 'ok'
  mode: 'synthetic-only'
  database: 'connected'
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { 'Content-Type': 'application/json', 'X-Demo-Access': accessCode, ...init.headers } })
  const body = await response.json()
  if (!response.ok) throw new Error(body?.error?.message || 'Demo servis nije dostupan.')
  return body.data as T
}

const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec']
export function toPortalAction(action: DemoAction, counts: DemoSummary['counts'] = []): Akcija {
  const [year, month, day] = action.date.split('-').map(Number)
  return { id: action.id, naziv: action.title, datum: `${day}. ${months[month - 1]} ${year}`, lokacija: action.venue, mesto: action.city,
    status: ({ planned: 'planirana', published: 'aktivna', completed: 'zavrsena', cancelled: 'otkazana' } as const)[action.status],
    kapacitet: action.capacity, prijavljeni: counts.filter(item => item.action_id === action.id && ['reserved', 'checked_in'].includes(item.status)).reduce((sum, item) => sum + Number(item.total), 0),
    donacije: 0, koordinator: 'Demo koordinator', filijala: action.city, startTime: action.startTime, endTime: action.endTime, receptionCode: action.receptionCode }
}

export async function getDemoSummary() { return call<DemoSummary>('/v1/portal/summary') }
export async function checkDemoServiceConnection() {
  if (!baseUrl) throw new Error('Adresa zajedničkog demo servisa nije podešena.')

  const healthResponse = await fetch(`${baseUrl}/health`, { cache: 'no-store' })
  const healthBody = await healthResponse.json().catch(() => null) as DemoServiceHealth | null
  if (!healthResponse.ok || healthBody?.status !== 'ok' || healthBody.database !== 'connected') {
    throw new Error(`Servis nije spreman (HTTP ${healthResponse.status}).`)
  }

  const summary = await getDemoSummary()
  return { health: healthBody, actionCount: summary.actions.length }
}
export async function getDemoActions() {
  const summary = await getDemoSummary()
  return summary.actions.map(action => toPortalAction(action, summary.counts))
}
export async function createDemoAction(input: { title: string; date: string; startTime: string; endTime: string; venue: string; city: string; capacity: number }) {
  return call<DemoAction>('/v1/actions', { method: 'POST', body: JSON.stringify(input) })
}
export async function editDemoAction(id: string, input: { title: string; date: string; startTime: string; endTime: string; venue: string; city: string; capacity: number }) {
  return call<DemoAction>(`/v1/actions/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) })
}
export async function setDemoActionStatus(id: string, status: DemoAction['status']) {
  return call<DemoAction>(`/v1/actions/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) })
}
export async function getDemoReception() { return call<DemoReservation[]>('/v1/reception/reservations') }
export async function updateDemoReception(code: string, operation: 'check-in' | 'no-show') {
  return call<DemoReservation>(`/v1/reception/reservations/${encodeURIComponent(code)}/${operation}`, { method: 'POST' })
}
export async function getDemoNews() { return call<DemoNews[]>('/v1/news?scope=all') }
export async function createDemoNews(input: DemoNewsInput) { return call<DemoNews>('/v1/news', { method: 'POST', body: JSON.stringify(input) }) }
export async function updateDemoNews(id: string, input: DemoNewsInput) { return call<DemoNews>(`/v1/news/${id}`, { method: 'PATCH', body: JSON.stringify(input) }) }
export async function setDemoNewsStatus(id: string, status: DemoNews['status']) { return call<DemoNews>(`/v1/news/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }) }
export async function uploadDemoImage(file: File) {
  const response = await fetch(`${baseUrl}/v1/media`, { method: 'POST', headers: { 'Content-Type': file.type, 'X-Demo-Access': accessCode }, body: file })
  const result = await response.json()
  if (!response.ok) throw new Error(result?.error?.message || 'Slika nije sačuvana.')
  return result.data as { id: string; url: string }
}
