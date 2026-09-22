import { useEffect, useState } from 'react'
import { DEMO_NALOZI, type Korisnik, type Screen } from './data'
import { canOpen, screenFromHash, setScreenHash } from './routes'
import { C, PageWrap, Card, CardHeader } from './components/ui'
import { Ic } from './components/Icons'
import Prijava from './screens/Prijava'
import KontrolniCentar from './screens/KontrolniCentar'
import Akcije from './screens/Akcije'
import PrijemDavalaca from './screens/PrijemDavalaca'
import MedicinskaSluzbaStu from './screens/MedicinskaSluzbaStu'
import Kampanje from './screens/Kampanje'
import Studio from './screens/Studio'
import OdobravanjeScreen from './screens/Odobravanje'
import Izvestaji from './screens/Izvestaji'
import Osoblje from './screens/Osoblje'
import PristupUredjaji from './screens/PristupUredjaji'
import HijerarhijaAudit from './screens/HijerarhijaAudit'
import APIIntegracije from './screens/APIIntegracije'
import { Sidebar, TopBar } from './Shell'

// ── Stub screens za role-specific views ───────────────────────────────────
function MojaSmena() {
  return (
    <PageWrap>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader title="Moja smena — danas" subtitle="22. septembar 2026." />
          <div className="p-5 flex flex-col gap-3">
            {[
              { l: 'Akcija', v: 'NIS kampus — Novi Sad (AK-2026-090)' },
              { l: 'Vreme', v: '08:00 – 14:00' },
              { l: 'Lokacija', v: 'NIS kampus, Novi Sad' },
              { l: 'Koordinator', v: 'Ana Jović' },
              { l: 'Lekari na smeni', v: 'Dr. Milena Kovač, Dr. Zoran Lukić' },
              { l: 'Kapacitet', v: '80 donora' },
            ].map(({ l, v }) => (
              <div key={l} className="flex justify-between py-2.5 border-b last:border-0" style={{ borderColor: C.s50 }}>
                <span className="text-xs" style={{ color: C.ink3 }}>{l}</span>
                <span className="text-sm font-medium" style={{ color: C.ink7 }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Status smene" />
          <div className="p-5 flex flex-col gap-4">
            {[
              { l: 'Prijavljeni', v: '74', color: C.navy },
              { l: 'Obradili prijem', v: '52', color: C.teal2 },
              { l: 'Čeka', v: '12', color: '#d97706' },
              { l: 'Odbijeni', v: '4', color: C.burgundy },
            ].map(({ l, v, color }) => (
              <div key={l} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: C.ink5 }}>{l}</span>
                <span className="text-xl font-medium" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageWrap>
  )
}

function KlinickiSto() {
  return (
    <PageWrap>
      <div className="rounded-xl border p-4 flex items-center gap-3 mb-2" style={{ background: '#dcfce7', borderColor: '#15803d30' }}>
        <Ic.Shield />
        <span className="text-sm font-medium" style={{ color: '#15803d' }}>Zaštićeni klinički radni sto — pristup samo za medicinsko osoblje</span>
      </div>
      <MedicinskaSluzbaStu uloga="medicinska" />
    </PageWrap>
  )
}

function Redakcija() {
  return <Studio />
}

function Raspored() {
  return (
    <PageWrap>
      <Card>
        <CardHeader title="Raspored i smene" subtitle="Nedeljni pregled — 22–28. sep 2026." />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: C.s50 }}>
                <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: C.ink3 }}>Smena</th>
                {['Pon 22.', 'Uto 23.', 'Sri 24.', 'Čet 25.', 'Pet 26.', 'Sub 27.', 'Ned 28.'].map(d => (
                  <th key={d} className="text-left px-5 py-3 text-xs font-medium" style={{ color: C.ink3 }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['Jutarnja (07–12h)', 'Prepodnevna (10–15h)', 'Popodnevna (13–18h)'].map((smena, si) => (
                <tr key={smena} className="border-t" style={{ borderColor: C.s100 }}>
                  <td className="px-5 py-3 font-medium text-xs" style={{ color: C.ink7 }}>{smena}</td>
                  {[0, 1, 2, 3, 4, 5, 6].map(d => (
                    <td key={d} className="px-5 py-3">
                      {(d < 5 || (d === 6 && si === 0)) ? (
                        <div className="text-xs py-1 px-2 rounded" style={{ background: C.tealBg, color: C.teal2 }}>
                          {d === 6 && si === 0 ? 'Sajam' : 'Beograd'}
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: C.s300 }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageWrap>
  )
}

// ── Screen title map ───────────────────────────────────────────────────────
const TITLES: Record<Screen, { title: string; subtitle?: string }> = {
  kontrolni_centar: { title: 'Kontrolni centar', subtitle: 'Pregled stanja zavoda — 22. sep 2026.' },
  akcije: { title: 'Akcije', subtitle: 'Planiranje, kalendar i istorija akcija davanja krvi' },
  prijem_davalaca: { title: 'Prijem davalaca', subtitle: 'Operativni tok prijema i registracije davalaca' },
  medicinska_sluzba: { title: 'Medicinska služba', subtitle: 'Medicinski pregled, laboratorija i kontraindikacije' },
  kampanje: { title: 'Kampanje', subtitle: 'Upravljanje kampanjama, talasima i kapacitetima' },
  studio: { title: 'PR i sadržaj', subtitle: 'Redakcija, vesti, mediji i objave' },
  odobravanje: { title: 'Red odobravanja', subtitle: 'Zahtevi koji čekaju odobrenje' },
  izvestaji: { title: 'Izveštaji', subtitle: 'Statistika, analize i generisani izveštaji' },
  osoblje: { title: 'Osoblje', subtitle: 'Korisnici, uloge, pozicije i registracije' },
  pristup_uredjaji: { title: 'Pristup i uređaji', subtitle: 'QR pristup, MFA, uređaji i aktivne sesije' },
  hijerarhija_audit: { title: 'Hijerarhija i audit', subtitle: 'Organizaciona hijerarhija, audit log i delegacije' },
  api_integracije: { title: 'API i integracije', subtitle: 'Status integracija, incidenti, monitoring i verzije' },
  moja_smena: { title: 'Moja smena', subtitle: 'Pregled dodeljene smene i zadataka' },
  klinicki_sto: { title: 'Klinički radni sto', subtitle: 'Zaštićeni medicinski prostor' },
  redakcija: { title: 'Redakcija', subtitle: 'Upravljanje sadržajem i objavama' },
  audit_log: { title: 'Audit log', subtitle: 'Pregled sistemskih aktivnosti' },
  tech_config: { title: 'Tehnička konfiguracija', subtitle: 'Sistemska podešavanja' },
  incidenti: { title: 'Incidenti', subtitle: 'Upravljanje incidentima' },
  raspored: { title: 'Raspored i smene', subtitle: 'Nedeljni raspored i smene osoblja' },
}

// ── Screen resolver ────────────────────────────────────────────────────────
function resolveScreen(screen: Screen, onNav: (s: Screen) => void, uloga: string) {
  switch (screen) {
    case 'kontrolni_centar': return <KontrolniCentar onNav={onNav} />
    case 'akcije': return <Akcije />
    case 'prijem_davalaca': return <PrijemDavalaca />
    case 'medicinska_sluzba': return <MedicinskaSluzbaStu uloga={uloga} />
    case 'kampanje': return <Kampanje />
    case 'studio': return <Studio />
    case 'redakcija': return <Redakcija />
    case 'odobravanje': return <OdobravanjeScreen />
    case 'izvestaji': return <Izvestaji />
    case 'osoblje': return <Osoblje />
    case 'pristup_uredjaji': return <PristupUredjaji />
    case 'hijerarhija_audit': return <HijerarhijaAudit />
    case 'api_integracije': return <APIIntegracije />
    case 'moja_smena': return <MojaSmena />
    case 'klinicki_sto': return <KlinickiSto />
    case 'audit_log': return <HijerarhijaAudit initialTab="audit" />
    case 'tech_config': return <APIIntegracije initialTab="monitoring" />
    case 'incidenti': return <APIIntegracije initialTab="incidenti" />
    case 'raspored': return <Raspored />
    default: return <KontrolniCentar onNav={onNav} />
  }
}

// ── Default screen per role ────────────────────────────────────────────────
function defaultScreen(uloga: string): Screen {
  switch (uloga) {
    case 'prijem': return 'moja_smena'
    case 'medicinska': return 'klinicki_sto'
    case 'pr_sadrzaj': return 'redakcija'
    case 'revizor': return 'hijerarhija_audit'
    default: return 'kontrolni_centar'
  }
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<Korisnik | null>(() => {
    const id = sessionStorage.getItem('portal-figma-user-id')
    return Object.values(DEMO_NALOZI).find(account => account.korisnik.id === id)?.korisnik ?? null
  })
  const [screen, setScreen] = useState<Screen>(() => screenFromHash() ?? 'kontrolni_centar')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogin(u: Korisnik) {
    setUser(u)
    sessionStorage.setItem('portal-figma-user-id', u.id)
    const destination = screenFromHash()
    const next = destination && canOpen(u.uloga, destination) ? destination : defaultScreen(u.uloga)
    setScreen(next)
    setScreenHash(next)
  }

  function handleLogout() {
    setUser(null)
    sessionStorage.removeItem('portal-figma-user-id')
    setScreen('kontrolni_centar')
    setMobileOpen(false)
    window.location.hash = '#prijava'
  }

  function handleNav(s: Screen) {
    if (!user || !canOpen(user.uloga, s)) return
    setScreen(s)
    setScreenHash(s)
    setMobileOpen(false)
  }

  useEffect(() => {
    if (!user) return
    const syncHash = () => {
      const requested = screenFromHash()
      const next = requested && canOpen(user.uloga, requested) ? requested : defaultScreen(user.uloga)
      setScreen(next)
      setScreenHash(next)
    }
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [user])

  if (!user) return <Prijava onLogin={handleLogin} />

  const { title, subtitle } = TITLES[screen] ?? { title: screen }

  return (
    <div className="min-h-screen flex" style={{ background: C.s50 }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" style={{ background: '#0b1e3d70' }}
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:relative z-40 h-screen lg:h-auto transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar
          screen={screen}
          onNav={handleNav}
          user={user}
          onLogout={handleLogout}
          collapsed={collapsed}
          onToggle={() => setCollapsed(v => !v)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar title={title} subtitle={subtitle} onMenuToggle={() => setMobileOpen(v => !v)} onAlerts={canOpen(user.uloga, 'odobravanje') ? () => handleNav('odobravanje') : undefined} />
        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: `${C.s300} transparent` }}>
          <div key={screen}>{resolveScreen(screen, handleNav, user.uloga)}</div>
        </main>
      </div>
    </div>
  )
}
