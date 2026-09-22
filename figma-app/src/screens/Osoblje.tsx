import { useState } from 'react'
import { KORISNICI_LISTA, type Korisnik, type Role, ROLE_LABELS } from '../data'
import { C, PageWrap, Card, CardHeader, Tabs, StatusBadge, Table, TR, TD, Btn, Modal, Input, Select, SearchBar, RoleBadge, EmptyState, ConfirmDialog } from '../components/ui'
import { Ic } from '../components/Icons'

const POZICIJE = ['Sve pozicije', 'Lekar', 'Medicinski tehničar', 'Koordinator', 'Referent za prijem', 'PR menadžer', 'IT administrator', 'Revizor']
const USERS_KEY = 'portal-figma-users-v1'
const INVITES_KEY = 'kapi-zivota.staff-invites'
const POSITIONS_KEY = 'portal-demo-positions-v1'
type Position = { poz: string; uloga: Role; popunjeno: number; slobodnih: number }
const INITIAL_POSITIONS: Position[] = [
  { poz: 'Lekar', uloga: 'medicinska', popunjeno: 3, slobodnih: 1 },
  { poz: 'Medicinski tehničar', uloga: 'prijem', popunjeno: 5, slobodnih: 2 },
  { poz: 'Koordinator akcija', uloga: 'koordinator', popunjeno: 3, slobodnih: 0 },
  { poz: 'Referent za prijem', uloga: 'prijem', popunjeno: 2, slobodnih: 1 },
  { poz: 'PR menadžer', uloga: 'pr_sadrzaj', popunjeno: 1, slobodnih: 0 },
  { poz: 'IT administrator', uloga: 'admin', popunjeno: 1, slobodnih: 0 },
]
function loadPositions(): Position[] {
  try { const saved = JSON.parse(localStorage.getItem(POSITIONS_KEY) || 'null'); return Array.isArray(saved) ? saved : INITIAL_POSITIONS } catch { return INITIAL_POSITIONS }
}
type Invite = { name: string; email: string; role: string; scope: string; sent: string; status?: string }
const DEMO_REGISTRATIONS: Invite[] = [
  { name: 'Dragan Popović', email: 'd.popovic@zavodbk.rs', role: 'prijem', scope: 'Beograd', sent: '19. sep 2026', status: 'odobreno' },
  { name: 'Katarina Đukić', email: 'k.djukic@zavodbk.rs', role: 'prijem', scope: 'Beograd', sent: '21. sep 2026', status: 'ceka' },
  { name: 'Milan Ristić', email: 'm.ristic@zavodbk.rs', role: 'medicinska', scope: 'Beograd', sent: '22. sep 2026', status: 'ceka' },
]
function loadUsers(): Korisnik[] {
  try { const saved = JSON.parse(localStorage.getItem(USERS_KEY) || 'null'); return Array.isArray(saved) ? saved : KORISNICI_LISTA } catch { return KORISNICI_LISTA }
}
function loadInvites(): Invite[] {
  try {
    const saved = JSON.parse(localStorage.getItem(INVITES_KEY) || '[]')
    const current: Invite[] = Array.isArray(saved) ? saved : []
    return [...current, ...DEMO_REGISTRATIONS.filter(item => !current.some(existing => existing.email === item.email))]
  } catch { return DEMO_REGISTRATIONS }
}

