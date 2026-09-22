import { ZALIHE, INTEGRACIJE, AUDIT_LOGOVI, type Screen } from '../data'
import { loadActions } from '../actionStore'
import { loadDonors } from '../donorStore'
import { loadApprovals } from './Odobravanje'
import { C, KpiCard, Card, CardHeader, PageWrap, StatusBadge, Progress } from '../components/ui'
import { Ic } from '../components/Icons'
export default function KontrolniCentar({ onNav }: { onNav: (s: Screen) => void }) {
  const actions = loadActions()
  const donors = loadDonors()
  const approvals = loadApprovals()
  const kritZalihe = ZALIHE.filter(z => z.kolicina / z.max < 0.3).length
  const aktivnaAkcija = actions.find(a => a.status === 'aktivna')
  const cekaDavalaca = donors.filter(d => d.status === 'ceka').length
  const ceka_odobravanje = approvals.filter(o => o.status === 'ceka').length
  const intGreska = INTEGRACIJE.filter(i => i.status === 'greska' || i.status === 'degradovana').length

  return (
    <PageWrap>
      {/* Dnevni prioriteti */}
      {(kritZalihe > 0 || ceka_odobravanje > 0 || intGreska > 0) && (
        <div className="rounded-xl border p-4 flex flex-col gap-2" style={{ background: C.burgundyBg, borderColor: C.burgundy + '40' }}>
          <div className="flex items-center gap-2 mb-1">
            <Ic.Incidenti />
            <span className="font-medium text-sm" style={{ color: C.burgundy }}>Dnevni prioriteti — akcija potrebna</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {kritZalihe > 0 && (
              <button onClick={() => onNav('izvestaji')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:opacity-80"
                style={{ borderColor: C.burgundy + '60', color: C.burgundy, background: C.white }}>
                <Ic.Drop /> {kritZalihe} krvne grupe ispod 30% zaliha
              </button>
            )}
            {ceka_odobravanje > 0 && (
              <button onClick={() => onNav('odobravanje')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:opacity-80"
                style={{ borderColor: C.burgundy + '60', color: C.burgundy, background: C.white }}>
                <Ic.Odobravanje /> {ceka_odobravanje} zahteva čeka odobrenje
              </button>
            )}
            {intGreska > 0 && (
              <button onClick={() => onNav('api_integracije')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:opacity-80"
                style={{ borderColor: C.burgundy + '60', color: C.burgundy, background: C.white }}>
                <Ic.API /> {intGreska} integracije sa greškom
              </button>
            )}
          </div>
        </div>
      )}

      {/* KPI red */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Donori danas" value={String(donors.length)} sub={`${cekaDavalaca} u čekaonici`} color={C.teal} icon={<Ic.Prijem />} onClick={() => onNav('prijem_davalaca')} />
        <KpiCard label="Aktivna akcija" value={aktivnaAkcija ? `${aktivnaAkcija.donacije}/${aktivnaAkcija.kapacitet}` : '—'} sub={aktivnaAkcija?.naziv ?? 'Nema aktivne akcije'} color={C.navy3} icon={<Ic.Akcije />} onClick={() => onNav('akcije')} />
        <KpiCard label="Kritične zalihe" value={String(kritZalihe)} sub="krvnih grupa ispod 30%" color={C.burgundy} icon={<Ic.Drop />} alert={kritZalihe > 0} onClick={() => onNav('izvestaji')} />
        <KpiCard label="Na čekanju (odo.)" value={String(ceka_odobravanje)} sub="zahteva za odobrenje" color="#d97706" icon={<Ic.Odobravanje />} alert={ceka_odobravanje > 0} onClick={() => onNav('odobravanje')} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Zalihe */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Zalihe krvi — trenutno stanje" subtitle="Sve filijale" action={
              <button onClick={() => onNav('izvestaji')} className="text-xs font-medium" style={{ color: C.teal }}>Detalji →</button>
            } />
            <div className="p-5 flex flex-col gap-3">
              {ZALIHE.map(z => {
                const pct = z.kolicina / z.max
                const isLow = pct < 0.3
                return (
                  <div key={z.tip} className="flex items-center gap-3">
                    <span className="w-8 text-xs font-medium text-right" style={{ color: isLow ? C.burgundy : C.ink7, fontFamily: 'JetBrains Mono, monospace' }}>{z.tip}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: C.s100 }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(pct * 100)}%`, background: isLow ? C.burgundy : C.teal }} />
                    </div>
                    <span className="text-xs font-mono w-20 text-right" style={{ color: isLow ? C.burgundy : C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>
                      {z.kolicina}/{z.max} jed.
                    </span>
                    {isLow && <span className="text-xs font-medium" style={{ color: C.burgundy }}>!</span>}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Aktivna akcija */}
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Aktivna akcija" />
            {aktivnaAkcija ? (
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <div className="font-medium text-sm mb-1" style={{ color: C.ink7 }}>{aktivnaAkcija.naziv}</div>
                  <div className="text-xs" style={{ color: C.ink3 }}>{aktivnaAkcija.lokacija}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>{aktivnaAkcija.datum}</div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: C.ink3 }}>Donacije / kapacitet</span>
                    <span style={{ color: C.ink7, fontFamily: 'JetBrains Mono, monospace' }}>{aktivnaAkcija.donacije}/{aktivnaAkcija.kapacitet}</span>
                  </div>
                  <Progress value={aktivnaAkcija.donacije} max={aktivnaAkcija.kapacitet} />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: C.ink3 }}>Prijavljeni / kapacitet</span>
                    <span style={{ color: C.ink7, fontFamily: 'JetBrains Mono, monospace' }}>{aktivnaAkcija.prijavljeni}/{aktivnaAkcija.kapacitet}</span>
                  </div>
                  <Progress value={aktivnaAkcija.prijavljeni} max={aktivnaAkcija.kapacitet} color={C.navy3} />
                </div>
                <div className="text-xs" style={{ color: C.ink3 }}>Koordinator: <span style={{ color: C.ink7 }}>{aktivnaAkcija.koordinator}</span></div>
                <button onClick={() => onNav('prijem_davalaca')} className="h-9 rounded-lg text-sm font-medium w-full" style={{ background: C.teal, color: C.white }}>
                  Otvori prijem →
                </button>
              </div>
            ) : (
              <div className="p-5 text-center text-sm py-10" style={{ color: C.ink3 }}>Nema aktivne akcije</div>
            )}
          </Card>

          {/* Integracije status */}
          <Card>
            <CardHeader title="Integracije" action={
              <button onClick={() => onNav('api_integracije')} className="text-xs font-medium" style={{ color: C.teal }}>Sve →</button>
            } />
            <div className="p-4 flex flex-col gap-2">
              {INTEGRACIJE.slice(0, 4).map(i => (
                <div key={i.id} className="flex items-center justify-between">
                  <span className="text-xs truncate flex-1" style={{ color: C.ink7 }}>{i.naziv}</span>
                  <StatusBadge status={i.status === 'aktivna' ? 'aktivna' : i.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Odobravanje i Audit */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader title="Red odobravanja" subtitle={`${ceka_odobravanje} na čekanju`} action={
            <button onClick={() => onNav('odobravanje')} className="text-xs font-medium" style={{ color: C.teal }}>Sve →</button>
          } />
          <div className="divide-y" style={{ borderColor: C.s100 }}>
            {approvals.filter(o => o.status === 'ceka').slice(0, 3).map(o => (
              <div key={o.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1">
                  <div className="text-sm font-medium leading-snug" style={{ color: C.ink7 }}>{o.naziv}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>{o.tip} · {o.podnosilac}</div>
                </div>
                <StatusBadge status={o.hitnost} />
              </div>
            ))}
            {ceka_odobravanje === 0 && <div className="px-5 py-8 text-center text-sm" style={{ color: C.ink3 }}>Nema zahteva na čekanju.</div>}
          </div>
        </Card>

        <Card>
          <CardHeader title="Poslednje aktivnosti (Audit)" action={
            <button onClick={() => onNav('hijerarhija_audit')} className="text-xs font-medium" style={{ color: C.teal }}>Sve →</button>
          } />
          <div className="divide-y" style={{ borderColor: C.s100 }}>
            {AUDIT_LOGOVI.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0`} style={{ background: a.rezultat === 'uspeh' ? C.teal : a.rezultat === 'greska' ? C.burgundy : '#d97706' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: C.ink7 }}>{a.akcija} — {a.resurs}</div>
                  <div className="text-xs" style={{ color: C.ink3 }}>{a.korisnik} · {a.vreme}</div>
                </div>
                <StatusBadge status={a.rezultat} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageWrap>
  )
}
