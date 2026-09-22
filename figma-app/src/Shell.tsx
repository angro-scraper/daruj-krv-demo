import { type Korisnik, type Screen, ROLE_LABELS } from './data'
import { C } from './components/ui'
import { Ic } from './components/Icons'
import { ROUTE_BY_SCREEN } from './routes'

// ── Nav definition per role ────────────────────────────────────────────────
const NAV_SUPER_ADMIN = [
  { id: 'kontrolni_centar', label: 'Kontrolni centar', Icon: Ic.Dashboard },
  { id: 'akcije', label: 'Akcije', Icon: Ic.Akcije },
  { id: 'prijem_davalaca', label: 'Prijem davalaca', Icon: Ic.Prijem },
  { id: 'medicinska_sluzba', label: 'Medicinska služba', Icon: Ic.Medicinska },
  { id: 'kampanje', label: 'Kampanje', Icon: Ic.Kampanje },
  { id: 'studio', label: 'PR i sadržaj', Icon: Ic.Studio },
  { id: 'odobravanje', label: 'Red odobravanja', Icon: Ic.Odobravanje },
  { id: 'izvestaji', label: 'Izveštaji', Icon: Ic.Izvestaji },
  { id: 'osoblje', label: 'Osoblje', Icon: Ic.Osoblje },
  { id: 'pristup_uredjaji', label: 'Pristup i uređaji', Icon: Ic.Pristup },
  { id: 'hijerarhija_audit', label: 'Hijerarhija i audit', Icon: Ic.Hijerarhija },
  { id: 'api_integracije', label: 'API i integracije', Icon: Ic.API },
]

const NAV_ADMIN = [
  { id: 'kontrolni_centar', label: 'Kontrolna tabla', Icon: Ic.Dashboard },
  { id: 'izvestaji', label: 'Izveštaji', Icon: Ic.Izvestaji },
  { id: 'api_integracije', label: 'API i integracije', Icon: Ic.API },
  { id: 'audit_log', label: 'Audit log', Icon: Ic.AuditLog },
]

const NAV_KOORDINATOR = [
  { id: 'kontrolni_centar', label: 'Pregled', Icon: Ic.Dashboard },
  { id: 'akcije', label: 'Akcije', Icon: Ic.Akcije },
  { id: 'raspored', label: 'Raspored i smene', Icon: Ic.Raspored },
  { id: 'kampanje', label: 'Kampanje', Icon: Ic.Kampanje },
  { id: 'prijem_davalaca', label: 'Prijem', Icon: Ic.Prijem },
]

const NAV_PRIJEM = [
  { id: 'moja_smena', label: 'Moja smena', Icon: Ic.SmenaIcon },
  { id: 'prijem_davalaca', label: 'Prijem davalaca', Icon: Ic.Prijem },
]

const NAV_MEDICINSKA = [
  { id: 'klinicki_sto', label: 'Klinički radni sto', Icon: Ic.KlinickiSto },
  { id: 'medicinska_sluzba', label: 'Medicinska služba', Icon: Ic.Medicinska },
]

const NAV_PR = [
  { id: 'redakcija', label: 'Redakcija', Icon: Ic.Redakcija },
  { id: 'studio', label: 'Sadržaj i mediji', Icon: Ic.Studio },
  { id: 'kampanje', label: 'Kampanje', Icon: Ic.Kampanje },
  { id: 'izvestaji', label: 'Statistike', Icon: Ic.Izvestaji },
]

const NAV_REVIZOR = [
  { id: 'audit_log', label: 'Audit log', Icon: Ic.AuditLog },
  { id: 'izvestaji', label: 'Izveštaji', Icon: Ic.Izvestaji },
]

function getNav(uloga: string) {
  switch (uloga) {
    case 'super_admin': return NAV_SUPER_ADMIN
    case 'admin': return NAV_ADMIN
    case 'koordinator': return NAV_KOORDINATOR
    case 'prijem': return NAV_PRIJEM
    case 'medicinska': return NAV_MEDICINSKA
    case 'pr_sadrzaj': return NAV_PR
    case 'revizor': return NAV_REVIZOR
    default: return NAV_SUPER_ADMIN
  }
}

