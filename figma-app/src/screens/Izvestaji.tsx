import { useState } from 'react'
import { ZALIHE } from '../data'
import { downloadCsv, loadActions } from '../actionStore'
import { C, PageWrap, Card, CardHeader, Tabs, Table, TR, TD, Btn, Progress } from '../components/ui'
import { Ic } from '../components/Icons'

const MES = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep']
const DON = [312, 287, 356, 298, 421, 389, 445, 402, 234]
const BLOOD_GROUPS = [
  { tip: 'O+', pct: 38, n: 1195 }, { tip: 'A+', pct: 28, n: 880 },
  { tip: 'B+', pct: 16, n: 503 }, { tip: 'AB+', pct: 8, n: 252 },
  { tip: 'O−', pct: 5, n: 157 }, { tip: 'Ostale', pct: 5, n: 157 },
]
const BRANCH_SUMMARY = [
  { f: 'Beograd', don: 1847, odb: 152, stopa: 92.4, akcija: 8 },
  { f: 'Novi Sad', don: 893, odb: 78, stopa: 91.9, akcija: 5 },
  { f: 'Niš', don: 287, odb: 41, stopa: 87.5, akcija: 3 },
  { f: 'Kragujevac', don: 117, odb: 16, stopa: 87.9, akcija: 2 },
]
type GeneratedReport = { id: string; name: string; date: string; count: number; branch: string; period: string; rows: (string | number)[][] }
const GENERATED_KEY = 'portal-figma-generated-reports-v1'
function loadGenerated(): GeneratedReport[] {
  try { const saved = JSON.parse(localStorage.getItem(GENERATED_KEY) || '[]'); return Array.isArray(saved) ? saved : [] } catch { return [] }
}
const FILIJALE = ['Sve', 'Beograd', 'Novi Sad', 'Niš', 'Kragujevac']
const MONTH_INDEX: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, maj: 5, jun: 6, jul: 7, avg: 8, sep: 9, okt: 10, nov: 11, dec: 12 }
function actionMonth(date: string): number { return MONTH_INDEX[date.toLowerCase().match(/\b(jan|feb|mar|apr|maj|jun|jul|avg|sep|okt|nov|dec)\b/)?.[0] || ''] || 0 }
function actionYear(date: string): number { return Number(date.match(/\b(?:19|20|21)\d{2}\b/)?.[0] || 0) }

