import { useEffect, useState } from 'react'
import { C, PageWrap, Card, CardHeader, Table, TR, TD, Btn } from '../components/ui'
import { getDemoSummary, getDemoReception, updateDemoReception, type DemoAction, type DemoReservation } from '../demoApi'

export default function ConnectedDemoReception() {
  const [actions, setActions] = useState<DemoAction[]>([])
  const [reservations, setReservations] = useState<DemoReservation[]>([])
  const [selected, setSelected] = useState('')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const refresh = async () => {
    try {
      const [summary, nextReservations] = await Promise.all([getDemoSummary(), getDemoReception()])
      setActions(summary.actions); setReservations(nextReservations)
      setSelected(current => current || summary.actions[0]?.id || '')
      setError('')
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Demo servis nije dostupan.') }
  }
  useEffect(() => {
    let active = true
    const load = async () => { if (active) await refresh() }
    void load()
    const timer = window.setInterval(() => { void load() }, 15000)
    return () => { active = false; window.clearInterval(timer) }
  }, [])
  const visible = reservations.filter(item => item.actionId === selected && `${item.code} ${item.personaId}`.toLowerCase().includes(query.toLowerCase()))
  const update = async (item: DemoReservation, operation: 'check-in' | 'no-show') => {
    if (!window.confirm(`${operation === 'check-in' ? 'Evidentirati dolazak' : 'Evidentirati nedolazak'} za demo kod ${item.code}?`)) return
    try {
      await updateDemoReception(item.code, operation)
      await refresh()
      setMessage('Promena je sačuvana u zajedničkom demo servisu.')
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Promena nije sačuvana.') }
  }
  return <PageWrap>
    <div role="status" className="rounded-xl border p-4 text-sm" style={{ borderColor: C.teal + '60', background: C.tealBg, color: C.teal2 }}>Povezani sintetički demo · u ovom režimu se ne prikazuju imena, identifikacioni ni zdravstveni podaci. Prijem u sistemu Zavoda nije aktiviran.</div>
    {error && <p role="alert" style={{ color: C.burgundy }}>{error} <Btn variant="secondary" size="sm" onClick={() => void refresh()}>Pokušaj ponovo</Btn></p>}
    {message && <p role="status" style={{ color: C.teal2 }}>{message}</p>}
    <div className="flex gap-3 items-center flex-wrap">
      <select aria-label="Izaberi akciju" value={selected} onChange={event => setSelected(event.target.value)} className="h-10 px-3 rounded-lg border text-sm" style={{ borderColor: C.s200, color: C.ink7 }}>
        {actions.map(action => <option key={action.id} value={action.id}>{action.title} · {action.date}</option>)}
      </select>
      <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Kod ili demo identifikator" aria-label="Pretraži rezervacije" className="h-10 px-3 rounded-lg border text-sm" style={{ borderColor: C.s200, color: C.ink7 }} />
      <Btn variant="secondary" onClick={() => void refresh()}>Osveži</Btn>
    </div>
    <Card><CardHeader title="Rezervacije iz zajedničkog servisa" subtitle={`${visible.length} zapisa za izabranu akciju`} />
      <Table headers={['Kod', 'Demo osoba', 'Vreme', 'Status', 'Akcija']}>
        {visible.map(item => <TR key={item.id}><TD mono>{item.code}</TD><TD muted>{item.personaId.slice(-8)}</TD><TD mono>{item.time}</TD><TD>{item.status === 'reserved' ? 'Zakazano' : item.status === 'checked_in' ? 'Prijavljeno' : 'Nije došao'}</TD><TD>{item.status === 'reserved' && <div className="flex gap-2 flex-wrap"><Btn size="sm" onClick={() => void update(item, 'check-in')}>Evidentiraj dolazak</Btn><Btn size="sm" variant="secondary" onClick={() => void update(item, 'no-show')}>Nije došao</Btn></div>}</TD></TR>)}
        {visible.length === 0 && <tr><td colSpan={5} className="p-5 text-sm" style={{ color: C.ink3 }}>Nema rezervacija za ovu akciju.</td></tr>}
      </Table>
    </Card>
  </PageWrap>
}
