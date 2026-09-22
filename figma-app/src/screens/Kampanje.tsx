import { useState } from 'react'
import { C, PageWrap, Card, CardHeader, Tabs, StatusBadge, Table, TR, TD, Btn, Modal, Input, Select, Progress, EmptyState } from '../components/ui'
import { Ic } from '../components/Icons'

const KAMPANJE_DATA = [
  { id: 'KMP-2026-04', naziv: 'Jesenji val — oktobar 2026', status: 'planirana', period: 'Okt–Nov 2026', cilj: 500, prijavljeni: 147, talasi: 3, filijale: ['Beograd', 'Novi Sad'], koordinator: 'Nikola Vasić' },
  { id: 'KMP-2026-03', naziv: 'Letnja kampanja 2026', status: 'zavrsena', period: 'Jun–Avg 2026', cilj: 400, prijavljeni: 389, talasi: 4, filijale: ['Beograd', 'Niš'], koordinator: 'Ana Jović' },
  { id: 'KMP-2026-02', naziv: 'Prolećna akcija — mesec darivalaca', status: 'zavrsena', period: 'Mar–Apr 2026', cilj: 350, prijavljeni: 341, talasi: 2, filijale: ['Beograd'], koordinator: 'Nikola Vasić' },
  { id: 'KMP-2026-01', naziv: 'Novogodišnja kampanja', status: 'zavrsena', period: 'Dec 2025–Jan 2026', cilj: 200, prijavljeni: 187, talasi: 2, filijale: ['Beograd', 'Novi Sad', 'Niš'], koordinator: 'Ana Jović' },
]

const TALASI = [
  { id: 'TAL-001', naziv: 'Val 1 — Beograd (sajam)', datum: '28. sep 2026', kapacitet: 200, prijavljeni: 147, status: 'planirana' },
  { id: 'TAL-002', naziv: 'Val 2 — Novi Sad (centar)', datum: '5. okt 2026', kapacitet: 100, prijavljeni: 0, status: 'planirana' },
  { id: 'TAL-003', naziv: 'Val 3 — Beograd (bolnica)', datum: '12. okt 2026', kapacitet: 80, prijavljeni: 0, status: 'planirana' },
]

type Campaign = typeof KAMPANJE_DATA[number]
type Wave = typeof TALASI[number] & { kampanjaId: string }
const CAMPAIGN_KEY = 'portal-figma-campaigns-v1'
const WAVE_KEY = 'portal-figma-waves-v1'
function readCampaigns(): Campaign[] {
  try { const saved = JSON.parse(localStorage.getItem(CAMPAIGN_KEY) || 'null'); return Array.isArray(saved) ? saved : KAMPANJE_DATA } catch { return KAMPANJE_DATA }
}
function readWaves(): Wave[] {
  try { const saved = JSON.parse(localStorage.getItem(WAVE_KEY) || 'null'); return Array.isArray(saved) ? saved : TALASI.map(t => ({ ...t, kampanjaId: KAMPANJE_DATA[0].id })) } catch { return TALASI.map(t => ({ ...t, kampanjaId: KAMPANJE_DATA[0].id })) }
}

