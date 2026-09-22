import { useState } from 'react'
import { KORISNICI_LISTA, type Korisnik, ROLE_LABELS } from '../data'
import { C, PageWrap, Card, CardHeader, Tabs, StatusBadge, Table, TR, TD, Btn, Modal, Input, Select, SearchBar, RoleBadge, EmptyState, ConfirmDialog } from '../components/ui'
import { Ic } from '../components/Icons'

const POZICIJE = ['Sve pozicije', 'Lekar', 'Medicinski tehničar', 'Koordinator', 'Referent za prijem', 'PR menadžer', 'IT administrator', 'Revizor']

export default function Osoblje() {
  const [tab, setTab] = useState('korisnici')
  const [search, setSearch] = useState('')
  const [ulogaFilter, setUlogaFilter] = useState('Sve')
  const [selKor, setSelKor] = useState<Korisnik | null>(null)
  const [detModal, setDetModal] = useState(false)
  const [noviModal, setNoviModal] = useState(false)
  const [inviteModal, setInviteModal] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  const korisnici = KORISNICI_LISTA.filter(k => {
    const matchSearch = `${k.ime} ${k.prezime} ${k.email}`.toLowerCase().includes(search.toLowerCase())
    const matchUloga = ulogaFilter === 'Sve' || k.uloga === ulogaFilter
    return matchSearch && matchUloga
  })

  return (
    <PageWrap>
      <Tabs tabs={[
        { id: 'korisnici', label: 'Korisnici' },
        { id: 'uloge', label: 'Uloge i dozvole' },
        { id: 'pozicije', label: 'Pozicije' },
        { id: 'registracije', label: 'Registracije' },
      ]} active={tab} onChange={setTab} />

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
            <Btn variant="secondary" onClick={() => setInviteModal(true)}><Ic.Send /> Pozivnica</Btn>
            <Btn onClick={() => setNoviModal(true)}><Ic.Plus /> Novi korisnik</Btn>
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
                        <Btn variant="ghost" size="sm"><Ic.Edit /></Btn>
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
            <CardHeader title="Pozicije u sistemu" action={<Btn size="sm"><Ic.Plus /> Dodaj</Btn>} />
            <Table headers={['Pozicija', 'Uloga', 'Popunjeno', 'Slobodnih', '']}>
              {[
                { poz: 'Lekar', uloga: 'medicinska', popunjeno: 3, slobodnih: 1 },
                { poz: 'Medicinski tehničar', uloga: 'prijem', popunjeno: 5, slobodnih: 2 },
                { poz: 'Koordinator akcija', uloga: 'koordinator', popunjeno: 3, slobodnih: 0 },
                { poz: 'Referent za prijem', uloga: 'prijem', popunjeno: 2, slobodnih: 1 },
                { poz: 'PR menadžer', uloga: 'pr_sadrzaj', popunjeno: 1, slobodnih: 0 },
                { poz: 'IT administrator', uloga: 'admin', popunjeno: 1, slobodnih: 0 },
              ].map(({ poz, uloga, popunjeno, slobodnih }) => (
                <TR key={poz}>
                  <TD><span className="font-medium">{poz}</span></TD>
                  <TD><RoleBadge uloga={uloga as any} /></TD>
                  <TD mono>{popunjeno}</TD>
                  <TD>
                    <span className="text-xs font-mono" style={{ color: slobodnih > 0 ? C.burgundy : C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{slobodnih}</span>
                  </TD>
                  <TD><Btn variant="ghost" size="sm"><Ic.Edit /></Btn></TD>
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
            <Btn size="sm" onClick={() => setInviteModal(true)}><Ic.Send /> Pošalji pozivnicu</Btn>
          } />
          <Table headers={['Ime', 'Email', 'Uloga', 'Datum zahteva', 'Pozvao', 'Status', 'Akcija']}>
            {[
              { ime: 'Dragan Popović', email: 'd.popovic@zavodbk.rs', uloga: 'Medicinski tehničar', datum: '19. sep 2026', pozvao: 'Vesna Marković', status: 'odobreno' },
              { ime: 'Katarina Đukić', email: 'k.djukic@zavodbk.rs', uloga: 'Prijem', datum: '21. sep 2026', pozvao: 'Nikola Vasić', status: 'ceka' },
              { ime: 'Milan Ristić', email: 'm.ristic@zavodbk.rs', uloga: 'Lekar', datum: '22. sep 2026', pozvao: 'Aleksandar Đurić', status: 'ceka' },
            ].map(r => (
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
                      <Btn size="sm"><Ic.Check /></Btn>
                      <Btn variant="danger" size="sm"><Ic.X /></Btn>
                    </div>
                  ) : <Btn variant="ghost" size="sm"><Ic.Eye /></Btn>}
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
              <Btn><Ic.Edit /> Izmeni</Btn>
              <Btn variant="danger" onClick={() => { setDetModal(false); setConfirmDel(true) }}><Ic.Trash /> Deaktiviraj</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Novi korisnik */}
      <Modal open={noviModal} onClose={() => setNoviModal(false)} title="Novi korisnik" width="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Ime" placeholder="Ime" />
          <Input label="Prezime" placeholder="Prezime" />
          <Input label="Email" type="email" placeholder="email@zavodbk.rs" colSpan2 />
          <Select label="Uloga" options={Object.values(ROLE_LABELS)} />
          <Select label="Filijala" options={['Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Centrala']} />
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <Btn variant="secondary" onClick={() => setNoviModal(false)}>Otkaži</Btn>
          <Btn onClick={() => setNoviModal(false)}>Kreiraj korisnika</Btn>
        </div>
      </Modal>

      {/* Pozivnica */}
      <Modal open={inviteModal} onClose={() => setInviteModal(false)} title="Pošalji pozivnicu">
        <div className="flex flex-col gap-4">
          <Input label="Email adresa" type="email" placeholder="novi.korisnik@zavodbk.rs" />
          <Select label="Uloga" options={Object.values(ROLE_LABELS)} />
          <Select label="Filijala" options={['Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Centrala']} />
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: C.ink7 }}>Poruka (opciono)</label>
            <textarea rows={3} className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none" style={{ borderColor: C.s200, background: C.s50 }} placeholder="Poruka uz pozivnicu..." />
          </div>
          <div className="flex gap-3 justify-end">
            <Btn variant="secondary" onClick={() => setInviteModal(false)}>Otkaži</Btn>
            <Btn onClick={() => setInviteModal(false)}><Ic.Send /> Pošalji pozivnicu</Btn>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDel} onClose={() => setConfirmDel(false)} onConfirm={() => {}} title="Deaktivacija korisnika"
        message={`Da li ste sigurni da želite da deaktivirate korisnika "${selKor?.ime} ${selKor?.prezime}"? Korisnik neće moći da se prijavi.`} danger />
    </PageWrap>
  )
}

