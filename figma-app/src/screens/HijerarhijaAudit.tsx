import { useState } from 'react'
import { AUDIT_LOGOVI, KORISNICI_LISTA, ROLE_LABELS, type Role } from '../data'
import { C, PageWrap, Card, CardHeader, Tabs, StatusBadge, Table, TR, TD, Btn, SearchBar, RoleBadge } from '../components/ui'
import { Ic } from '../components/Icons'

export default function HijerarhijaAudit({ initialTab = 'audit' }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab)
  const [search, setSearch] = useState('')
  const [filterRezultat, setFilterRezultat] = useState('Svi')

  const filteredLogs = AUDIT_LOGOVI.filter(a => {
    const matchSearch = a.korisnik.toLowerCase().includes(search.toLowerCase())
      || a.akcija.toLowerCase().includes(search.toLowerCase())
      || a.resurs.toLowerCase().includes(search.toLowerCase())
    const matchRez = filterRezultat === 'Svi' || a.rezultat === filterRezultat.toLowerCase()
    return matchSearch && matchRez
  })

  // Hijerarhija
  const hijerarhija = [
    {
      uloga: 'super_admin' as Role, nivo: 1,
      korisnici: KORISNICI_LISTA.filter(k => k.uloga === 'super_admin'),
      podredjeni: ['admin', 'koordinator', 'medicinska', 'pr_sadrzaj', 'revizor'],
    },
    {
      uloga: 'admin' as Role, nivo: 2,
      korisnici: KORISNICI_LISTA.filter(k => k.uloga === 'admin'),
      podredjeni: [],
    },
    {
      uloga: 'koordinator' as Role, nivo: 2,
      korisnici: KORISNICI_LISTA.filter(k => k.uloga === 'koordinator'),
      podredjeni: ['prijem'],
    },
    {
      uloga: 'medicinska' as Role, nivo: 2,
      korisnici: KORISNICI_LISTA.filter(k => k.uloga === 'medicinska'),
      podredjeni: [],
    },
    {
      uloga: 'prijem' as Role, nivo: 3,
      korisnici: KORISNICI_LISTA.filter(k => k.uloga === 'prijem'),
      podredjeni: [],
    },
    {
      uloga: 'pr_sadrzaj' as Role, nivo: 2,
      korisnici: KORISNICI_LISTA.filter(k => k.uloga === 'pr_sadrzaj'),
      podredjeni: [],
    },
    {
      uloga: 'revizor' as Role, nivo: 2,
      korisnici: KORISNICI_LISTA.filter(k => k.uloga === 'revizor'),
      podredjeni: [],
    },
  ]

  return (
    <PageWrap>
      <Tabs tabs={[
        { id: 'audit', label: 'Audit log' },
        { id: 'hijerarhija', label: 'Sistemska hijerarhija' },
        { id: 'delegacije', label: 'Delegacije i odgovornosti' },
      ]} active={tab} onChange={setTab} />

      {tab === 'audit' && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <SearchBar value={search} onChange={setSearch} placeholder="Pretraži audit log..." />
            <select value={filterRezultat} onChange={e => setFilterRezultat(e.target.value)}
              className="h-10 px-3 rounded-lg border text-sm outline-none" style={{ borderColor: C.s200, background: C.white, color: C.ink7 }}>
              {['Svi', 'Uspeh', 'Greška', 'Upozorenje'].map(r => <option key={r}>{r}</option>)}
            </select>
            <Btn variant="secondary"><Ic.Download /> Izvezi</Btn>
          </div>

          <Card>
            <Table headers={['Log ID', 'Korisnik', 'Uloga', 'Akcija', 'Resurs', 'IP adresa', 'Vreme', 'Rezultat']}>
              {filteredLogs.map(a => (
                <TR key={a.id}>
                  <TD mono muted>{a.id}</TD>
                  <TD><span className="font-medium text-sm">{a.korisnik}</span></TD>
                  <TD><RoleBadge uloga={a.uloga} /></TD>
                  <TD>
                    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: C.s100, color: C.ink5, fontFamily: 'JetBrains Mono, monospace' }}>
                      {a.akcija}
                    </span>
                  </TD>
                  <TD muted>{a.resurs}</TD>
                  <TD mono muted>{a.ip}</TD>
                  <TD mono>{a.vreme}</TD>
                  <TD><StatusBadge status={a.rezultat} /></TD>
                </TR>
              ))}
            </Table>
          </Card>

          {/* Statistike */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { l: 'Ukupno akcija danas', v: AUDIT_LOGOVI.length, color: C.navy },
              { l: 'Greške i odbijanja', v: AUDIT_LOGOVI.filter(a => a.rezultat === 'greska').length, color: C.burgundy },
              { l: 'Upozorenja', v: AUDIT_LOGOVI.filter(a => a.rezultat === 'upozorenje').length, color: '#d97706' },
            ].map(({ l, v, color }) => (
              <Card key={l}>
                <div className="p-5">
                  <div className="text-xs mb-1" style={{ color: C.ink3 }}>{l}</div>
                  <div className="text-2xl font-medium" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === 'hijerarhija' && (
        <div className="flex flex-col gap-5">
          {/* Vizuelna hijerarhija */}
          <Card>
            <CardHeader title="Organizaciona hijerarhija portala" subtitle="Prikaz uloga i nadređenosti" />
            <div className="p-6">
              {[1, 2, 3].map(nivo => (
                <div key={nivo} className="mb-6 last:mb-0">
                  <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: C.ink3 }}>
                    {nivo === 1 ? 'Nivo 1 — Upravljanje' : nivo === 2 ? 'Nivo 2 — Operativno' : 'Nivo 3 — Izvršno'}
                  </div>
                  <div className="flex flex-wrap gap-3" style={{ paddingLeft: `${(nivo - 1) * 2}rem` }}>
                    {hijerarhija.filter(h => h.nivo === nivo).map(h => (
                      <div key={h.uloga} className="rounded-xl border p-4 min-w-[180px]"
                        style={{ borderColor: C.s200, background: nivo === 1 ? C.navy : nivo === 2 ? C.s50 : C.white }}>
                        <RoleBadge uloga={h.uloga} />
                        <div className="mt-2 text-xs" style={{ color: nivo === 1 ? C.teal3 : C.ink3 }}>
                          {h.korisnici.length} korisnik{h.korisnici.length !== 1 ? 'a' : ''}
                        </div>
                        {h.korisnici.slice(0, 2).map(k => (
                          <div key={k.id} className="text-xs mt-1" style={{ color: nivo === 1 ? '#8e97a8' : C.ink5 }}>
                            {k.ime} {k.prezime}
                          </div>
                        ))}
                        {h.korisnici.length > 2 && (
                          <div className="text-xs mt-0.5" style={{ color: nivo === 1 ? '#5a6378' : C.ink3 }}>+{h.korisnici.length - 2} više</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Tabela odgovornosti */}
          <Card>
            <CardHeader title="Matrica pristupa po modulima" />
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: C.s50 }}>
                    <th className="text-left px-4 py-3 font-medium" style={{ color: C.ink3 }}>Modul</th>
                    {(['super_admin', 'admin', 'koordinator', 'prijem', 'medicinska', 'pr_sadrzaj', 'revizor'] as Role[]).map(u => (
                      <th key={u} className="text-center px-3 py-3 font-medium" style={{ color: C.ink3 }}>{ROLE_LABELS[u].split(' ')[0]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { modul: 'Kontrolni centar', pristup: ['✓', '✓', '○', '—', '—', '—', '○'] },
                    { modul: 'Akcije', pristup: ['✓', '○', '✓', '○', '—', '○', '○'] },
                    { modul: 'Prijem davalaca', pristup: ['✓', '○', '✓', '✓', '—', '—', '—'] },
                    { modul: 'Medicinska služba', pristup: ['✓', '—', '—', '—', '✓', '—', '—'] },
                    { modul: 'Kampanje', pristup: ['✓', '—', '✓', '—', '—', '✓', '—'] },
                    { modul: 'PR i sadržaj', pristup: ['✓', '—', '—', '—', '—', '✓', '—'] },
                    { modul: 'Red odobravanja', pristup: ['✓', '—', '—', '—', '—', '—', '○'] },
                    { modul: 'Izveštaji', pristup: ['✓', '✓', '○', '—', '—', '—', '✓'] },
                    { modul: 'Osoblje', pristup: ['✓', '✓', '—', '—', '—', '—', '—'] },
                    { modul: 'Pristup i uređaji', pristup: ['✓', '✓', '—', '—', '—', '—', '—'] },
                    { modul: 'Hijerarhija / Audit', pristup: ['✓', '—', '—', '—', '—', '—', '✓'] },
                    { modul: 'API i integracije', pristup: ['✓', '✓', '—', '—', '—', '—', '—'] },
                  ].map(({ modul, pristup }) => (
                    <tr key={modul} className="border-t" style={{ borderColor: C.s100 }}>
                      <td className="px-4 py-2.5 font-medium text-xs" style={{ color: C.ink7 }}>{modul}</td>
                      {pristup.map((p, i) => (
                        <td key={i} className="text-center px-3 py-2.5" style={{ color: p === '✓' ? C.teal2 : p === '○' ? '#d97706' : C.s300 }}>
                          {p}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center gap-6 px-4 py-3 border-t text-xs" style={{ borderColor: C.s100, color: C.ink3 }}>
                <span><span style={{ color: C.teal2 }}>✓</span> Pun pristup</span>
                <span><span style={{ color: '#d97706' }}>○</span> Ograničen pristup (čitanje)</span>
                <span><span style={{ color: C.s300 }}>—</span> Bez pristupa</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'delegacije' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader title="Aktivne delegacije" action={<Btn size="sm"><Ic.Plus /> Nova</Btn>} />
            <div className="p-5">
              {[
                { od: 'Aleksandar Đurić (SA)', na: 'Vesna Marković (Admin)', ovlascenje: 'Upravljanje korisnicima', period: '22–29. sep 2026', status: 'aktivna' },
                { od: 'Nikola Vasić (Koord.)', na: 'Ana Jović (Koord.)', ovlascenje: 'Koordinacija akcija — Novi Sad', period: '20–25. sep 2026', status: 'aktivna' },
              ].map(({ od, na, ovlascenje, period, status }) => (
                <div key={od} className="mb-4 last:mb-0 p-4 rounded-xl border" style={{ borderColor: C.s200 }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-medium" style={{ color: C.ink7 }}>{ovlascenje}</div>
                    <StatusBadge status={status} />
                  </div>
                  <div className="text-xs" style={{ color: C.ink3 }}>
                    <span style={{ color: C.ink5 }}>{od}</span> → <span style={{ color: C.ink5 }}>{na}</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: C.ink3 }}>{period}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Odgovornosti po filijali" />
            <div className="p-5">
              {[
                { filijala: 'Beograd', odgovorni: { koordinator: 'Nikola Vasić', lekar: 'Dr. Milena Kovač', prijem: 'Maja Ilić' } },
                { filijala: 'Novi Sad', odgovorni: { koordinator: 'Ana Jović', lekar: 'Dr. Zoran Lukić', prijem: '—' } },
                { filijala: 'Niš', odgovorni: { koordinator: 'Marija Đorić (nek.)', lekar: 'Dr. Petar Ilić', prijem: '—' } },
              ].map(({ filijala, odgovorni }) => (
                <div key={filijala} className="mb-5 last:mb-0">
                  <div className="font-medium text-sm mb-2" style={{ color: C.navy }}>{filijala}</div>
                  {Object.entries(odgovorni).map(([r, o]) => (
                    <div key={r} className="flex justify-between py-1.5 text-xs">
                      <span style={{ color: C.ink3 }}>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                      <span style={{ color: C.ink7 }}>{o}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </PageWrap>
  )
}
