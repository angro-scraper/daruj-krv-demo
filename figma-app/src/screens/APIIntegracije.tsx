import { useState } from 'react'
import { INTEGRACIJE, type Integracija } from '../data'
import { downloadCsv } from '../actionStore'
import { C, PageWrap, Card, CardHeader, Tabs, StatusBadge, Table, TR, TD, Btn, Modal, Progress, Input, Select } from '../components/ui'
import { Ic } from '../components/Icons'

const INCIDENTI = [
  { id: 'INC-042', naziv: 'eZdravlje — timeout 504', integracija: 'eZdravlje portal', datum: '22. sep 2026, 08:55', trajanje: '28 min', status: 'otvoren', ozbiljnost: 'visoka' },
  { id: 'INC-041', naziv: 'Backup — SSH autentikacija neuspela', integracija: 'Backup sistem', datum: '21. sep 2026, 02:00', trajanje: '4h 30min', status: 'otvoren', ozbiljnost: 'kritična' },
  { id: 'INC-040', naziv: 'LIS — povremeni timeout', integracija: 'LIS', datum: '19. sep 2026, 14:22', trajanje: '5 min', status: 'zatvoren', ozbiljnost: 'niska' },
  { id: 'INC-039', naziv: 'SMS gateway — rate limit', integracija: 'SMS gateway', datum: '18. sep 2026, 10:05', trajanje: '12 min', status: 'zatvoren', ozbiljnost: 'niska' },
]
type Incident = typeof INCIDENTI[number]
const INCIDENT_KEY = 'portal-figma-incidents-v1'
function loadIncidents(): Incident[] {
  try { const saved = JSON.parse(localStorage.getItem(INCIDENT_KEY) || 'null'); return Array.isArray(saved) ? saved : INCIDENTI } catch { return INCIDENTI }
}

