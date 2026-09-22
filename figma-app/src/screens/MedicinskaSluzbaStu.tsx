import { useState } from 'react'
import { type Davalac } from '../data'
import { loadActions } from '../actionStore'
import { loadDonors, saveDonors } from '../donorStore'
import { C, PageWrap, Card, CardHeader, Tabs, StatusBadge, Table, TR, TD, Btn, Modal, EmptyState } from '../components/ui'
import { Ic } from '../components/Icons'

function BloodBadge({ tip }: { tip: string }) {
  return <span className="inline-flex items-center justify-center w-10 h-6 rounded text-white text-xs font-medium" style={{ background: tip.includes('−') ? '#8B1A2D' : '#1a3068', fontFamily: 'JetBrains Mono, monospace' }}>{tip}</span>
}

const LAB_UZORCI = [
  { id: 'LAB-4482', donor: 'Milica Petrović', test: 'HBsAg, HCV Ab, HIV 1/2 Ag/Ab, Sifilis', primljeno: '08:20', rezultat: 'Negativan', status: 'zavrseno' },
  { id: 'LAB-4483', donor: 'Stefan Nikolić', test: 'Hb, ABO, Reakija kompatibilnosti', primljeno: '08:38', rezultat: '—', status: 'ceka' },
  { id: 'LAB-4484', donor: 'Ana Jovanović', test: 'HBsAg, HCV Ab, HIV 1/2 Ag/Ab, Sifilis', primljeno: '08:52', rezultat: 'Negativan', status: 'zavrseno' },
  { id: 'LAB-4485', donor: 'Marko Stojanović', test: 'Hb merenje', primljeno: '09:05', rezultat: '—', status: 'pregled' },
  { id: 'LAB-4486', donor: 'Nikola Vasić', test: 'HBsAg, HCV Ab, HIV 1/2 Ag/Ab, Sifilis, Hb, ABO', primljeno: '09:32', rezultat: '—', status: 'pregled' },
]

const KONTRA = [
  { donor: 'Jelena Đorđević', razlog: 'Uzimanje antibiotika', tip: 'Privremena', period: '14 dana', datum: '22. sep 2026', lekar: 'Dr. Kovač' },
  { donor: 'Saša Lukić', razlog: 'Grip, povišena temperatura', tip: 'Privremena', period: '21 dan', datum: '20. sep 2026', lekar: 'Dr. Marković' },
  { donor: 'Milena Todić', razlog: 'Hepatitis B u istoriji', tip: 'Trajna', period: 'Trajno', datum: '10. avg 2026', lekar: 'Dr. Kovač' },
]