export default function Osoblje() {
  const [allUsers, setAllUsers] = useState(loadUsers)
  const [invites, setInvites] = useState(loadInvites)
  const [formName, setFormName] = useState('')
  const [formSurname, setFormSurname] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formRole, setFormRole] = useState<Role>('prijem')
  const [formBranch, setFormBranch] = useState('Beograd')
  const [editId, setEditId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [tab, setTab] = useState('korisnici')
  const [search, setSearch] = useState('')
  const [ulogaFilter, setUlogaFilter] = useState('Sve')
  const [selKor, setSelKor] = useState<Korisnik | null>(null)
  const [detModal, setDetModal] = useState(false)
  const [noviModal, setNoviModal] = useState(false)
  const [inviteModal, setInviteModal] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [positions, setPositions] = useState(loadPositions)
  const [positionModal, setPositionModal] = useState(false)
  const [oldPositionName, setOldPositionName] = useState<string | null>(null)
  const [positionName, setPositionName] = useState('')
  const [positionRole, setPositionRole] = useState<Role>('prijem')
  const [positionVacancies, setPositionVacancies] = useState('0')
  const openPosition = (position?: Position) => {
    setFeedback('')
    setOldPositionName(position?.poz || null); setPositionName(position?.poz || '')
    setPositionRole(position?.uloga || 'prijem'); setPositionVacancies(String(position?.slobodnih ?? 0))
    setPositionModal(true)
  }
  const savePosition = () => {
    const name = positionName.trim()
    const vacancies = Number(positionVacancies)
    if (!name || !Number.isInteger(vacancies) || vacancies < 0) { setFeedback('Unesite naziv pozicije i nenegativan ceo broj slobodnih mesta.'); return }
    if (positions.some(p => p.poz.toLowerCase() === name.toLowerCase() && p.poz !== oldPositionName)) { setFeedback('Pozicija sa tim nazivom već postoji.'); return }
    const old = positions.find(p => p.poz === oldPositionName)
    const item: Position = { poz: name, uloga: positionRole, popunjeno: old?.popunjeno || 0, slobodnih: vacancies }
    const next = old ? positions.map(p => p.poz === old.poz ? item : p) : [...positions, item]
    setPositions(next); localStorage.setItem(POSITIONS_KEY, JSON.stringify(next)); setPositionModal(false)
    setFeedback('Pozicija je sačuvana u lokalnoj demo evidenciji. Ovlašćenja se ne menjaju bez serverske autorizacije.')
  }

  const korisnici = allUsers.filter(k => {
    const matchSearch = `${k.ime} ${k.prezime} ${k.email}`.toLowerCase().includes(search.toLowerCase())
    const matchUloga = ulogaFilter === 'Sve' || k.uloga === ulogaFilter
    return matchSearch && matchUloga
  })

  const saveUsers = (next: Korisnik[]) => { setAllUsers(next); localStorage.setItem(USERS_KEY, JSON.stringify(next)) }
  const openUserForm = (user?: Korisnik) => {
    setEditId(user?.id || null)
    setFormName(user?.ime || '')
    setFormSurname(user?.prezime || '')
    setFormEmail(user?.email || '')
    setFormRole(user?.uloga || 'prijem')
    setFormBranch(user?.filijala || 'Beograd')
    setDetModal(false); setNoviModal(true)
  }
  const saveUser = () => {
    if (!formName.trim() || !formSurname.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(formEmail)) {
      setFeedback('Unesite ime, prezime i ispravnu adresu e-pošte.'); return
    }
    if (allUsers.some(user => user.email.toLowerCase() === formEmail.toLowerCase() && user.id !== editId)) {
      setFeedback('Korisnik sa tom adresom već postoji.'); return
    }
    const old = allUsers.find(user => user.id === editId)
    const nextUser: Korisnik = {
      id: old?.id || `u-${Date.now()}`, ime: formName.trim(), prezime: formSurname.trim(),
      email: formEmail.trim(), uloga: formRole, filijala: formBranch, aktivan: old?.aktivan ?? false,
      avatar: `${formName[0]}${formSurname[0]}`.toUpperCase(), mfa: old?.mfa ?? false,
      poslednjaPrijava: old?.poslednjaPrijava || 'Nije aktiviran',
    }
    saveUsers(old ? allUsers.map(user => user.id === old.id ? nextUser : user) : [nextUser, ...allUsers])
    setNoviModal(false)
    setFeedback(old ? 'Demo podaci korisnika su izmenjeni.' : 'Demo korisnik je evidentiran kao neaktivan. Prava prijava zahteva serversku aktivaciju.')
  }
  const recordInvite = () => {
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(formEmail)) { setFeedback('Unesite ispravnu adresu e-pošte.'); return }
    const next = [{ name: `${formName} ${formSurname}`.trim() || formEmail, email: formEmail.trim(), role: formRole, scope: formBranch, sent: new Date().toLocaleString('sr-Latn-RS'), status: 'ceka' }, ...invites]
    setInvites(next); localStorage.setItem(INVITES_KEY, JSON.stringify(next))
    setInviteModal(false)
    setFeedback('Pozivnica je evidentirana u demo portalu. E-pošta nije poslata; za to je potreban serverski servis.')
  }
  const updateInvite = (email: string, status: string) => {
    const next = invites.map(invite => invite.email === email ? { ...invite, status } : invite)
    setInvites(next); localStorage.setItem(INVITES_KEY, JSON.stringify(next))
  }

  return (
    <PageWrap>
      <Tabs tabs={[
        { id: 'korisnici', label: 'Korisnici' },
        { id: 'uloge', label: 'Uloge i dozvole' },
        { id: 'pozicije', label: 'Pozicije' },
        { id: 'registracije', label: 'Registracije' },
      ]} active={tab} onChange={setTab} />
      {feedback && <div role="status" className="rounded-lg px-4 py-2 text-sm" style={{ background: C.tealBg, color: C.teal2 }}>{feedback}</div>}

      {tab === 'korisnici' && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <SearchBar value={search} onChange={setSearch} placeholder="Pretraži korisnike..." />
            <select value={ulogaFilter} onChange={e => setUlogaFilter(e.target.value)}
              className="h-10 px-3 rounded-lg border text-sm outline-none" style={{ borderColor: C.s200, background: C.white, color: C.ink7 }}>
              <option value="Sve">Sve uloge</option>
              {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <div className="flex-1" />
            <Btn variant="secondary" onClick={() => { setFormEmail(''); setFormRole('prijem'); setFormBranch('Beograd'); setInviteModal(true) }}><Ic.Send /> Pozivnica</Btn>
            <Btn onClick={() => openUserForm()}><Ic.Plus /> Novi korisnik</Btn>
          </div>

          <Card>
            <Table headers={['Korisnik', 'Email', 'Uloga', 'Filijala', 'MFA', 'Status', 'Poslednja prijava', '']}>
              {korisnici.length === 0
                ? <tr><td colSpan={8}><EmptyState message="Nema korisnika za prikaz." /></td></tr>
                : korisnici.map(k => (
                  <TR key={k.id} onClick={() => { setSelKor(k); setDetModal(true) }}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: C.tealBg, color: C.teal2 }}>{k.avatar}</div>
                        <div>
                          <div className="font-medium text-sm" style={{ color: C.ink9 }}>{k.ime} {k.prezime}</div>
                        </div>
                      </div>
                    </TD>
                    <TD mono muted>{k.email}</TD>
                    <TD><RoleBadge uloga={k.uloga} /></TD>
                    <TD muted>{k.filijala}</TD>
                    <TD>
                      <span className="text-xs font-medium" style={{ color: k.mfa ? C.teal2 : C.ink3 }}>
                        {k.mfa ? '✓ Aktivno' : '—'}
                      </span>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: k.aktivan ? C.teal : C.s300 }} />
                        <span className="text-xs" style={{ color: k.aktivan ? C.teal2 : C.ink3 }}>{k.aktivan ? 'Aktivan' : 'Neaktivan'}</span>
                      </div>
                    </TD>
                    <TD mono muted>{k.poslednjaPrijava}</TD>
                    <TD>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <Btn variant="ghost" size="sm" onClick={() => openUserForm(k)}><Ic.Edit /></Btn>
                        <Btn variant="ghost" size="sm" onClick={() => { setSelKor(k); setConfirmDel(true) }}><Ic.Trash /></Btn>
                      </div>
                    </TD>
                  </TR>
                ))}
            </Table>
          </Card>
        </>
      )}

      {tab === 'uloge' && (
        <div className="grid lg:grid-cols-2 gap-4">
          {([
            { uloga: 'super_admin', dozvole: ['Pun pristup svim modulima', 'Upravljanje korisnicima i ulogama', 'Sistemska podešavanja', 'Audit log', 'API integracije', 'Delegiranje ovlašćenja'] },
            { uloga: 'admin', dozvole: ['Tehnička konfiguracija', 'Upravljanje uređajima', 'Incidenti i monitoring', 'API integracije', 'Generisanje izveštaja'] },
            { uloga: 'koordinator', dozvole: ['Upravljanje akcijama', 'Raspored i smene', 'Kapaciteti i kampanje', 'Pregled prijava'] },
            { uloga: 'prijem', dozvole: ['Pregled dodeljene smene', 'Registracija davalaca', 'Ažuriranje statusa'] },
            { uloga: 'medicinska', dozvole: ['Klinički radni sto', 'Medicinski zapisi (zaštićeno)', 'Laboratorija', 'Kontraindikacije'] },
            { uloga: 'pr_sadrzaj', dozvole: ['Redakcijski studio', 'Upravljanje kampanjama', 'Javni sadržaj i mediji', 'Pregled statistike'] },
            { uloga: 'revizor', dozvole: ['Čitanje audit loga', 'Pregled svih izveštaja', 'Pregled aktivnosti'] },
          ] as const).map(({ uloga, dozvole }) => (
            <Card key={uloga}>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <RoleBadge uloga={uloga} />
                  <span className="text-sm font-medium" style={{ color: C.ink7 }}>{ROLE_LABELS[uloga]}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dozvole.map(d => (
                    <span key={d} className="text-xs px-2 py-0.5 rounded" style={{ background: C.s100, color: C.ink5 }}>{d}</span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'pozicije' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader title="Pozicije u sistemu" action={<Btn size="sm" onClick={() => openPosition()}><Ic.Plus /> Dodaj</Btn>} />
            <Table headers={['Pozicija', 'Uloga', 'Popunjeno', 'Slobodnih', '']}>
              {positions.map(({ poz, uloga, popunjeno, slobodnih }) => (
                <TR key={poz}>
                  <TD><span className="font-medium">{poz}</span></TD>
                  <TD><RoleBadge uloga={uloga as any} /></TD>
                  <TD mono>{popunjeno}</TD>
                  <TD>
                    <span className="text-xs font-mono" style={{ color: slobodnih > 0 ? C.burgundy : C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{slobodnih}</span>
                  </TD>
                  <TD><Btn variant="ghost" size="sm" title={`Uredi ${poz}`} onClick={() => openPosition(positions.find(p => p.poz === poz))}><Ic.Edit /></Btn></TD>
                </TR>
              ))}
            </Table>
          </Card>

          <Card>
            <CardHeader title="Raspored smena — danas" />
            <div className="p-5">
              {[
                { smena: 'Jutarnja (07–12h)', osoblje: ['Dr. Milena Kovač (lekar)', 'Maja Ilić (prijem)', 'Ivan Pejić (tehničar)'] },
                { smena: 'Prepodnevna (10–15h)', osoblje: ['Dr. Jovan Todić (lekar)', 'Ana Stevanović (prijem)'] },
                { smena: 'Popodnevna (13–18h)', osoblje: ['Dr. Zoran Lukić (lekar)', 'Petar Cvejić (tehničar)'] },
              ].map(({ smena, osoblje }) => (
                <div key={smena} className="mb-4 last:mb-0">
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.ink3 }}>{smena}</div>
                  {osoblje.map(o => (
                    <div key={o} className="flex items-center gap-2 py-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.teal }} />
                      <span className="text-sm" style={{ color: C.ink7 }}>{o}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'registracije' && (
        <Card>
          <CardHeader title="Zahtevi za registraciju" action={
            <Btn size="sm" onClick={() => { setFormEmail(''); setFormRole('prijem'); setFormBranch('Beograd'); setInviteModal(true) }}><Ic.Send /> Evidentiraj pozivnicu</Btn>
          } />
          <Table headers={['Ime', 'Email', 'Uloga', 'Datum zahteva', 'Pozvao', 'Status', 'Akcija']}>
            {invites.map(invite => ({ ime: invite.name, email: invite.email, uloga: ROLE_LABELS[invite.role as Role] || invite.role, datum: invite.sent, pozvao: 'Super admin (demo)', status: invite.status || 'ceka' })).map(r => (
              <TR key={r.email}>
                <TD><span className="font-medium">{r.ime}</span></TD>
                <TD mono muted>{r.email}</TD>
                <TD muted>{r.uloga}</TD>
                <TD mono>{r.datum}</TD>
                <TD muted>{r.pozvao}</TD>
                <TD><StatusBadge status={r.status} /></TD>
                <TD>
                  {r.status === 'ceka' ? (
                    <div className="flex gap-2">
                      <Btn size="sm" onClick={() => updateInvite(r.email, 'odobreno')}><Ic.Check /></Btn>
                      <Btn variant="danger" size="sm" onClick={() => updateInvite(r.email, 'odbijeno')}><Ic.X /></Btn>
                    </div>
                  ) : <span className="text-xs" style={{ color: C.ink3 }}>{r.status}</span>}
                </TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {/* Detalji korisnika */}
      <Modal open={detModal} onClose={() => setDetModal(false)} title="Detalji korisnika">
        {selKor && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: C.s50 }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: C.tealBg, color: C.teal2 }}>{selKor.avatar}</div>
              <div>
                <div className="font-medium text-lg" style={{ color: C.navy }}>{selKor.ime} {selKor.prezime}</div>
                <div className="text-sm" style={{ color: C.ink3 }}>{selKor.email}</div>
                <div className="mt-1"><RoleBadge uloga={selKor.uloga} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: 'ID', v: selKor.id }, { l: 'Filijala', v: selKor.filijala },
                { l: 'MFA', v: selKor.mfa ? 'Aktivno' : 'Neaktivno' },
                { l: 'Status', v: selKor.aktivan ? 'Aktivan' : 'Neaktivan' },
                { l: 'Poslednja prijava', v: selKor.poslednjaPrijava },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div className="text-xs mb-0.5" style={{ color: C.ink3 }}>{l}</div>
                  <div className="text-sm font-medium" style={{ color: C.ink7 }}>{v}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Btn variant="secondary" onClick={() => setDetModal(false)}>Zatvori</Btn>
              <Btn onClick={() => openUserForm(selKor)}><Ic.Edit /> Izmeni</Btn>
              <Btn variant="danger" onClick={() => { setDetModal(false); setConfirmDel(true) }}><Ic.Trash /> Deaktiviraj</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Novi korisnik */}
      <Modal open={noviModal} onClose={() => setNoviModal(false)} title={editId ? 'Izmena korisnika' : 'Novi korisnik'} width="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Ime" placeholder="Ime" value={formName} onChange={setFormName} />
          <Input label="Prezime" placeholder="Prezime" value={formSurname} onChange={setFormSurname} />
          <Input label="Email" type="email" placeholder="email@zavodbk.rs" colSpan2 value={formEmail} onChange={setFormEmail} />
          <Select label="Uloga" options={Object.values(ROLE_LABELS)} value={ROLE_LABELS[formRole]} onChange={label => setFormRole((Object.entries(ROLE_LABELS).find(([, value]) => value === label)?.[0] || 'prijem') as Role)} />
          <Select label="Filijala" options={['Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Centrala']} value={formBranch} onChange={setFormBranch} />
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <Btn variant="secondary" onClick={() => setNoviModal(false)}>Otkaži</Btn>
          <Btn onClick={saveUser}>{editId ? 'Sačuvaj izmene' : 'Evidentiraj korisnika'}</Btn>
        </div>
      </Modal>

      {/* Pozivnica */}
      <Modal open={positionModal} onClose={() => setPositionModal(false)} title={oldPositionName ? 'Izmeni poziciju' : 'Dodaj poziciju'}>
        <div className="flex flex-col gap-4">
          {feedback && <p role="status" className="text-xs" style={{ color: C.burgundy }}>{feedback}</p>}
          <Input label="Naziv pozicije" value={positionName} onChange={setPositionName} />
          <Select label="Uloga u portalu" options={Object.values(ROLE_LABELS)} value={ROLE_LABELS[positionRole]} onChange={label => setPositionRole((Object.entries(ROLE_LABELS).find(([, value]) => value === label)?.[0] || 'prijem') as Role)} />
          <Input label="Slobodnih mesta" type="number" value={positionVacancies} onChange={setPositionVacancies} />
          <p className="text-xs" style={{ color: C.ink5 }}>Ovo menja samo demo evidenciju pozicija, ne stvarna ovlašćenja korisnika.</p>
          <div className="flex justify-end gap-2"><Btn variant="secondary" onClick={() => setPositionModal(false)}>Otkaži</Btn><Btn onClick={savePosition}>Sačuvaj</Btn></div>
        </div>
      </Modal>

      <Modal open={inviteModal} onClose={() => setInviteModal(false)} title="Pošalji pozivnicu">
        <div className="flex flex-col gap-4">
          <Input label="Email adresa" type="email" placeholder="novi.korisnik@zavodbk.rs" value={formEmail} onChange={setFormEmail} />
          <Select label="Uloga" options={Object.values(ROLE_LABELS)} value={ROLE_LABELS[formRole]} onChange={label => setFormRole((Object.entries(ROLE_LABELS).find(([, value]) => value === label)?.[0] || 'prijem') as Role)} />
          <Select label="Filijala" options={['Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Centrala']} value={formBranch} onChange={setFormBranch} />
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: C.ink7 }}>Poruka (opciono)</label>
            <textarea rows={3} className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none" style={{ borderColor: C.s200, background: C.s50 }} placeholder="Poruka uz pozivnicu..." />
          </div>
          <div className="flex gap-3 justify-end">
            <Btn variant="secondary" onClick={() => setInviteModal(false)}>Otkaži</Btn>
            <Btn onClick={recordInvite}><Ic.Send /> Evidentiraj pozivnicu (demo)</Btn>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDel} onClose={() => setConfirmDel(false)} onConfirm={() => { if (!selKor) return; saveUsers(allUsers.map(user => user.id === selKor.id ? { ...user, aktivan: false } : user)); setFeedback(`Korisnik ${selKor.ime} ${selKor.prezime} je deaktiviran u demo evidenciji.`) }} title="Deaktivacija korisnika"
        message={`Da li ste sigurni da želite da deaktivirate korisnika "${selKor?.ime} ${selKor?.prezime}"? Korisnik neće moći da se prijavi.`} danger />
    </PageWrap>
  )
}