export default function Izvestaji() {
  const [actions] = useState(loadActions)
  const [tab, setTab] = useState('pregled')
  const [filijala, setFilijala] = useState('Sve')
  const [period, setPeriod] = useState('Sve vreme')
  const [actionId, setActionId] = useState('all')
  const [generated, setGenerated] = useState<GeneratedReport[]>(loadGenerated)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const years = [...new Set(actions.map(action => actionYear(action.datum)).filter(Boolean))].sort((a, b) => b - a)
  const periods = ['Sve vreme', 'Tekuća godina', ...years.flatMap(year => [String(year), `Q1 ${year}`, `Q2 ${year}`, `Q3 ${year}`, `Q4 ${year}`])]
  const selectedAction = actions.find(action => action.id === actionId)
  const reportActions = actions.filter(action => (actionId === 'all' || action.id === actionId)
    && (filijala === 'Sve' || action.filijala === filijala)
    && (period === 'Sve vreme' || (period === 'Tekuća godina' && actionYear(action.datum) === new Date().getFullYear())
      || (period === String(actionYear(action.datum)))
      || (period.startsWith('Q') && actionYear(action.datum) === Number(period.slice(3))
        && Math.ceil(actionMonth(action.datum) / 3) === Number(period[1]))))
  const maxD = Math.max(...DON)

  function exportActions() {
    downloadCsv(selectedAction ? `izvestaj-${selectedAction.id}.csv` : 'izvestaj-sve-akcije.csv', actionRows())
  }
  function actionRows(): (string | number)[][] {
    return [
      ['ID', 'Akcija', 'Datum', 'Lokacija', 'Filijala', 'Kapacitet', 'Prijavljeni', 'Donacije', 'Status'],
      ...reportActions.map(action => [action.id, action.naziv, action.datum, action.lokacija,
        action.filijala, action.kapacitet, action.prijavljeni, action.donacije, action.status]),
    ]
  }
  function generateReport() {
    const report: GeneratedReport = {
      id: `R-${Date.now()}`,
      name: selectedAction ? `Izveštaj — ${selectedAction.naziv}` : `Zbirni izveštaj — ${filijala} · ${period}`,
      date: new Date().toLocaleString('sr-Latn-RS'), count: reportActions.length, branch: filijala, period, rows: actionRows(),
    }
    const next = [report, ...generated]
    setGenerated(next)
    localStorage.setItem(GENERATED_KEY, JSON.stringify(next))
    setPreviewId(report.id)
  }

  return (
    <PageWrap>
      <div className="flex items-center gap-3 flex-wrap">
        <Tabs tabs={[
          { id: 'pregled', label: 'Pregled' },
          { id: 'akcije', label: 'Po akcijama' },
          { id: 'zalihe', label: 'Zalihe' },
          { id: 'generisani', label: 'Generisani izveštaji' },
        ]} active={tab} onChange={setTab} />
        <div className="flex-1" />
        <select value={filijala} onChange={e => setFilijala(e.target.value)}
          className="h-10 px-3 rounded-lg border text-sm outline-none" style={{ borderColor: C.s200, background: C.white, color: C.ink7 }}>
          {FILIJALE.map(f => <option key={f}>{f}</option>)}
        </select>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          className="h-10 px-3 rounded-lg border text-sm outline-none" style={{ borderColor: C.s200, background: C.white, color: C.ink7 }}>
          {periods.map(p => <option key={p}>{p}</option>)}
        </select>
        <select aria-label="Izaberi akciju za izveštaj" value={actionId} onChange={e => { setActionId(e.target.value); setTab('akcije') }}
          className="h-10 px-3 rounded-lg border text-sm outline-none max-w-64" style={{ borderColor: C.s200, background: C.white, color: C.ink7 }}>
          <option value="all">Sve akcije</option>
          {actions.map(action => <option key={action.id} value={action.id}>{action.naziv} · {action.datum}</option>)}
        </select>
        <Btn variant="secondary" onClick={exportActions} disabled={!reportActions.length}><Ic.Download /> Izvezi izveštaj</Btn>
      </div>

      {selectedAction && reportActions.length === 0 && <div role="status" className="rounded-xl border p-5 text-sm" style={{ background: C.white, borderColor: C.s100, color: C.ink5 }}>Izabrana akcija ne pripada odabranoj filijali ili periodu. Promenite filter za prikaz izveštaja.</div>}
      {selectedAction && reportActions.length > 0 && <Card>
        <div className="p-5">
          <div className="text-xs uppercase tracking-wide font-medium mb-2" style={{ color: C.teal2 }}>IZVEŠTAJ ZA IZABRANU AKCIJU</div>
          <h2 className="text-xl mb-1" style={{ color: C.navy, fontFamily: 'DM Serif Display, Georgia, serif' }}>{selectedAction.naziv}</h2>
          <p className="text-sm mb-5" style={{ color: C.ink5 }}>{selectedAction.datum} · {selectedAction.lokacija} · {selectedAction.status}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ['Kapacitet', selectedAction.kapacitet], ['Prijavljeni', selectedAction.prijavljeni],
              ['Potvrđene donacije', selectedAction.donacije],
              ['Iskorišćenost', `${Math.round(selectedAction.donacije / selectedAction.kapacitet * 100)}%`],
            ].map(([label, value]) => <div key={label} className="rounded-lg p-4" style={{ background: C.s50 }}>
              <div className="text-xs mb-2" style={{ color: C.ink3 }}>{label}</div>
              <div className="text-2xl font-medium" style={{ color: C.navy, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
            </div>)}
          </div>
        </div>
      </Card>}

      {tab === 'pregled' && !selectedAction && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { l: 'Donacije YTD', v: '3.144', sub: '↑ 8.3% vs. prethodna god.' },
              { l: 'Odbijeni davaoci', v: '287', sub: '8.4% stopa odbijanja' },
              { l: 'Prikupljeno (litara)', v: '1.572', sub: 'Ekvivalent pune krvi' },
              { l: 'Prosek po danu', v: '12.4', sub: 'Donora dnevno' },
            ].map(({ l, v, sub }) => (
              <Card key={l}>
                <div className="p-5">
                  <div className="text-xs mb-2 font-medium" style={{ color: C.ink3 }}>{l}</div>
                  <div className="text-2xl font-medium" style={{ color: C.navy, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
                  <div className="text-xs mt-1" style={{ color: C.ink3 }}>{sub}</div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Mesečni bar chart */}
            <Card>
              <CardHeader title="Donacije po mesecima — 2026." subtitle="Januar – Septembar" action={
                <Btn variant="secondary" size="sm" onClick={() => downloadCsv('donacije-po-mesecima-demo.csv', [['Mesec', 'Donacije'], ...MES.map((m, i) => [m, DON[i]])])}><Ic.Download /> CSV</Btn>
              } />
              <div className="p-5">
                <div className="flex items-end gap-2 h-40">
                  {DON.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: C.ink5, fontFamily: 'JetBrains Mono, monospace' }}>{d}</div>
                      <div className="w-full rounded-t-sm grow-bar"
                        style={{ height: `${(d / maxD) * 128}px`, background: i === MES.length - 1 ? C.teal : C.navy, animationDelay: `${i * 60}ms` }} />
                      <div className="text-xs" style={{ color: C.ink3 }}>{MES[i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Distribucija krvnih grupa */}
            <Card>
              <CardHeader title="Distribucija krvnih grupa" action={
                <Btn variant="secondary" size="sm" onClick={() => downloadCsv('krvne-grupe-demo.csv', [['Grupa', 'Udeo %', 'Broj'], ...BLOOD_GROUPS.map(g => [g.tip, g.pct, g.n])])}><Ic.Download /> CSV</Btn>
              } />
              <div className="p-5 flex flex-col gap-3">
                {BLOOD_GROUPS.map(({ tip, pct, n }) => (
                  <div key={tip} className="flex items-center gap-3">
                    <span className="w-10 text-right text-xs font-mono" style={{ color: C.ink5, fontFamily: 'JetBrains Mono, monospace' }}>{tip}</span>
                    <div className="flex-1">
                      <Progress value={pct} max={100} height={6} />
                    </div>
                    <span className="text-xs font-mono w-8" style={{ color: C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{pct}%</span>
                    <span className="text-xs font-mono w-12 text-right" style={{ color: C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{n}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Po filijali */}
          <Card>
            <CardHeader title="Demonstracioni pregled po filijali" action={
              <Btn variant="secondary" size="sm" onClick={() => downloadCsv('pregled-po-filijali-demo.csv', [['Filijala', 'Donacije', 'Odbijeni', 'Stopa prihvata %', 'Akcija'], ...BRANCH_SUMMARY.map(b => [b.f, b.don, b.odb, b.stopa, b.akcija])])}><Ic.Download /> Izvezi CSV</Btn>
            } />
            <Table headers={['Filijala', 'Donacije', 'Odbijeni', 'Stopa prihvata', 'Akcija', 'Uspešnost']}>
              {BRANCH_SUMMARY.map(({ f, don, odb, stopa, akcija }) => (
                <TR key={f}>
                  <TD><span className="font-medium">{f}</span></TD>
                  <TD mono>{don.toLocaleString('sr')}</TD>
                  <TD mono>{odb}</TD>
                  <TD>
                    <span className="font-mono text-xs" style={{ color: stopa > 90 ? C.teal2 : '#d97706', fontFamily: 'JetBrains Mono, monospace' }}>{stopa}%</span>
                  </TD>
                  <TD mono>{akcija}</TD>
                  <TD>
                    <div className="min-w-[80px]"><Progress value={stopa} max={100} height={4} /></div>
                  </TD>
                </TR>
              ))}
            </Table>
          </Card>
        </>
      )}

      {tab === 'akcije' && (
        <Card>
          <CardHeader title="Izveštaj po akcijama" action={
            <Btn variant="secondary" size="sm" onClick={exportActions}><Ic.Download /> Izvezi</Btn>
          } />
          <Table headers={['Akcija', 'Datum', 'Lokacija', 'Prijavljeni', 'Donacije', 'Uspešnost', 'Koordinator']}>
            {reportActions.map(a => {
              const usp = a.kapacitet > 0 ? Math.round((a.donacije / a.kapacitet) * 100) : 0
              return (
                <TR key={a.id} onClick={() => setActionId(a.id)}>
                  <TD><span className="font-medium">{a.naziv}</span></TD>
                  <TD mono>{a.datum}</TD>
                  <TD muted>{a.lokacija}</TD>
                  <TD mono>{a.prijavljeni}</TD>
                  <TD mono>{a.donacije || '—'}</TD>
                  <TD>
                    {a.donacije > 0 ? (
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: C.s100 }}>
                          <div className="h-full rounded-full" style={{ width: `${usp}%`, background: usp > 80 ? C.teal : usp > 50 ? '#d97706' : C.burgundy }} />
                        </div>
                        <span className="text-xs font-mono" style={{ color: C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{usp}%</span>
                      </div>
                    ) : <span className="text-xs" style={{ color: C.ink3 }}>—</span>}
                  </TD>
                  <TD muted>{a.koordinator}</TD>
                </TR>
              )
            })}
          </Table>
        </Card>
      )}

      {tab === 'zalihe' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ZALIHE.map(z => {
              const pct = Math.round((z.kolicina / z.max) * 100)
              const isLow = pct < 30
              return (
                <Card key={z.tip}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-lg font-medium" style={{ color: isLow ? C.burgundy : C.navy, fontFamily: 'JetBrains Mono, monospace' }}>{z.tip}</span>
                      {isLow && <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: C.burgundyBg, color: C.burgundy }}>Kritično</span>}
                    </div>
                    <div className="text-2xl font-medium mb-1" style={{ color: C.ink9, fontFamily: 'JetBrains Mono, monospace' }}>{z.kolicina}</div>
                    <div className="text-xs mb-2" style={{ color: C.ink3 }}>od {z.max} jedinica</div>
                    <Progress value={z.kolicina} max={z.max} color={isLow ? C.burgundy : C.teal} />
                  </div>
                </Card>
              )
            })}
          </div>
          <Card>
            <CardHeader title="Trend zaliha — poslednjih 30 dana" action={
              <Btn variant="secondary" size="sm" onClick={() => downloadCsv('zalihe-trenutno-demo.csv', [['Krvna grupa', 'Jedinica', 'Kapacitet'], ...ZALIHE.map(z => [z.tip, z.kolicina, z.max])])}><Ic.Download /> Izvezi CSV</Btn>
            } />
            <div className="p-5 text-center py-12" style={{ color: C.ink3 }}>
              <Ic.Izvestaji />
              <p className="text-sm mt-2">Istorijski trend nije povezan. Preuzimanje sadrži samo trenutno demo stanje zaliha.</p>
            </div>
          </Card>
        </div>
      )}

      {tab === 'generisani' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end">
            <Btn onClick={generateReport} disabled={!reportActions.length}><Ic.Plus /> Generiši novi</Btn>
          </div>
          <Card>
            <Table headers={['Naziv', 'Tip', 'Period', 'Lokacija', 'Generisan', 'Format', 'Akcija']}>
              {generated.map(r => (
                <TR key={r.id}>
                  <TD><span className="font-medium">{r.name}</span></TD>
                  <TD muted>Akcije</TD>
                  <TD mono>{r.period || 'Sve vreme'}</TD>
                  <TD muted>{r.branch || 'Sve'}</TD>
                  <TD mono>{r.date}</TD>
                  <TD>
                    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: C.s100, color: C.ink5, fontFamily: 'JetBrains Mono, monospace' }}>CSV</span>
                  </TD>
                  <TD>
                    <div className="flex gap-2">
                      <Btn variant="ghost" size="sm" title="Preuzmi CSV" onClick={() => downloadCsv(`${r.id}.csv`, r.rows)}><Ic.Download /></Btn>
                      <Btn variant="ghost" size="sm" title="Pregled izveštaja" onClick={() => setPreviewId(previewId === r.id ? null : r.id)}><Ic.Eye /></Btn>
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>
            {generated.length === 0 && <p className="p-6 text-sm" style={{ color: C.ink5 }}>Još nema generisanih izveštaja. Izaberite akciju i filtere, pa kliknite „Generiši novi”.</p>}
            {previewId && generated.find(r => r.id === previewId) && <div className="m-5 p-4 rounded-lg text-sm" style={{ background: C.s50, color: C.ink7 }}>
              <strong>{generated.find(r => r.id === previewId)?.name}</strong> · {generated.find(r => r.id === previewId)?.count} akcija u sačuvanom preseku. Preuzmite CSV za detalje.
            </div>}
          </Card>
        </div>
      )}
    </PageWrap>
  )
}
