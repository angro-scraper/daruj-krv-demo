import type { Role, Screen } from './data'

export const ROUTE_BY_SCREEN: Record<Screen, string> = {
  kontrolni_centar: 'dashboard', akcije: 'events', prijem_davalaca: 'checkin',
  medicinska_sluzba: 'medical', kampanje: 'campaigns', studio: 'content',
  odobravanje: 'approvals', izvestaji: 'reports', osoblje: 'staff',
  pristup_uredjaji: 'qr-access', hijerarhija_audit: 'hierarchy',
  api_integracije: 'integrations', moja_smena: 'my-shift',
  klinicki_sto: 'clinical-desk', redakcija: 'editorial',
  audit_log: 'audit', tech_config: 'tech-config', incidenti: 'incidents',
  raspored: 'schedule',
}

const SCREEN_BY_ROUTE: Record<string, Screen> = Object.fromEntries(
  Object.entries(ROUTE_BY_SCREEN).map(([screen, route]) => [route, screen as Screen]),
)

const LEGACY_ALIASES: Record<string, Screen> = {
  command: 'kontrolni_centar', operations: 'prijem_davalaca',
  donors: 'prijem_davalaca', organization: 'osoblje',
  access: 'pristup_uredjaji', governance: 'hijerarhija_audit',
  communications: 'studio', quality: 'studio',
  'campaign-builder': 'kampanje', 'campaign-detail': 'kampanje',
  'content-editor': 'studio', 'content-library': 'studio',
  'content-calendar': 'studio', 'content-analytics': 'studio',
}

export function screenFromHash(): Screen | null {
  const route = decodeURIComponent(window.location.hash.replace(/^#\/?portal\/?/, ''))
  return SCREEN_BY_ROUTE[route] ?? LEGACY_ALIASES[route] ?? null
}

export function setScreenHash(screen: Screen) {
  const next = `#portal/${ROUTE_BY_SCREEN[screen]}`
  if (window.location.hash !== next) window.location.hash = next
}

export const ALLOWED_SCREENS: Record<Role, Screen[]> = {
  super_admin: Object.keys(ROUTE_BY_SCREEN) as Screen[],
  admin: ['kontrolni_centar', 'izvestaji', 'audit_log', 'api_integracije', 'tech_config', 'incidenti'],
  koordinator: ['kontrolni_centar', 'akcije', 'raspored', 'kampanje', 'prijem_davalaca'],
  prijem: ['moja_smena', 'prijem_davalaca'],
  medicinska: ['klinicki_sto', 'medicinska_sluzba'],
  pr_sadrzaj: ['redakcija', 'studio', 'kampanje', 'izvestaji'],
  revizor: ['audit_log', 'izvestaji'],
}

export function canOpen(role: Role, screen: Screen) {
  return ALLOWED_SCREENS[role].includes(screen)
}