export default function MedicinskaSluzbaStu({ uloga: _uloga }: { uloga: string }) {
  const [actions] = useState(loadActions)
  const [donors, setDonors] = useState(loadDonors)
  const [actionId, setActionId] = useState(() => loadActions().find(a => a.status === 'aktivna')?.id || loadActions()[0]?.id || '')
  const [tab, setTab] = useState('pregled')
  const [selModal, setSelModal] = useState(false)
  const [selDonor, setSelDonor] = useState<Davalac | null>(null)

  const pregled_davalaci = donors.filter(d => d.akcija === actionId && (d.status === 'pregled' || d.status === 'donacija'))
  const updateDonor = (status: Davalac['status']) => {
    if (!selDonor) return
    const next = donors.map(d => d.id === selDonor.id ? { ...d, status } : d)
    setDonors(next)
    saveDonors(next)
    setSelDonor(null)
    setSelModal(false)
  }

  return (
    <PageWrap>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium" style={{ color: C.ink7 }}>Akcija</span>
        <select aria-label="Izaberi akciju" value={actionId} onChange={e => { setActionId(e.target.value); setSelDonor(null) }}
          className="h-10 px-3 rounded-lg border text-sm outline-none" style={{ borderColor: C.s200, background: C.white, color: C.ink7 }}>
          {actions.map(a => <option key={a.id} value={a.id}>{a.naziv} · {a.datum}</option>)}
        </select>
      </div>
      <Tabs tabs={[
        { id: 'pregled', label: 'Medicinski pregled' },
        { id: 'laboratorija', label: 'Laboratorija' },
        { id: 'kontraindikacije', label: 'Kontraindikacije' },
        { id: 'protokoli', label: 'Protokoli i kriterijumi' },
      ]} active={tab} onChange={setTab} />

      {tab === 'pregled' && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <Card>
            <CardHeader title="Donori na medicinskom pregledu" subtitle={`${pregled_davalaci.length} u izabranoj akciji`} />
              <Table headers={['Davalac', 'Krvna gr.', 'Tip davaoca', 'Lekar', 'Upućen u', 'Status', '']}>
                {pregled_davalaci.length === 0
                  ? <tr><td colSpan={7}><EmptyState message="Nema donora na pregledu." /></td></tr>
                  : pregled_davalaci.map(d => (
                    <TR key={d.id} onClick={() => { setSelDonor(d); setSelModal(true) }}>
                      <TD><span className="font-medium">{d.ime} {d.prezime}</span></TD>
                      <TD><BloodBadge tip={d.krvnaGrupa} /></TD>
                      <TD muted>{d.prviPut ? 'Prva donacija' : 'Redovan'}</TD>
                      <TD muted>Dr. M. Kovač</TD>
                      <TD mono>08:00–12:00</TD>
                      <TD><StatusBadge status={d.status} /></TD>
                      <TD><span style={{ color: C.s300, display: 'flex' }}><Ic.ChevronRight /></span></TD>
                    </TR>
                  ))}
              </Table>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader title="Vitalni parametri" subtitle="Minimalni kriterijumi za donaciju" />
              <div className="p-4">
                {[
                  { l: 'Hemoglobin — žene', v: '≥ 125 g/L', ok: true },
                  { l: 'Hemoglobin — muškarci', v: '≥ 135 g/L', ok: true },
                  { l: 'Sistolni pritisak', v: '≤ 180 mmHg', ok: true },
                  { l: 'Dijastolni pritisak', v: '≤ 100 mmHg', ok: true },
                  { l: 'Puls', v: '50–100 /min', ok: true },
                  { l: 'Telesna temperatura', v: '≤ 37.5 °C', ok: true },
                  { l: 'Telesna masa', v: '≥ 55 kg', ok: true },
                ].map(({ l, v, ok }) => (
                  <div key={l} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: C.s50 }}>
                    <span className="text-xs" style={{ color: C.ink5 }}>{l}</span>
                    <span className="text-xs font-medium" style={{ color: ok ? C.teal2 : C.burgundy, fontFamily: 'JetBrains Mono, monospace' }}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Obavezni testovi" />
              <div className="p-4">
                {['HBsAg (Hepatitis B)', 'Anti-HCV (Hepatitis C)', 'HIV 1/2 Ag/Ab', 'Sifilis (Anti-Tp)', 'ABO/Rh tipizacija', 'Hb merenje'].map(t => (
                  <div key={t} className="flex items-center gap-2 py-2 border-b last:border-0" style={{ borderColor: C.s50 }}>
                    <span style={{ color: C.teal, display: 'flex' }}><Ic.Check /></span>
                    <span className="text-xs" style={{ color: C.ink7 }}>{t}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'laboratorija' && (
        <Card>
          <CardHeader title="Laboratorijska testiranja — danas" action={
            <Btn variant="secondary" size="sm"><Ic.Download /> Izvezi</Btn>
          } />
          <Table headers={['Uzorak ID', 'Davalac', 'Testovi', 'Primljeno', 'Rezultat', 'Status']}>
            {LAB_UZORCI.map(u => (
              <TR key={u.id}>
                <TD mono muted>{u.id}</TD>
                <TD><span className="font-medium">{u.donor}</span></TD>
                <TD><span className="text-xs max-w-xs" style={{ color: C.ink5 }}>{u.test}</span></TD>
                <TD mono>{u.primljeno}</TD>
                <TD>
                  <span className="text-xs font-medium" style={{ color: u.rezultat === 'Negativan' ? C.teal2 : u.rezultat === '—' ? C.ink3 : C.burgundy }}>
                    {u.rezultat}
                  </span>
                </TD>
                <TD><StatusBadge status={u.status} /></TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {tab === 'kontraindikacije' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader title="Aktivne kontraindikacije" subtitle={`${KONTRA.length} evidentirano`} action={
              <Btn size="sm"><Ic.Plus /> Nova</Btn>
            } />
            <Table headers={['Davalac', 'Razlog', 'Tip', 'Period', 'Lekar']}>
              {KONTRA.map(k => (
                <TR key={k.donor}>
                  <TD><span className="font-medium">{k.donor}</span></TD>
                  <TD muted>{k.razlog}</TD>
                  <TD><StatusBadge status={k.tip === 'Trajna' ? 'odbijen' : 'upozorenje'} /></TD>
                  <TD mono>{k.period}</TD>
                  <TD muted>{k.lekar}</TD>
                </TR>
              ))}
            </Table>
          </Card>

          <Card>
            <CardHeader title="Kategorije" />
            <div className="p-5 flex flex-col gap-3">
              {[
                { kat: 'Trajne kontraindikacije', n: 12, opis: 'HIV, hepatitis B/C, određene hronične bolesti', color: C.burgundy },
                { kat: 'Privremene — duže od 12 meseci', n: 5, opis: 'Trudnoća, hirurške operacije, transfuzija', color: '#b52239' },
                { kat: 'Privremene — kraće od 12 meseci', n: 18, opis: 'Infekcije, cepiva, terapije lekovima', color: '#d97706' },
                { kat: 'Period odlaganja', n: 34, opis: 'Obavezni interval između donacija', color: '#1d4ed8' },
              ].map(({ kat, n, opis, color }) => (
                <div key={kat} className="flex items-start justify-between p-3 rounded-lg" style={{ background: color + '0c' }}>
                  <div>
                    <div className="text-sm font-medium mb-0.5" style={{ color: C.ink7 }}>{kat}</div>
                    <div className="text-xs" style={{ color: C.ink3 }}>{opis}</div>
                  </div>
                  <span className="text-xl font-medium ml-3 flex-shrink-0" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>{n}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'protokoli' && (
        <div className="grid lg:grid-cols-2 gap-5">
          {[
            { naziv: 'Protokol prijema davaoca krvi', verzija: 'v4.2', datum: '1. jan 2026', kategorija: 'Prijem' },
            { naziv: 'Procedura testiranja krvi', verzija: 'v3.8', datum: '1. mar 2026', kategorija: 'Laboratorija' },
            { naziv: 'Postupak u slučaju neželjenih događaja', verzija: 'v2.1', datum: '1. jun 2025', kategorija: 'Bezbednost' },
            { naziv: 'Kriterijumi za odlaganje donacije', verzija: 'v5.0', datum: '1. feb 2026', kategorija: 'Medicinski' },
            { naziv: 'Upravljanje krvnim produktima', verzija: 'v3.3', datum: '1. apr 2026', kategorija: 'Zalihe' },
            { naziv: 'Informed consent — obrazac', verzija: 'v2.4', datum: '1. jan 2026', kategorija: 'Pravni' },
          ].map(p => (
            <Card key={p.naziv}>
              <div className="flex items-start justify-between p-5">
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1" style={{ color: C.navy }}>{p.naziv}</div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: C.ink3 }}>
                    <span className="px-2 py-0.5 rounded" style={{ background: C.s100 }}>{p.kategorija}</span>
                    <span className="font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{p.verzija}</span>
                    <span>Ažurirano: {p.datum}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-3">
                  <Btn variant="ghost" size="sm"><Ic.Eye /></Btn>
                  <Btn variant="ghost" size="sm"><Ic.Download /></Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pregled donora modal */}
      <Modal open={selModal} onClose={() => setSelModal(false)} title="Medicinski pregled — kartica">
        {selDonor && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: C.navy }}>{selDonor.ime} {selDonor.prezime}</div>
                <div className="text-xs font-mono mt-0.5" style={{ color: C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{selDonor.id} · {selDonor.prviPut ? 'Prva donacija' : 'Redovan davalac'}</div>
              </div>
              <BloodBadge tip={selDonor.krvnaGrupa} />
            </div>

            {/* Vitalni parametri forma */}
            <div className="p-4 rounded-xl" style={{ background: C.s50 }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: C.ink3 }}>Unos vitalnih parametara</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { l: 'Hemoglobin (g/L)', p: '135' },
                  { l: 'Krvni pritisak (mmHg)', p: '120/80' },
                  { l: 'Puls (/min)', p: '72' },
                  { l: 'Temperatura (°C)', p: '36.6' },
                  { l: 'Telesna masa (kg)', p: '78' },
                ].map(({ l, p }) => (
                  <div key={l}>
                    <label className="block text-xs mb-1" style={{ color: C.ink5 }}>{l}</label>
                    <input type="text" placeholder={p} className="w-full h-9 px-3 rounded-lg border text-sm outline-none" style={{ borderColor: C.s200, background: C.white }} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: C.ink7 }}>Napomena lekara</label>
              <textarea rows={2} className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none" style={{ borderColor: C.s200, background: C.s50 }} placeholder="Klinička napomena..." />
            </div>

            <div className="flex gap-3">
              {selDonor.status === 'pregled' && <Btn onClick={() => updateDonor('donacija')}>Prihvati za donaciju</Btn>}
              {selDonor.status === 'pregled' && <Btn variant="danger" onClick={() => updateDonor('odbijen')}>Odbij / Kontraindikacija</Btn>}
              {selDonor.status === 'donacija' && <Btn onClick={() => updateDonor('zavrseno')}>Označi kao završeno</Btn>}
              <Btn variant="secondary" onClick={() => setSelModal(false)}>Otkaži</Btn>
            </div>
          </div>
        )}
      </Modal>
    </PageWrap>
  )
}