export default function Kampanje() {
  const [campaigns, setCampaigns] = useState(readCampaigns)
  const [waves, setWaves] = useState(readWaves)
  const [tab, setTab] = useState('kampanje')
  const [selKampanja, setSelKampanja] = useState<Campaign | null>(null)
  const [campaignId, setCampaignId] = useState(() => readCampaigns()[0]?.id || '')
  const [novaModal, setNovaModal] = useState(false)
  const [detModal, setDetModal] = useState(false)
  const [waveModal, setWaveModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('500')
  const [coordinator, setCoordinator] = useState('Nikola Vasić')
  const [branches, setBranches] = useState('Beograd')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [waveName, setWaveName] = useState('')
  const [waveDate, setWaveDate] = useState('')
  const [waveCapacity, setWaveCapacity] = useState('')
  const [waveEditingId, setWaveEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const openCampaignForm = (campaign?: Campaign) => {
    setEditingId(campaign?.id || null)
    setName(campaign?.naziv || '')
    setTarget(String(campaign?.cilj || 500))
    setCoordinator(campaign?.koordinator || 'Nikola Vasić')
    setBranches(campaign?.filijale.join(', ') || 'Beograd')
    setStartDate(''); setEndDate('')
    setNovaModal(true)
  }
  const saveCampaign = () => {
    if (!name.trim() || Number(target) < 1) { setMessage('Unesite naziv i cilj kampanje.'); return }
    const existing = campaigns.find(k => k.id === editingId)
    const campaign: Campaign = {
      id: existing?.id || `KMP-${Date.now()}`, naziv: name.trim(), status: existing?.status || 'planirana',
      period: startDate && endDate ? `${startDate} – ${endDate}` : existing?.period || 'Datum nije određen',
      cilj: Number(target), prijavljeni: existing?.prijavljeni || 0,
      talasi: existing?.talasi || 0, filijale: branches.split(',').map(v => v.trim()).filter(Boolean),
      koordinator: coordinator,
    }
    const next = existing ? campaigns.map(k => k.id === campaign.id ? campaign : k) : [campaign, ...campaigns]
    setCampaigns(next); localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(next))
    setCampaignId(campaign.id); setNovaModal(false)
    setMessage(existing ? 'Kampanja je izmenjena.' : 'Kampanja je kreirana.')
  }
  const activateCampaign = () => {
    if (!selKampanja) return
    const updated = { ...selKampanja, status: 'aktivna' }
    const next = campaigns.map(k => k.id === updated.id ? updated : k)
    setCampaigns(next); localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(next))
    setSelKampanja(updated); setMessage('Kampanja je aktivirana.')
  }
  const saveWave = () => {
    if (!waveName.trim() || !waveDate || Number(waveCapacity) < 1) { setMessage('Unesite naziv, datum i kapacitet talasa.'); return }
    const existing = waves.find(t => t.id === waveEditingId)
    const wave: Wave = {
      id: existing?.id || `TAL-${Date.now()}`, kampanjaId: campaignId,
      naziv: waveName.trim(), datum: waveDate, kapacitet: Number(waveCapacity),
      prijavljeni: existing?.prijavljeni || 0, status: existing?.status || 'planirana',
    }
    const next = existing ? waves.map(t => t.id === wave.id ? wave : t) : [wave, ...waves]
    setWaves(next); localStorage.setItem(WAVE_KEY, JSON.stringify(next))
    if (!existing) {
      const nextCampaigns = campaigns.map(k => k.id === campaignId ? { ...k, talasi: k.talasi + 1 } : k)
      setCampaigns(nextCampaigns); localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(nextCampaigns))
    }
    setWaveModal(false); setWaveEditingId(null); setMessage('Talas je sačuvan.')
  }
  const exportCampaign = (campaign: Campaign) => {
    const rows = [['Polje', 'Vrednost'], ['Kampanja', campaign.naziv], ['Status', campaign.status], ['Cilj', campaign.cilj], ['Prijavljeni', campaign.prijavljeni], ['Talasi', campaign.talasi]]
    const csv = rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a'); a.href = url; a.download = `${campaign.id}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <PageWrap>
      <div className="flex items-center gap-3">
        <Tabs tabs={[{ id: 'kampanje', label: 'Kampanje' }, { id: 'talasi', label: 'Talasi i termini' }, { id: 'kapaciteti', label: 'Kapaciteti' }]}
          active={tab} onChange={setTab} />
        <div className="flex-1" />
        <Btn onClick={() => openCampaignForm()}><Ic.Plus /> Nova kampanja</Btn>
      </div>
      {message && <div role="status" className="rounded-lg px-4 py-2 text-sm" style={{ background: C.tealBg, color: C.teal2 }}>{message}</div>}

      {tab === 'kampanje' && (
        <div className="grid lg:grid-cols-3 gap-5">
          {campaigns.map(k => (
            <Card key={k.id} className="hover:shadow-sm transition-shadow cursor-pointer" style={{ cursor: 'pointer' }}>
              <div className="p-5 flex flex-col gap-3" onClick={() => { setSelKampanja(k); setDetModal(true) }}>
                <div className="flex items-start justify-between gap-2">
                  <StatusBadge status={k.status} />
                  <span className="text-xs font-mono" style={{ color: C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{k.id}</span>
                </div>
                <div>
                  <div className="font-medium text-sm mb-0.5" style={{ color: C.navy, fontFamily: 'DM Serif Display, Georgia, serif' }}>{k.naziv}</div>
                  <div className="text-xs" style={{ color: C.ink3 }}>{k.period}</div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: C.ink3 }}>Prijavljeni / Cilj</span>
                    <span style={{ color: C.ink7, fontFamily: 'JetBrains Mono, monospace' }}>{k.prijavljeni}/{k.cilj}</span>
                  </div>
                  <Progress value={k.prijavljeni} max={k.cilj} />
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: C.ink3 }}>
                  <span>{k.talasi} talasa</span>
                  <span>{k.filijale.join(', ')}</span>
                </div>
                <div className="text-xs" style={{ color: C.ink3 }}>Koordinator: <span style={{ color: C.ink7 }}>{k.koordinator}</span></div>
              </div>
              <div className="flex gap-2 px-5 pb-4">
                <Btn variant="secondary" size="sm" onClick={() => { setSelKampanja(k); setDetModal(true) }}><Ic.Eye /> Detalji</Btn>
                {k.status === 'planirana' && <Btn size="sm" onClick={() => openCampaignForm(k)}><Ic.Edit /> Izmeni</Btn>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'talasi' && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <select aria-label="Kampanja za talase" value={campaignId} onChange={e => setCampaignId(e.target.value)} className="h-10 px-3 rounded-lg border text-sm outline-none" style={{ borderColor: C.s200, background: C.white, color: C.ink7 }}>
              {campaigns.map(k => <option key={k.id} value={k.id}>{k.naziv}</option>)}
            </select>
            <Btn variant="secondary" onClick={() => { setWaveEditingId(null); setWaveName(''); setWaveDate(''); setWaveCapacity(''); setWaveModal(true) }}><Ic.Plus /> Dodaj talas</Btn>
          </div>
          <Card>
            <Table headers={['ID', 'Naziv talasa', 'Datum', 'Kapacitet', 'Prijavljeni', 'Popunjenost', 'Status', '']}>
              {waves.filter(t => t.kampanjaId === campaignId).map(t => (
                <TR key={t.id}>
                  <TD mono muted>{t.id}</TD>
                  <TD><span className="font-medium">{t.naziv}</span></TD>
                  <TD mono>{t.datum}</TD>
                  <TD mono>{t.kapacitet}</TD>
                  <TD mono>{t.prijavljeni}</TD>
                  <TD>
                    <div className="min-w-[100px]">
                      <Progress value={t.prijavljeni} max={t.kapacitet} height={4} />
                    </div>
                  </TD>
                  <TD><StatusBadge status={t.status} /></TD>
                  <TD>
                    <div className="flex gap-1">
                      <Btn variant="ghost" size="sm" onClick={() => { setWaveEditingId(t.id); setWaveName(t.naziv); setWaveDate(t.datum); setWaveCapacity(String(t.kapacitet)); setWaveModal(true) }}><Ic.Edit /></Btn>
                      <Btn variant="ghost" size="sm" onClick={() => { if (!confirm(`Ukloniti talas ${t.naziv}?`)) return; const next = waves.filter(item => item.id !== t.id); setWaves(next); localStorage.setItem(WAVE_KEY, JSON.stringify(next)); const updated = campaigns.map(k => k.id === campaignId ? { ...k, talasi: Math.max(0, k.talasi - 1) } : k); setCampaigns(updated); localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(updated)) }}><Ic.Trash /></Btn>
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>
          </Card>
        </div>
      )}

      {tab === 'kapaciteti' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader title="Kapaciteti po filijali" />
            <div className="p-5 flex flex-col gap-4">
              {[
                { filijala: 'Beograd', kapacitet: 300, iskorisceno: 147 },
                { filijala: 'Novi Sad', kapacitet: 100, iskorisceno: 74 },
                { filijala: 'Niš', kapacitet: 60, iskorisceno: 0 },
                { filijala: 'Kragujevac', kapacitet: 40, iskorisceno: 0 },
              ].map(({ filijala, kapacitet, iskorisceno }) => (
                <div key={filijala}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium" style={{ color: C.ink7 }}>{filijala}</span>
                    <span className="font-mono text-xs" style={{ color: C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{iskorisceno}/{kapacitet} mesta</span>
                  </div>
                  <Progress value={iskorisceno} max={kapacitet} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Osoblje po smeni" />
            <div className="p-5">
              <Table headers={['Smena', 'Vreme', 'Lekari', 'Tehničari', 'Prijem']}>
                {[
                  { smena: 'Jutarnja', vreme: '07:00–12:00', lekari: 2, tehnicari: 3, prijem: 2 },
                  { smena: 'Prepodnevna', vreme: '10:00–15:00', lekari: 2, tehnicari: 3, prijem: 2 },
                  { smena: 'Popodnevna', vreme: '13:00–18:00', lekari: 1, tehnicari: 2, prijem: 1 },
                ].map(s => (
                  <TR key={s.smena}>
                    <TD>{s.smena}</TD>
                    <TD mono>{s.vreme}</TD>
                    <TD mono>{s.lekari}</TD>
                    <TD mono>{s.tehnicari}</TD>
                    <TD mono>{s.prijem}</TD>
                  </TR>
                ))}
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* Detalji kampanje */}
      <Modal open={detModal} onClose={() => setDetModal(false)} title="Detalji kampanje" width="max-w-2xl">
        {selKampanja && (
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: C.navy }}>{selKampanja.naziv}</div>
                <div className="text-xs mt-0.5 font-mono" style={{ color: C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{selKampanja.id} · {selKampanja.period}</div>
              </div>
              <StatusBadge status={selKampanja.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { l: 'Koordinator', v: selKampanja.koordinator },
                { l: 'Filijale', v: selKampanja.filijale.join(', ') },
                { l: 'Broj talasa', v: String(selKampanja.talasi) },
                { l: 'Cilj donacija', v: String(selKampanja.cilj) },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div className="text-xs mb-0.5" style={{ color: C.ink3 }}>{l}</div>
                  <div className="text-sm font-medium" style={{ color: C.ink7 }}>{v}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: C.ink3 }}>Ukupna popunjenost</span>
                <span style={{ color: C.ink7 }}>{selKampanja.prijavljeni}/{selKampanja.cilj} ({Math.round(selKampanja.prijavljeni / selKampanja.cilj * 100)}%)</span>
              </div>
              <Progress value={selKampanja.prijavljeni} max={selKampanja.cilj} />
            </div>
            <div className="flex gap-3 pt-2">
              <Btn variant="secondary" onClick={() => setDetModal(false)}>Zatvori</Btn>
              {selKampanja.status === 'planirana' && <Btn onClick={activateCampaign}>Aktiviraj kampanju</Btn>}
              <Btn variant="secondary" onClick={() => exportCampaign(selKampanja)}><Ic.Download /> Izveštaj</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Nova kampanja */}
      <Modal open={novaModal} onClose={() => setNovaModal(false)} title={editingId ? 'Izmena kampanje' : 'Nova kampanja'} width="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Naziv kampanje" placeholder="npr. Zimska kampanja 2026" colSpan2 value={name} onChange={setName} />
          <Input label="Datum početka" type="date" value={startDate} onChange={setStartDate} />
          <Input label="Datum završetka" type="date" value={endDate} onChange={setEndDate} />
          <Input label="Cilj donacija" type="number" placeholder="500" value={target} onChange={setTarget} />
          <Select label="Koordinator" options={['Nikola Vasić', 'Ana Jović', 'Marija Đorić']} value={coordinator} onChange={setCoordinator} />
          <Input label="Filijale (odvojiti zarezom)" placeholder="Beograd, Novi Sad" colSpan2 value={branches} onChange={setBranches} />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium mb-1.5" style={{ color: C.ink7 }}>Opis kampanje</label>
          <textarea rows={3} className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none" style={{ borderColor: C.s200, background: C.s50 }} placeholder="Opis..." />
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <Btn variant="secondary" onClick={() => setNovaModal(false)}>Otkaži</Btn>
          <Btn onClick={saveCampaign}>{editingId ? 'Sačuvaj izmene' : 'Kreiraj kampanju'}</Btn>
        </div>
      </Modal>
      <Modal open={waveModal} onClose={() => setWaveModal(false)} title={waveEditingId ? 'Izmena talasa' : 'Novi talas'} width="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Naziv talasa" value={waveName} onChange={setWaveName} colSpan2 />
          <Input label="Datum" type="date" value={waveDate} onChange={setWaveDate} />
          <Input label="Kapacitet" type="number" value={waveCapacity} onChange={setWaveCapacity} />
        </div>
        <div className="flex gap-3 mt-6 justify-end"><Btn variant="secondary" onClick={() => setWaveModal(false)}>Otkaži</Btn><Btn onClick={saveWave}>Sačuvaj talas</Btn></div>
      </Modal>
    </PageWrap>
  )
}
