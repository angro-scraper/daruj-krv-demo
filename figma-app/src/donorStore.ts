import { DAVALACI, type Davalac } from './data'

const KEY = 'portal-figma-donors-v1'

export function loadDonors(): Davalac[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? parsed : DAVALACI
  } catch {
    return DAVALACI
  }
}

export function saveDonors(donors: Davalac[]): void {
  localStorage.setItem(KEY, JSON.stringify(donors))
  window.dispatchEvent(new Event('portal-donors-updated'))
}