export default function APIIntegracije({ initialTab = 'integracije' }: { initialTab?: string }) {
  const [incidents, setIncidents] = useState(loadIncidents)
  const [tab, setTab] = useState(initialTab)
  const [selInt, setSelInt] = useState<Integracija | null>(null)
  const [detModal, setDetModal] = useState(false)
  const [incidentModal, setIncidentModal] = useState(false)
  const [selIncident, setSelIncident] = useState<Incident | null>(null)
  const [incidentName, setIncidentName] = useState('')
  const [incidentIntegration, setIncidentIntegration] = useState(INTEGRACIJE[0]?.naziv || '')
  const [incidentSeverity, setIncidentSeverity] = useState('niska')
  const [feedback, setFeedback] = useState('')
  const saveIncidents = (next: Incident[]) => { setIncidents(next); localStorage.setItem(INCIDENT_KEY, JSON.stringify(next)) }
  const recordIncident = () => {
    if (!incidentName.trim()) { setFeedback('Unesite naziv incidenta.'); return }
    const next: Incident = {
      id: `INC-${Date.now()}`, naziv: incidentName.trim(), integracija: incidentIntegration,
      datum: new Date().toLocaleString('sr-Latn-RS'), trajanje: 'U toku', status: 'otvoren', ozbiljnost: incidentSeverity,
    }
    saveIncidents([next, ...incidents]); setIncidentModal(false); setIncidentName('')
    setFeedback('Incident je evidentiran u demo portalu.')
  }
  const testIntegration = (integration: Integracija) => {
    setFeedback(`Za ${integration.naziv} nije konfigurisan stvarni API endpoint. Prikazani status je Figma demonstracija; test nije izvršen.`)
    setDetModal(false)
  }

  return (
    <PageWrap>
      <Tabs tabs={[
        { id: 'integracije', label: 'Integracije' },
        { id: 'incidenti', label: `Incidenti (${incidents.filter(i => i.status === 'otvoren').length})` },
        { id: 'monitoring', label: 'Monitoring' },
        { id: 'verzije', label: 'Verzije API-ja' },
      ]} active={tab} onChange={setTab} />
      {feedback && <div role="status" className="rounded-lg px-4 py-2 text-sm" style={{ background: C.tealBg, color: C.teal2 }}>{feedback}</div>}

      {tab === 'integracije' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { l: 'Aktivne', v: INTEGRACIJE.filter(i => i.status === 'aktivna').length, color: C.teal },
              { l: 'Greška', v: INTEGRACIJE.filter(i => i.status === 'greska').length, color: C.burgundy },
              { l: 'Degradovane', v: INTEGRACIJE.filter(i => i.status === 'degradovana').length, color: '#d97706' },
              { l: 'Ukupno', v: INTEGRACIJE.length, color: C.navy },
            ].map(({ l, v, color }) => (
              <Card key={l}>
                <div className="p-5">
                  <div className="text-xs mb-1" style={{ color: C.ink3 }}>{l}</div>
                  <div className="text-2xl font-medium" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <Table headers={['ID', 'Naziv', 'Tip', 'Verzija', 'Poslednji ping', 'Uptime', 'Incidenti', 'Status', 'Akcija']}>
              {INTEGRACIJE.map(i => (
                <TR key={i.id} onClick={() => { setSelInt(i); setDetModal(true) }}>
                  <TD mono muted>{i.id}</TD>
                  <TD><span className="font-medium">{i.naziv}</span></TD>
                  <TD>
                    <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: C.s100, color: C.ink5, fontFamily: 'JetBrains Mono, monospace' }}>{i.tip}</span>
                  </TD>
                  <TD mono>{i.verzija}</TD>
                  <TD mono>{i.poslednjiPing}</TD>
                  <TD>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: C.s100 }}>
                        <div className="h-full rounded-full" style={{ width: `${i.uptime}%`, background: i.uptime > 98 ? C.teal : i.uptime > 90 ? '#d97706' : C.burgundy }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{i.uptime}%</span>
                    </div>
                  </TD>
                  <TD>
                    <span className="text-xs font-mono" style={{ color: i.incidenti > 0 ? C.burgundy : C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{i.incidenti}</span>
                  </TD>
                  <TD><StatusBadge status={i.status === 'aktivna' ? 'aktivna' : i.status} /></TD>
                  <TD>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <Btn variant="ghost" size="sm" title="Ping" onClick={() => testIntegration(i)}><Ic.Refresh /></Btn>
                      <Btn variant="ghost" size="sm" onClick={() => { setSelInt(i); setDetModal(true) }}><Ic.Eye /></Btn>
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>
          </Card>
        </>
      )}

      {tab === 'incidenti' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end">
            <Btn onClick={() => setIncidentModal(true)}><Ic.Plus /> Prijavi incident</Btn>
          </div>
          <Card>
            <Table headers={['ID', 'Naziv', 'Integracija', 'Datum', 'Trajanje', 'Ozbiljnost', 'Status', 'Akcija']}>
              {incidents.map(inc => (
                <TR key={inc.id}>
                  <TD mono muted>{inc.id}</TD>
                  <TD><span className="font-medium">{inc.naziv}</span></TD>
                  <TD muted>{inc.integracija}</TD>
                  <TD mono>{inc.datum}</TD>
                  <TD mono>{inc.trajanje}</TD>
                  <TD>
                    <span className="text-xs font-medium" style={{
                      color: inc.ozbiljnost === 'kritična' ? C.burgundy : inc.ozbiljnost === 'visoka' ? '#d97706' : C.ink3
                    }}>
                      {inc.ozbiljnost.charAt(0).toUpperCase() + inc.ozbiljnost.slice(1)}
                    </span>
                  </TD>
                  <TD>
                    <StatusBadge status={inc.status === 'otvoren' ? 'ceka' : 'zavrseno'} />
                  </TD>
                  <TD>
                    <div className="flex gap-2">
                      <Btn variant="ghost" size="sm" onClick={() => setSelIncident(inc)}><Ic.Eye /></Btn>
                      {inc.status === 'otvoren' && <Btn size="sm" variant="secondary" onClick={() => { if (!confirm(`Zatvoriti incident ${inc.id}?`)) return; saveIncidents(incidents.map(item => item.id === inc.id ? { ...item, status: 'zatvoren' } : item)); setFeedback(`Incident ${inc.id} je zatvoren u demo evidenciji.`) }}>Zatvori</Btn>}
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>
          </Card>
        </div>
      )}

      {tab === 'monitoring' && (
        <div className="flex flex-col gap-5">
          {INTEGRACIJE.map(i => (
            <Card key={i.id}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-medium text-sm mb-0.5" style={{ color: C.navy }}>{i.naziv}</div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: C.ink3 }}>
                      <span className="font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{i.tip} · {i.verzija}</span>
                      <span>Poslednji ping: {i.poslednjiPing}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={i.status === 'aktivna' ? 'aktivna' : i.status} />
                    <Btn variant="ghost" size="sm" onClick={() => testIntegration(i)}><Ic.Refresh /></Btn>
                  </div>
                </div>

                {/* Uptime progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: C.ink3 }}>Uptime (30 dana)</span>
                    <span className="font-mono" style={{ color: i.uptime > 98 ? C.teal2 : C.burgundy, fontFamily: 'JetBrains Mono, monospace' }}>{i.uptime}%</span>
                  </div>
                  <Progress value={i.uptime} max={100} color={i.uptime > 98 ? C.teal : i.uptime > 90 ? '#d97706' : C.burgundy} />
                </div>

                {/* Stabilan ilustrativni prikaz iz Figma prototipa, bez lažnog live merenja. */}
                <div className="flex items-center gap-1 h-6">
                  {Array.from({ length: 24 }, (_, h) => {
                    const isError = i.status === 'greska' && h > 18
                    return (
                      <div key={h} className="flex-1 rounded-sm"
                        style={{ height: `${35 + (h * 13) % 65}%`, background: isError ? C.burgundy : i.status === 'degradovana' && h > 20 ? '#d97706' : C.teal + '80' }} />
                    )
                  })}
                </div>
                <div className="flex justify-between text-xs mt-1" style={{ color: C.ink3 }}>
                  <span>Ilustrativni prikaz (demo)</span>
                  <span>Nije live merenje</span>
                </div>

                {i.incidenti > 0 && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: C.s100 }}>
                    <span className="text-xs font-medium" style={{ color: C.burgundy }}>{i.incidenti} incident{i.incidenti > 1 ? 'a' : ''} u poslednjih 30 dana</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'verzije' && (
        <Card>
          <CardHeader title="API verzije i changelog" action={
            <Btn variant="secondary" size="sm" onClick={() => setFeedback('Objava nove API verzije zahteva povezani serverski servis i odobrenje; u Figma prototipu nije dostupna.')}><Ic.Plus /> Nova verzija</Btn>
          } />
          <Table headers={['Integracija', 'Trenutna verzija', 'Prethodna', 'Datum ažuriranja', 'Changelog', 'Akcija']}>
            {INTEGRACIJE.map(i => (
              <TR key={i.id}>
                <TD><span className="font-medium">{i.naziv}</span></TD>
                <TD>
                  <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: C.tealBg, color: C.teal2, fontFamily: 'JetBrains Mono, monospace' }}>{i.verzija}</span>
                </TD>
                <TD mono muted>—</TD>
                <TD mono>{i.poslednjiPing.slice(0, 11)}</TD>
                <TD>
                  <button onClick={() => { setSelInt(i); setDetModal(true) }} className="text-xs font-medium" style={{ color: C.teal }}>Pogledaj →</button>
                </TD>
                <TD>
                  <Btn variant="ghost" size="sm" onClick={() => downloadCsv(`integracija-${i.id}.csv`, [['ID', 'Naziv', 'Verzija', 'Status'], [i.id, i.naziv, i.verzija, i.status]])}><Ic.Download /></Btn>
                </TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {/* Detalji integracije */}
      <Modal open={detModal} onClose={() => setDetModal(false)} title="Detalji integracije" width="max-w-lg">
        {selInt && (
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: C.navy }}>{selInt.naziv}</div>
                <div className="text-xs font-mono mt-0.5" style={{ color: C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{selInt.id} · {selInt.tip} · {selInt.verzija}</div>
              </div>
              <StatusBadge status={selInt.status === 'aktivna' ? 'aktivna' : selInt.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: 'Poslednji ping', v: selInt.poslednjiPing },
                { l: 'Uptime (30d)', v: `${selInt.uptime}%` },
                { l: 'Aktivni incidenti', v: String(selInt.incidenti) },
                { l: 'Verzija', v: selInt.verzija },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div className="text-xs mb-0.5" style={{ color: C.ink3 }}>{l}</div>
                  <div className="text-sm font-medium font-mono" style={{ color: C.ink7, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Btn variant="secondary" onClick={() => setDetModal(false)}>Zatvori</Btn>
              <Btn onClick={() => testIntegration(selInt)}><Ic.Refresh /> Testiraj konekciju</Btn>
              {selInt.status === 'greska' && <Btn variant="secondary" onClick={() => testIntegration(selInt)}>Oporavak</Btn>}
            </div>
          </div>
        )}
      </Modal>
      <Modal open={incidentModal} onClose={() => setIncidentModal(false)} title="Prijavi incident">
        <div className="flex flex-col gap-4">
          <Input label="Naziv incidenta" value={incidentName} onChange={setIncidentName} />
          <Select label="Integracija" options={INTEGRACIJE.map(item => item.naziv)} value={incidentIntegration} onChange={setIncidentIntegration} />
          <Select label="Ozbiljnost" options={['niska', 'visoka', 'kritična']} value={incidentSeverity} onChange={setIncidentSeverity} />
          <div className="flex justify-end gap-3"><Btn variant="secondary" onClick={() => setIncidentModal(false)}>Otkaži</Btn><Btn onClick={recordIncident}>Evidentiraj incident</Btn></div>
        </div>
      </Modal>
      <Modal open={Boolean(selIncident)} onClose={() => setSelIncident(null)} title="Detalji incidenta">
        {selIncident && <div className="flex flex-col gap-3 text-sm" style={{ color: C.ink7 }}>
          <div className="text-lg font-medium" style={{ color: C.navy }}>{selIncident.naziv}</div>
          <div>ID: {selIncident.id}</div><div>Integracija: {selIncident.integracija}</div>
          <div>Prijavljeno: {selIncident.datum}</div><div>Ozbiljnost: {selIncident.ozbiljnost}</div>
          <div>Status: {incidents.find(item => item.id === selIncident.id)?.status || selIncident.status}</div>
          <Btn variant="secondary" onClick={() => setSelIncident(null)}>Zatvori prikaz</Btn>
        </div>}
      </Modal>
    </PageWrap>
  )
}
