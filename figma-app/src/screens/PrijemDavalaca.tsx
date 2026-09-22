import { useState } from 'react'
import { type Davalac } from '../data'
import { loadActions } from '../actionStore'
import { loadDonors, saveDonors } from '../donorStore'
import { C, PageWrap, Card, CardHeader, StatusBadge, Table, TR, TD, Btn, Modal, Input, Select, SearchBar, EmptyState } from '../components/ui'
import { Ic } from '../components/Icons'

function BloodBadge({ tip }: { tip: string }) {
  return (
    <span className="inline-flex items-center justify-center w-10 h-6 rounded text-white text-xs font-medium"
      style={{ background: tip.includes('−') ? '#8B1A2D' : '#1a3068', fontFamily: 'JetBrains Mono, monospace' }}>
      {tip}
    </span>
  )
}

export default function PrijemDavalaca() {
  const [actions] = useState(loadActions)
  const [donors, setDonors] = useState(loadDonors)
  const [actionId, setActionId] = useState(() => loadActions().find(a => a.status === 'aktivna')?.id || loadActions()[0]?.id || '')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('svi')
  const [selDavalac, setSelDavalac] = useState<Davalac | null>(null)
  const [noviModal, setNoviModal] = useState(false)
  const [detaljiModal, setDetaljiModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSurname, setNewSurname] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newBlood, setNewBlood] = useState('Nepoznata')
  const [feedback, setFeedback] = useState('')

  const aktivnaAkcija = actions.find(a => a.id === actionId)
  const actionDonors = donors.filter(d => d.akcija === actionId)

  const updateDonor = (donor: Davalac) => {
    const next = donors.map(d => d.id === donor.id ? donor : d)
    setDonors(next)
    saveDonors(next)
    setSelDavalac(donor)
  }

  const registerDonor = () => {
    if (!newName.trim() || !newSurname.trim() || !newPhone.trim() || !actionId) {
      setFeedback('Unesite ime, prezime i telefon, pa izaberite akciju.')
      return
    }
    const donor: Davalac = {
      id: `D-${Date.now()}`, ime: newName.trim(), prezime: newSurname.trim(),
      krvnaGrupa: newBlood, status: 'ceka', akcija: actionId,
      vreme: new Date().toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' }),
      prviPut: true, telefon: newPhone.trim(),
    }
    const next = [donor, ...donors]
    setDonors(next)
    saveDonors(next)
    setSelDavalac(donor)
    setFeedback(`Davalac ${donor.ime} ${donor.prezime} je dodat u izabranu akciju.`)
    setNoviModal(false)
    setNewName(''); setNewSurname(''); setNewPhone('')
  }

  const filtered = actionDonors.filter(d => {
    const matchSearch = `${d.ime} ${d.prezime}`.toLowerCase().includes(search.toLowerCase()) || d.id.includes(search)
    const matchStatus = statusFilter === 'svi' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    ceka: actionDonors.filter(d => d.status === 'ceka').length,
    pregled: actionDonors.filter(d => d.status === 'pregled').length,
    donacija: actionDonors.filter(d => d.status === 'donacija').length,
    zavrseno: actionDonors.filter(d => d.status === 'zavrseno').length,
    odbijen: actionDonors.filter(d => d.status === 'odbijen').length,
  }

  return (
    <PageWrap>
      {/* Kontekst akcije */}
      {aktivnaAkcija && (
        <div className="rounded-xl border p-4 flex items-center justify-between" style={{ background: C.tealBg, borderColor: C.teal + '40' }}>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: C.teal }} />
              <span className="font-medium text-sm" style={{ color: C.teal2 }}>Izabrana akcija: {aktivnaAkcija.naziv}</span>
            </div>
            <span className="text-xs" style={{ color: C.ink5 }}>{aktivnaAkcija.lokacija} · {aktivnaAkcija.datum}</span>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: C.ink5, fontFamily: 'JetBrains Mono, monospace' }}>
            <span>{aktivnaAkcija.donacije} donacija</span>
            <span>{aktivnaAkcija.prijavljeni} prijavljenih</span>
          </div>
        </div>
      )}

      {/* Status traka */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { key: 'ceka', label: 'Čeka', color: '#d97706' },
          { key: 'pregled', label: 'Pregled', color: '#1d4ed8' },
          { key: 'donacija', label: 'Donacija', color: C.teal },
          { key: 'zavrseno', label: 'Završeno', color: '#15803d' },
          { key: 'odbijen', label: 'Odbijen', color: C.burgundy },
        ].map(({ key, label, color }) => (
          <button key={key} onClick={() => setStatusFilter(statusFilter === key ? 'svi' : key)}
            className="rounded-xl p-3 border text-left transition-all"
            style={{
              background: statusFilter === key ? color + '18' : C.white,
              borderColor: statusFilter === key ? color + '60' : C.s100,
            }}>
            <div className="text-xl font-medium mb-0.5" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>
              {stats[key as keyof typeof stats]}
            </div>
            <div className="text-xs" style={{ color: C.ink3 }}>{label}</div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select aria-label="Izaberi akciju" value={actionId} onChange={e => { setActionId(e.target.value); setSelDavalac(null); setStatusFilter('svi') }}
          className="h-10 px-3 rounded-lg border text-sm outline-none" style={{ borderColor: C.s200, background: C.white, color: C.ink7 }}>
          {actions.map(a => <option key={a.id} value={a.id}>{a.naziv} · {a.datum}</option>)}
        </select>
        <SearchBar value={search} onChange={setSearch} placeholder="Pretraži po imenu ili ID-u..." />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border text-sm outline-none" style={{ borderColor: C.s200, background: C.white, color: C.ink7 }}>
          {[['svi', 'Svi'], ['ceka', 'Čeka'], ['pregled', 'Pregled'], ['donacija', 'Donacija'], ['zavrseno', 'Završeno'], ['odbijen', 'Odbijen']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <Btn onClick={() => setNoviModal(true)}><Ic.Plus /> Novi davalac</Btn>
      </div>
      {feedback && <div role="status" className="rounded-lg px-4 py-2 text-sm" style={{ background: C.tealBg, color: C.teal2 }}>{feedback}</div>}

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card>
            <Table headers={['ID', 'Ime i prezime', 'Krvna gr.', 'Vreme', 'Tip davaoca', 'Status', '']}>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><EmptyState message="Nema davalaca za prikaz." /></td></tr>
              ) : filtered.map(d => (
                <TR key={d.id} onClick={() => { setSelDavalac(d); setDetaljiModal(true) }}>
                  <TD mono muted>{d.id}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ color: C.ink9 }}>{d.ime} {d.prezime}</span>
                      {d.prviPut && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: C.tealBg, color: C.teal2 }}>Novi</span>}
                    </div>
                  </TD>
                  <TD><BloodBadge tip={d.krvnaGrupa} /></TD>
                  <TD mono>{d.vreme}</TD>
                  <TD muted>{d.prviPut ? 'Prva donacija' : 'Redovan davalac'}</TD>
                  <TD><StatusBadge status={d.status} /></TD>
                  <TD><span style={{ color: C.s300, display: 'flex' }}><Ic.ChevronRight /></span></TD>
                </TR>
              ))}
            </Table>
          </Card>
        </div>

        {/* Detalji panel */}
        <Card>
          {selDavalac ? (
            <>
              <CardHeader title={`${selDavalac.ime} ${selDavalac.prezime}`} subtitle={selDavalac.id} />
              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <BloodBadge tip={selDavalac.krvnaGrupa} />
                  <StatusBadge status={selDavalac.status} />
                </div>
                <div className="flex flex-col gap-2.5">
                  {[
                    { l: 'Telefon', v: selDavalac.telefon },
                    { l: 'Vreme prijave', v: selDavalac.vreme },
                    { l: 'Akcija', v: selDavalac.akcija },
                    { l: 'Tip davaoca', v: selDavalac.prviPut ? 'Prva donacija' : 'Redovan davalac' },
                  ].map(({ l, v }) => (
                    <div key={l} className="flex justify-between py-2 border-b" style={{ borderColor: C.s50 }}>
                      <span className="text-xs" style={{ color: C.ink3 }}>{l}</span>
                      <span className="text-xs font-medium" style={{ color: C.ink7 }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Akcije za promenu statusa */}
                <div className="flex flex-col gap-2 pt-1">
                  {selDavalac.status === 'ceka' && (
                    <Btn onClick={() => updateDonor({ ...selDavalac, status: 'pregled' })}>
                      → Uputi na pregled
                    </Btn>
                  )}
                  <span className="text-xs" style={{ color: C.ink5 }}>Medicinsku odluku donosi isključivo medicinska služba.</span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-5">
              <EmptyState message="Izaberite davaoca iz liste za pregled detalja." />
            </div>
          )}
        </Card>
      </div>

      {/* Detalji modal */}
      <Modal open={detaljiModal} onClose={() => setDetaljiModal(false)} title="Kartica davaoca">
        {selDavalac && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: C.navy }}>{selDavalac.ime} {selDavalac.prezime}</div>
                <div className="text-xs mt-0.5 font-mono" style={{ color: C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{selDavalac.id}</div>
              </div>
              <BloodBadge tip={selDavalac.krvnaGrupa} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { l: 'Status', v: <StatusBadge status={selDavalac.status} /> },
                { l: 'Tip', v: selDavalac.prviPut ? 'Prva donacija' : 'Redovan davalac' },
                { l: 'Telefon', v: selDavalac.telefon },
                { l: 'Vreme prijave', v: selDavalac.vreme },
                { l: 'Akcija', v: selDavalac.akcija },
                { l: 'Krvna grupa', v: selDavalac.krvnaGrupa },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div className="text-xs mb-0.5" style={{ color: C.ink3 }}>{l}</div>
                  <div className="font-medium">{v}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <Btn variant="secondary" onClick={() => setDetaljiModal(false)}>Zatvori</Btn>
              {selDavalac.status === 'ceka' && <Btn onClick={() => { updateDonor({ ...selDavalac, status: 'pregled' }); setDetaljiModal(false) }}>Uputi na pregled</Btn>}
            </div>
          </div>
        )}
      </Modal>

      {/* Novi davalac modal */}
      <Modal open={noviModal} onClose={() => setNoviModal(false)} title="Registracija novog davaoca" width="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Ime" placeholder="Ime" value={newName} onChange={setNewName} />
          <Input label="Prezime" placeholder="Prezime" value={newSurname} onChange={setNewSurname} />
          <Input label="JMBG" placeholder="U produkciji samo preko zaštićenog servisa" colSpan2 />
          <Input label="Datum rođenja" type="date" />
          <Input label="Pol" placeholder="" />
          <Input label="Telefon" placeholder="+381 60 000 0000" colSpan2 value={newPhone} onChange={setNewPhone} />
          <Input label="Email" type="email" placeholder="donor@email.com" colSpan2 />
          <Select label="Krvna grupa" options={['Nepoznata', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−']} value={newBlood} onChange={setNewBlood} />
          <Select label="Tip donacije" options={['Punom krvlju', 'Plazmom', 'Trombocitima', 'Eritrocitima']} />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium mb-1.5" style={{ color: C.ink7 }}>Napomena</label>
          <textarea rows={3} className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
            style={{ borderColor: C.s200, background: C.s50, color: C.ink9 }} placeholder="Opciona napomena..." />
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <Btn variant="secondary" onClick={() => setNoviModal(false)}>Otkaži</Btn>
          <Btn onClick={registerDonor}>Registruj davaoca</Btn>
        </div>
      </Modal>
    </PageWrap>
  )
}