// ── Sidebar ────────────────────────────────────────────────────────────────
export function Sidebar({ screen, onNav, user, onLogout, collapsed, onToggle }: {
  screen: Screen; onNav: (s: Screen) => void; user: Korisnik
  onLogout: () => void; collapsed: boolean; onToggle: () => void
}) {
  const navItems = getNav(user.uloga)
  const isSA = user.uloga === 'super_admin'

  return (
    <aside className="flex flex-col h-full" style={{
      width: collapsed ? 64 : 240,
      minWidth: collapsed ? 64 : 240,
      background: C.navy,
      borderRight: `1px solid ${C.navy2}`,
      transition: 'width 0.25s ease, min-width 0.25s ease',
    }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: C.navy2, minHeight: 64 }}>
        <img src={`${import.meta.env.BASE_URL}kapi-zivota-logo.png`} alt="Kapi Života" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            <div className="text-white text-sm leading-tight whitespace-nowrap" style={{ fontFamily: 'DM Serif Display, Georgia, serif' }}>Portal Zavoda</div>
            <div className="text-xs whitespace-nowrap mt-0.5" style={{ color: C.teal3 }}>Transfuzija krvi</div>
          </div>
        )}
        <button onClick={onToggle} className="flex-shrink-0 opacity-40 hover:opacity-80 transition-opacity" style={{ color: '#fff' }}>
          {collapsed ? <Ic.ChevronRight /> : <Ic.X />}
        </button>
      </div>

      {/* Super Admin badge */}
      {!collapsed && isSA && (
        <div className="mx-3 mt-3 px-3 py-1.5 rounded-lg flex items-center gap-2" style={{ background: C.burgundy + '30', border: `1px solid ${C.burgundy}40` }}>
          <Ic.Shield />
          <span className="text-xs font-semibold" style={{ color: C.burgundy2 }}>SUPER ADMIN</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {navItems.map(({ id, label, Icon }) => {
          const active = screen === id
          return (
            <button key={id} onClick={() => onNav(id as Screen)}
              title={collapsed ? label : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm relative group"
              style={{
                background: active ? C.teal + '22' : 'transparent',
                color: active ? C.teal3 : C.ink3,
                borderLeft: `2px solid ${active ? C.teal : 'transparent'}`,
                transition: 'background 0.12s, color 0.12s, border-color 0.12s',
              }}>
              <span className="flex-shrink-0"><Icon /></span>
              {!collapsed && <span className="font-medium truncate">{label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity"
                  style={{ background: C.navy2, color: '#fff', boxShadow: '0 4px 12px #0004' }}>
                  {label}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Rola badge i user */}
      <div className="border-t p-3" style={{ borderColor: C.navy2 }}>
        {isSA && <a href={`/admin/operativno.html#portal/${ROUTE_BY_SCREEN[screen]}`} target="_blank" rel="noreferrer"
          title="Postojeći operativni alati" className="flex items-center gap-2 px-1 py-2 mb-2 text-xs rounded hover:bg-white/10"
          style={{ color: C.teal3 }}><Ic.Akcije />{!collapsed && 'Postojeći operativni alati'}</a>}
        {!collapsed && (
          <div className="mb-2 px-1">
            <span className="text-xs font-medium" style={{ color: C.ink3 }}>
              {ROLE_LABELS[user.uloga]} · {user.filijala}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: C.teal, color: '#fff' }}>
            {user.avatar}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-medium text-white truncate">{user.ime} {user.prezime}</div>
              <div className="text-xs truncate" style={{ color: C.ink3 }}>{user.email}</div>
            </div>
          )}
          <button onClick={onLogout} title="Odjavi se" className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity" style={{ color: '#fff' }}>
            <Ic.Logout />
          </button>
        </div>
      </div>
    </aside>
  )
}

// ── Top Bar ────────────────────────────────────────────────────────────────
export function TopBar({ title, subtitle, onMenuToggle, onAlerts }: { title: string; subtitle?: string; onMenuToggle: () => void; onAlerts?: () => void }) {
  return (
    <header className="flex items-center gap-4 px-6 bg-white border-b" style={{ borderColor: C.s100, minHeight: 64 }}>
      <button onClick={onMenuToggle} className="lg:hidden opacity-60 hover:opacity-100 transition-opacity" style={{ color: C.ink7 }}>
        <Ic.Menu />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-xl leading-none truncate" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: C.navy }}>{title}</div>
        {subtitle && <p className="text-xs mt-0.5 truncate" style={{ color: C.ink3 }}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-flex text-[10px] font-semibold tracking-wide rounded-md px-2 py-1" style={{ background: C.tealBg, color: C.teal2 }}>DEMO · bez stvarnih podataka</span>
        {onAlerts && <button onClick={onAlerts} title="Red odobravanja" className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-100 transition-colors" style={{ color: C.ink5 }}>
          <Ic.Bell />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full pulse-dot" style={{ background: C.burgundy }} />
        </button>}
        <div className="text-xs px-2 py-1 rounded" style={{ background: C.s100, color: C.ink5, fontFamily: 'JetBrains Mono, monospace' }}>
          {new Date().toLocaleString('sr-Latn-RS', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </header>
  )
}
