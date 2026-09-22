import { useEffect, useState } from 'react'
import { type Akcija } from '../data'
import { downloadCsv, loadActions, saveActions } from '../actionStore'
import { C, PageWrap, Card, CardHeader, Tabs, StatusBadge, Table, TR, TD, Btn, Modal, Input, Select, SearchBar, Progress, EmptyState } from '../components/ui'
import { Ic } from '../components/Icons'
import { PlaceSearch } from '../components/PlaceSearch'

const MESECI = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec']
const FILIJALE = ['Sve filijale', 'Beograd', 'Novi Sad', 'Niš', 'Kragujevac']
const YEARS = Array.from({ length: 101 }, (_, index) => 2000 + index)
const EMPTY_ACTION = { naziv: '', datum: '', lokacija: '', mesto: '', filijala: 'Beograd', kapacitet: '', koordinator: '' }

function dateOfAction(action: Akcija) {
  const match = action.datum.match(/^(\d{1,2})\.\s*([\p{L}]+)\s*(\d{4})/u)
  if (!match) return null
  const month = MESECI.findIndex(name => name.toLowerCase() === match[2].toLowerCase())
  return month < 0 ? null : { day: Number(match[1]), month, year: Number(match[3]) }
}

export default function Akcije() {
  const [actions, setActions] = useState<Akcija[]>(loadActions)
  const [tab, setTab] = useState('lista')
  const [search, setSearch] = useState('')
  const [filijala, setFilijala] = useState('Sve filijale')
  const [status, setStatus] = useState('Svi statusi')
  const [selAkcija, setSelAkcija] = useState<Akcija | null>(null)
  const [novaModal, setNovaModal] = useState(false)
  const [detaljiModal, setDetaljiModal] = useState(false)
  const [selectedMesec, setSelectedMesec] = useState(new Date().getMonth())
  const [selectedGodina, setSelectedGodina] = useState(new Date().getFullYear())
  const [form, setForm] = useState(EMPTY_ACTION)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => { saveActions(actions) }, [actions])

  const filtered = actions.filter(a => {
    const matchSearch = a.naziv.toLowerCase().includes(search.toLowerCase()) || a.lokacija.toLowerCase().includes(search.toLowerCase()) || (a.mesto || '').toLowerCase().includes(search.toLowerCase())
    const matchFil = filijala === 'Sve filijale' || a.filijala === filijala
    const statusValue = ({ Planirana: 'planirana', Aktivna: 'aktivna', Završena: 'zavrsena', Otkazana: 'otkazana' } as Record<string, string>)[status]
    const matchStatus = status === 'Svi statusi' || a.status === statusValue
    return matchSearch && matchFil && matchStatus
  })

  const monthOffset = (new Date(selectedGodina, selectedMesec, 1).getDay() + 6) % 7
  const kalendarDani = Array.from({ length: new Date(selectedGodina, selectedMesec + 1, 0).getDate() }, (_, i) => i + 1)

  function updateAction(id: string, status: Akcija['status']) {
    setActions(current => current.map(action => action.id === id ? { ...action, status } : action))
    setSelAkcija(current => current?.id === id ? { ...current, status } : current)
    setMessage('Promena akcije je sačuvana u ovom pregledaču.')
  }

  function saveAction() {
    if (!form.naziv.trim() || !form.datum || !form.lokacija.trim() || !form.mesto.trim() || Number(form.kapacitet) < 1) {
      setMessage('Popunite naziv, datum, lokaciju, mesto i kapacitet.'); return
    }
    const date = new Date(`${form.datum}T12:00:00`)
    const datum = `${date.getDate()}. ${MESECI[date.getMonth()].toLowerCase()} ${date.getFullYear()}`
    if (editingId) {
      setActions(current => current.map(action => action.id === editingId ? {
        ...action, naziv: form.naziv.trim(), datum, lokacija: form.lokacija.trim(), mesto: form.mesto.trim(),
        filijala: form.filijala, kapacitet: Number(form.kapacitet), koordinator: form.koordinator.trim(),
      } : action))
    } else {
      setActions(current => [{
        id: `AK-${date.getFullYear()}-${Date.now().toString().slice(-5)}`,
        naziv: form.naziv.trim(), datum, lokacija: form.lokacija.trim(), mesto: form.mesto.trim(), filijala: form.filijala,
        kapacitet: Number(form.kapacitet), prijavljeni: 0, donacije: 0,
        koordinator: form.koordinator.trim() || 'Nije dodeljen', status: 'planirana',
      }, ...current])
    }
    setNovaModal(false); setForm(EMPTY_ACTION); setEditingId(null)
    setMessage(editingId ? 'Akcija je izmenjena.' : 'Nova akcija je dodata u raspored.')
  }

  function editAction(action: Akcija) {
    const date = dateOfAction(action)
    setForm({ naziv: action.naziv, datum: date ? `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}` : '',
      lokacija: action.lokacija, mesto: action.mesto || '', filijala: action.filijala, kapacitet: String(action.kapacitet), koordinator: action.koordinator })
    setEditingId(action.id); setDetaljiModal(false); setNovaModal(true)
  }

  return (
    <PageWrap>
      <div className="flex items-center gap-3 flex-wrap">
        <Tabs tabs={[{ id: 'lista', label: 'Lista akcija' }, { id: 'kalendar', label: 'Kalendar' }, { id: 'istorija', label: 'Istorija' }]}
          active={tab} onChange={setTab} />
        <div className="flex-1" />
        <Btn onClick={() => { setEditingId(null); setForm(EMPTY_ACTION); setNovaModal(true) }}><Ic.Plus /> Nova akcija</Btn>
      </div>
      {message && <p role="status" className="text-xs" style={{ color: C.teal2 }}>{message}</p>}

      {tab === 'lista' && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <SearchBar value={search} onChange={setSearch} placeholder="Pretraži akcije..." />
            <select value={filijala} onChange={e => setFilijala(e.target.value)}
              className="h-10 px-3 rounded-lg border text-sm outline-none" style={{ borderColor: C.s200, background: C.white, color: C.ink7 }}>
              {FILIJALE.map(f => <option key={f}>{f}</option>)}
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="h-10 px-3 rounded-lg border text-sm outline-none" style={{ borderColor: C.s200, background: C.white, color: C.ink7 }}>
              {['Svi statusi', 'Planirana', 'Aktivna', 'Završena', 'Otkazana'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <Card>
            <Table headers={['ID', 'Naziv akcije', 'Datum', 'Lokacija / Filijala', 'Prijavljeni / Kapacitet', 'Donacije', 'Status', '']}>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState message="Nema akcija za prikaz." /></td></tr>
              ) : filtered.map(a => (
                <TR key={a.id} onClick={() => { setSelAkcija(a); setDetaljiModal(true) }}>
                  <TD mono muted>{a.id}</TD>
                  <TD><span className="font-medium" style={{ color: C.ink9 }}>{a.naziv}</span></TD>
                  <TD mono>{a.datum}</TD>
                  <TD>
                    <div style={{ color: C.ink7 }}>{a.lokacija}</div>
                    {a.mesto && <div className="text-xs" style={{ color: C.ink5 }}>{a.mesto}</div>}
                    <div className="text-xs" style={{ color: C.ink3 }}>{a.filijala}</div>
                  </TD>
                  <TD>
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <Progress value={a.prijavljeni} max={a.kapacitet} height={4} />
                      <span className="text-xs font-mono" style={{ color: C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{a.prijavljeni}/{a.kapacitet}</span>
                    </div>
                  </TD>
                  <TD mono>{a.donacije > 0 ? String(a.donacije) : '—'}</TD>
                  <TD><StatusBadge status={a.status} /></TD>
                  <TD><span style={{ color: C.s300, display: 'flex' }}><Ic.ChevronRight /></span></TD>
                </TR>
              ))}
            </Table>
          </Card>
        </>
      )}

      {tab === 'kalendar' && (
        <Card className="w-full max-w-[1100px] mx-auto">
          <CardHeader title="Kalendar akcija" action={
            <div className="flex items-center gap-2">
              <select value={selectedMesec} onChange={e => setSelectedMesec(Number(e.target.value))}
                className="h-8 px-2 rounded-lg border text-sm outline-none" style={{ borderColor: C.s200, background: C.white, color: C.ink7 }}>
                {MESECI.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <select value={selectedGodina} onChange={e => setSelectedGodina(Number(e.target.value))}
                className="h-8 px-2 rounded-lg border text-sm outline-none" style={{ borderColor: C.s200, background: C.white, color: C.ink7 }}>
                {YEARS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          } />
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map(d => (
                <div key={d} className="text-center text-xs font-medium py-1" style={{ color: C.ink3 }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: monthOffset }, (_, index) => <div key={`empty-${index}`} />)}
              {kalendarDani.map(dan => {
                const hasAkcija = actions.find(a => { const date = dateOfAction(a); return date?.day === dan && date.month === selectedMesec && date.year === selectedGodina })
                const today = new Date()
                const isToday = dan === today.getDate() && selectedMesec === today.getMonth() && selectedGodina === today.getFullYear()
                return (
                  <div key={dan}
                    role={hasAkcija ? 'button' : undefined}
                    tabIndex={hasAkcija ? 0 : undefined}
                    onClick={() => { if (hasAkcija) { setSelAkcija(hasAkcija); setDetaljiModal(true) } }}
                    onKeyDown={e => { if (hasAkcija && (e.key === 'Enter' || e.key === ' ')) { setSelAkcija(hasAkcija); setDetaljiModal(true) } }}
                    className={`h-16 sm:h-20 rounded-lg flex flex-col items-center justify-center text-xs transition-opacity ${hasAkcija ? 'cursor-pointer hover:opacity-80' : ''}`}
                    style={{
                      background: isToday ? C.navy : hasAkcija ? C.teal + '22' : C.s50,
                      border: hasAkcija && !isToday ? `1px solid ${C.teal}44` : '1px solid transparent',
                      color: isToday ? C.white : hasAkcija ? C.teal2 : C.ink5,
                      fontWeight: hasAkcija || isToday ? 600 : 400,
                    }}>
                    {dan}
                    {hasAkcija && !isToday && <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: C.teal }} />}
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t" style={{ borderColor: C.s100 }}>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: C.ink5 }}>
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.navy }} /> Danas
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: C.ink5 }}>
                <span className="w-2.5 h-2.5 rounded-sm border" style={{ background: C.teal + '22', borderColor: C.teal + '44' }} /> Akcija
              </div>
            </div>
          </div>
        </Card>
      )}

      {tab === 'istorija' && (
        <Card>
          <CardHeader title="Istorija akcija" subtitle="Sve završene i otkazane akcije" action={
            <Btn variant="secondary" size="sm" onClick={() => downloadCsv('istorija-akcija.csv', [
              ['ID', 'Naziv', 'Datum', 'Filijala', 'Donacije', 'Status'],
              ...actions.filter(a => a.status === 'zavrsena' || a.status === 'otkazana').map(a => [a.id, a.naziv, a.datum, a.filijala, a.donacije, a.status]),
            ])}><Ic.Download /> Izvezi</Btn>
          } />
          <Table headers={['ID', 'Naziv', 'Datum', 'Filijala', 'Donacije', 'Uspešnost', 'Status']}>
            {actions.filter(a => a.status === 'zavrsena' || a.status === 'otkazana').map(a => {
              const uspesnost = a.kapacitet > 0 ? Math.round((a.donacije / a.kapacitet) * 100) : 0
              return (
                <TR key={a.id}>
                  <TD mono muted>{a.id}</TD>
                  <TD><span className="font-medium" style={{ color: C.ink7 }}>{a.naziv}</span></TD>
                  <TD mono>{a.datum}</TD>
                  <TD muted>{a.filijala}</TD>
                  <TD mono>{a.donacije}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: C.s100 }}>
                        <div className="h-full rounded-full" style={{ width: `${uspesnost}%`, background: uspesnost > 80 ? C.teal : uspesnost > 50 ? '#d97706' : C.burgundy }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{uspesnost}%</span>
                    </div>
                  </TD>
                  <TD><StatusBadge status={a.status} /></TD>
                </TR>
              )
            })}
          </Table>
        </Card>
      )}

      {/* Detalji akcije modal */}
      <Modal open={detaljiModal} onClose={() => setDetaljiModal(false)} title="Detalji akcije" width="max-w-2xl">
        {selAkcija && (
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium mb-1" style={{ color: C.navy, fontFamily: 'DM Serif Display, Georgia, serif' }}>{selAkcija.naziv}</h3>
                <p className="text-sm" style={{ color: C.ink3 }}>{selAkcija.lokacija}{selAkcija.mesto ? `, ${selAkcija.mesto}` : ''} · {selAkcija.datum}</p>
              </div>
              <StatusBadge status={selAkcija.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { l: 'ID akcije', v: selAkcija.id },
                { l: 'Filijala', v: selAkcija.filijala },
                { l: 'Koordinator', v: selAkcija.koordinator },
                { l: 'Kapacitet', v: String(selAkcija.kapacitet) },
                { l: 'Prijavljeni', v: String(selAkcija.prijavljeni) },
                { l: 'Donacije', v: selAkcija.donacije > 0 ? String(selAkcija.donacije) : 'U toku' },
              ].map(({ l, v }) => (
                <div key={l} className="flex flex-col gap-0.5">
                  <span className="text-xs" style={{ color: C.ink3 }}>{l}</span>
                  <span className="text-sm font-medium" style={{ color: C.ink7 }}>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: C.ink3 }}>Popunjenost</span>
                <span style={{ color: C.ink7 }}>{selAkcija.prijavljeni}/{selAkcija.kapacitet} prijavljenih</span>
              </div>
              <Progress value={selAkcija.prijavljeni} max={selAkcija.kapacitet} />
            </div>
            <div className="flex gap-3 pt-2">
              {selAkcija.status === 'planirana' && <Btn onClick={() => updateAction(selAkcija.id, 'aktivna')}>Aktiviraj akciju</Btn>}
              {selAkcija.status === 'aktivna' && <Btn onClick={() => updateAction(selAkcija.id, 'zavrsena')}>Zatvori akciju</Btn>}
              <Btn variant="secondary" onClick={() => editAction(selAkcija)}><Ic.Edit /> Izmeni</Btn>
              {selAkcija.status !== 'zavrsena' && selAkcija.status !== 'otkazana' && <Btn variant="danger" onClick={() => updateAction(selAkcija.id, 'otkazana')}>Otkaži</Btn>}
            </div>
          </div>
        )}
      </Modal>

      {/* Nova akcija modal */}
      <Modal open={novaModal} onClose={() => setNovaModal(false)} title={editingId ? 'Izmeni akciju' : 'Nova akcija'} width="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Naziv akcije" value={form.naziv} onChange={naziv => setForm({ ...form, naziv })} placeholder="npr. Jesenji maraton" colSpan2 />
          <Input label="Datum" type="date" value={form.datum} onChange={datum => setForm({ ...form, datum })} />
          <Input label="Lokacija / adresa" value={form.lokacija} onChange={lokacija => setForm({ ...form, lokacija })} placeholder="npr. Dom omladine, Makedonska 22" colSpan2 />
          <PlaceSearch value={form.mesto} onChange={mesto => setForm({ ...form, mesto })} />
          <Select label="Filijala" options={FILIJALE.slice(1)} value={form.filijala} onChange={filijala => setForm({ ...form, filijala })} />
          <Input label="Kapacitet (donora)" type="number" value={form.kapacitet} onChange={kapacitet => setForm({ ...form, kapacitet })} placeholder="100" />
          <Input label="Koordinator" value={form.koordinator} onChange={koordinator => setForm({ ...form, koordinator })} placeholder="Ime koordinatora" />
          <Input label="Vreme početka" type="time" />
          <Input label="Vreme završetka" type="time" />
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <Btn variant="secondary" onClick={() => setNovaModal(false)}>Otkaži</Btn>
          <Btn onClick={saveAction}>{editingId ? 'Sačuvaj izmene' : 'Kreiraj akciju'}</Btn>
        </div>
      </Modal>
    </PageWrap>
  )
}
