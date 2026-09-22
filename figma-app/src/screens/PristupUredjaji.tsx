import { useState } from 'react'
import { C, PageWrap, Card, CardHeader, Tabs, Table, TR, TD, Btn, Modal, ConfirmDialog, Input, Select, StatusBadge } from '../components/ui'
import { Ic } from '../components/Icons'
import { downloadCsv } from '../actionStore'

const UREDJAJI = [
  { id: 'DEV-001', naziv: 'Tablet — Prijem A', tip: 'Tablet', korisnik: 'Maja Ilić', filijala: 'Beograd', status: 'aktivan', poslednji: '22. sep 2026, 08:05', os: 'Android 14' },
  { id: 'DEV-002', naziv: 'Laptop — Lekar Kovač', tip: 'Laptop', korisnik: 'Dr. Milena Kovač', filijala: 'Beograd', status: 'aktivan', poslednji: '22. sep 2026, 08:02', os: 'Windows 11' },
  { id: 'DEV-003', naziv: 'Desktop — Lab 1', tip: 'Desktop', korisnik: 'Ivan Marković', filijala: 'Beograd', status: 'aktivan', poslednji: '22. sep 2026, 07:58', os: 'Windows 11' },
  { id: 'DEV-004', naziv: 'Tablet — Prijem NS', tip: 'Tablet', korisnik: 'Ana Jović', filijala: 'Novi Sad', status: 'neaktivan', poslednji: '20. sep 2026, 16:00', os: 'iPadOS 17' },
  { id: 'DEV-005', naziv: 'Laptop — Koordinator', tip: 'Laptop', korisnik: 'Nikola Vasić', filijala: 'Beograd', status: 'aktivan', poslednji: '22. sep 2026, 07:50', os: 'macOS 15' },
]

const QR_PRISTUP = [
  { id: 'QR-001', naziv: 'Ulazni QR — Sajam akcija', akcija: 'AK-2026-091', kreiran: '20. sep 2026', istice: '28. sep 2026', koristenja: 0, status: 'aktivan' },
  { id: 'QR-002', naziv: 'Ulazni QR — NIS kampus', akcija: 'AK-2026-090', kreiran: '18. sep 2026', istice: '22. sep 2026', koristenja: 74, status: 'aktivan' },
  { id: 'QR-003', naziv: 'Ulazni QR — Trg Republike', akcija: 'AK-2026-089', kreiran: '15. sep 2026', istice: '19. sep 2026', koristenja: 103, status: 'istekao' },
]
type Device = typeof UREDJAJI[number]
type QrRecord = typeof QR_PRISTUP[number]
function savedList<T>(key: string, fallback: T[]): T[] {
  try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return Array.isArray(value) ? value : fallback } catch { return fallback }
}

export default function PristupUredjaji() {
  const [tab, setTab] = useState('uredjaji')
  const [noviQRModal, setNoviQRModal] = useState(false)
  const [noviUredModal, setNoviUredModal] = useState(false)
  const [devices, setDevices] = useState<Device[]>(() => savedList('portal-demo-devices-v1', UREDJAJI))
  const [qrRecords, setQrRecords] = useState<QrRecord[]>(() => savedList('portal-demo-qr-v1', QR_PRISTUP))
  const [message, setMessage] = useState('')
  const [editDeviceId, setEditDeviceId] = useState<string | null>(null)
  const [deviceName, setDeviceName] = useState('')
  const [deviceType, setDeviceType] = useState('Tablet')
  const [deviceUser, setDeviceUser] = useState('Maja Ilić')
  const [deviceBranch, setDeviceBranch] = useState('Beograd')
  const [deviceOs, setDeviceOs] = useState('')
  const [qrName, setQrName] = useState('')
  const [qrAction, setQrAction] = useState('AK-2026-091 — Jesenji maraton')
  const [qrExpiry, setQrExpiry] = useState('')
  const [pendingRemoval, setPendingRemoval] = useState<{ kind: 'device' | 'qr'; id: string; name: string } | null>(null)
  const saveDevices = (next: Device[]) => { setDevices(next); localStorage.setItem('portal-demo-devices-v1', JSON.stringify(next)) }
  const saveQr = (next: QrRecord[]) => { setQrRecords(next); localStorage.setItem('portal-demo-qr-v1', JSON.stringify(next)) }
  const openDevice = (device?: Device) => {
    setMessage('')
    setEditDeviceId(device?.id || null); setDeviceName(device?.naziv || ''); setDeviceType(device?.tip || 'Tablet')
    setDeviceUser(device?.korisnik || 'Maja Ilić'); setDeviceBranch(device?.filijala || 'Beograd'); setDeviceOs(device?.os || '')
    setNoviUredModal(true)
  }
  const commitDevice = () => {
    if (!deviceName.trim() || !deviceOs.trim()) { setMessage('Unesite naziv uređaja i operativni sistem.'); return }
    const old = devices.find(d => d.id === editDeviceId)
    const item: Device = { id: old?.id || `DEV-${Date.now()}`, naziv: deviceName.trim(), tip: deviceType,
      korisnik: deviceUser, filijala: deviceBranch, os: deviceOs.trim(), status: old?.status || 'neaktivan',
      poslednji: old?.poslednji || 'Nije aktiviran' }
    saveDevices(old ? devices.map(d => d.id === old.id ? item : d) : [item, ...devices])
    setNoviUredModal(false); setMessage('Uređaj je sačuvan u lokalnoj demo evidenciji. Stvarna registracija zahteva serversku potvrdu.')
  }
  const commitQr = () => {
    if (!qrName.trim() || !qrExpiry) { setMessage('Unesite naziv i datum isteka.'); return }
    const item: QrRecord = { id: `QR-${Date.now()}`, naziv: qrName.trim(), akcija: qrAction.split(' — ')[0],
      kreiran: new Date().toLocaleDateString('sr-Latn-RS'), istice: qrExpiry, koristenja: 0, status: 'neaktivan' }
    saveQr([item, ...qrRecords]); setNoviQRModal(false)
    setMessage('Zahtev za QR je evidentiran kao neaktivan demo zapis. Skenabilan pristup zahteva serverski izdat token.')
  }

  return (
    <PageWrap>
      {message && <div role="status" className="rounded-lg border p-3 text-sm" style={{ borderColor: C.s200, background: C.s50, color: C.ink7 }}>{message}</div>}
      <Tabs tabs={[
        { id: 'uredjaji', label: 'Uređaji' },
        { id: 'qr', label: 'QR pristup' },
        { id: 'mfa', label: 'MFA podešavanja' },
        { id: 'sesije', label: 'Aktivne sesije' },
      ]} active={tab} onChange={setTab} />

      {tab === 'uredjaji' && (
        <>
          <div className="flex items-center gap-3 justify-end">
            <Btn onClick={() => openDevice()}><Ic.Plus /> Registruj uređaj</Btn>
          </div>
          <Card>
            <Table headers={['ID', 'Naziv', 'Tip', 'Korisnik', 'Filijala', 'OS', 'Poslednja aktivnost', 'Status', '']}>
              {devices.map(d => (
                <TR key={d.id}>
                  <TD mono muted>{d.id}</TD>
                  <TD><span className="font-medium">{d.naziv}</span></TD>
                  <TD muted>{d.tip}</TD>
                  <TD muted>{d.korisnik}</TD>
                  <TD muted>{d.filijala}</TD>
                  <TD mono>{d.os}</TD>
                  <TD mono>{d.poslednji}</TD>
                  <TD>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.status === 'aktivan' ? '#17A89B' : '#c4cede' }} />
                      <span className="text-xs" style={{ color: d.status === 'aktivan' ? '#0e8a7f' : '#8e97a8' }}>
                        {d.status === 'aktivan' ? 'Aktivan' : 'Neaktivan'}
                      </span>
                    </div>
                  </TD>
                  <TD>
                    <div className="flex gap-1">
                      <Btn variant="ghost" size="sm" title={`Uredi ${d.naziv}`} onClick={() => openDevice(d)}><Ic.Edit /></Btn>
                      <Btn variant="ghost" size="sm" title={`Ukloni ${d.naziv} iz demo evidencije`} onClick={() => setPendingRemoval({ kind: 'device', id: d.id, name: d.naziv })}><Ic.Trash /></Btn>
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>
          </Card>
        </>
      )}

      {tab === 'qr' && (
        <>
          <div className="flex items-center gap-3 justify-end">
            <Btn onClick={() => { setMessage(''); setQrName(''); setQrExpiry(''); setNoviQRModal(true) }}><Ic.Plus /> Novi QR kod</Btn>
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
              {qrRecords.map(qr => (
              <Card key={qr.id}>
                <div className="p-5 flex flex-col gap-3">
                  {/* QR placeholder */}
                  <div className="w-full aspect-square rounded-xl flex items-center justify-center" style={{ background: C.s50 }}>
                    <div style={{ color: C.ink3 }}><Ic.QR /></div>
                  </div>
                  <div>
                    <div className="font-medium text-sm mb-0.5" style={{ color: C.navy }}>{qr.naziv}</div>
                    <div className="text-xs font-mono" style={{ color: C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{qr.id}</div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: C.ink3 }}>Akcija</span>
                      <span style={{ color: C.ink7, fontFamily: 'JetBrains Mono, monospace' }}>{qr.akcija}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: C.ink3 }}>Ističe</span>
                      <span style={{ color: C.ink7 }}>{qr.istice}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: C.ink3 }}>Korišćenja</span>
                      <span style={{ color: C.ink7, fontFamily: 'JetBrains Mono, monospace' }}>{qr.koristenja}</span>
                    </div>
                  </div>
                  <StatusBadge status={qr.status === 'aktivan' ? 'aktivna' : 'neaktivna'} />
                  <div className="flex gap-2">
                    <Btn variant="secondary" size="sm" className="flex-1" onClick={() => downloadCsv(`${qr.id}-podaci.csv`, [['ID', 'Naziv', 'Akcija', 'Ističe', 'Status'], [qr.id, qr.naziv, qr.akcija, qr.istice, qr.status]])}><Ic.Download /> Podaci CSV</Btn>
                    {qr.status === 'aktivan' && <Btn variant="danger" size="sm" onClick={() => setPendingRemoval({ kind: 'qr', id: qr.id, name: qr.naziv })}>Deaktiviraj</Btn>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === 'mfa' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader title="MFA status korisnika" />
            <div className="p-5 flex flex-col gap-3">
              {[
                { ime: 'Aleksandar Đurić', uloga: 'Super Admin', mfa: true },
                { ime: 'Vesna Marković', uloga: 'Administrator', mfa: true },
                { ime: 'Dr. Milena Kovač', uloga: 'Medicinska', mfa: true },
                { ime: 'Nikola Vasić', uloga: 'Koordinator', mfa: false },
                { ime: 'Maja Ilić', uloga: 'Prijem', mfa: false },
                { ime: 'Sara Aleksić', uloga: 'PR i sadržaj', mfa: false },
                { ime: 'Petar Simić', uloga: 'Revizor', mfa: true },
              ].map(({ ime, uloga, mfa }) => (
                <div key={ime} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: C.s50 }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: C.ink7 }}>{ime}</div>
                    <div className="text-xs" style={{ color: C.ink3 }}>{uloga}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium" style={{ color: mfa ? '#15803d' : C.burgundy }}>
                      {mfa ? '✓ Aktivno' : '✕ Neaktivno'}
                    </span>
                    {!mfa && <Btn size="sm" variant="secondary" onClick={() => setMessage(`MFA zahtev za ${ime} nije poslat. Potreban je povezani serverski servis za obaveštenja.`)}><Ic.Send /> Zahtev</Btn>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="MFA politika" />
            <div className="p-5 flex flex-col gap-4">
              {[
                { naziv: 'MFA obavezno za Super Admin', status: true },
                { naziv: 'MFA obavezno za Admin', status: true },
                { naziv: 'MFA obavezno za Medicinsku', status: true },
                { naziv: 'MFA preporučeno za sve', status: true },
                { naziv: 'Podsetnik na neaktivne korisnike', status: true },
                { naziv: 'Blokada posle 5 neuspelih pokušaja', status: true },
              ].map(({ naziv, status }) => (
                <div key={naziv} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: C.s50 }}>
                  <span className="text-sm" style={{ color: C.ink7 }}>{naziv}</span>
                  <div role="status" aria-label={`${naziv}: ${status ? 'uključeno u demonstraciji' : 'isključeno u demonstraciji'}`} className="w-10 h-5 rounded-full relative transition-colors"
                    style={{ background: status ? C.teal : C.s300 }}>
                    <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all"
                      style={{ left: status ? '1.25rem' : '0.125rem' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'sesije' && (
        <Card>
          <CardHeader title="Aktivne sesije" subtitle="Prijavljivanje u realnom vremenu" action={
            <Btn variant="danger" size="sm" onClick={() => setMessage('Nije moguće odjaviti druge korisnike iz statičkog demo portala. Potreban je serverski servis za opoziv sesija.')}>Odjavi sve</Btn>
          } />
          <Table headers={['Korisnik', 'Uloga', 'IP adresa', 'Uređaj', 'Prijavljen u', 'Akcija']}>
            {[
              { k: 'Aleksandar Đurić', u: 'Super Admin', ip: '192.168.1.10', ur: 'Chrome / Windows', vreme: '08:00' },
              { k: 'Vesna Marković', u: 'Administrator', ip: '192.168.1.15', ur: 'Firefox / Windows', vreme: '07:45' },
              { k: 'Dr. Milena Kovač', u: 'Medicinska', ip: '10.0.0.22', ur: 'Chrome / macOS', vreme: '08:02' },
              { k: 'Nikola Vasić', u: 'Koordinator', ip: '192.168.1.25', ur: 'Chrome / Windows', vreme: '07:50' },
              { k: 'Maja Ilić', u: 'Prijem', ip: '10.0.0.40', ur: 'Safari / iPad', vreme: '08:05' },
            ].map(({ k, u, ip, ur, vreme }) => (
              <TR key={k}>
                <TD><span className="font-medium">{k}</span></TD>
                <TD muted>{u}</TD>
                <TD mono muted>{ip}</TD>
                <TD muted>{ur}</TD>
                <TD mono>{vreme}</TD>
                <TD><Btn variant="danger" size="sm" onClick={() => setMessage(`Sesija korisnika ${k} nije opozvana. Za stvarnu odjavu potreban je serverski servis.`)}><Ic.Logout /> Odjavi</Btn></TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {/* Novi QR modal */}
      <Modal open={noviQRModal} onClose={() => setNoviQRModal(false)} title="Novi QR kod za pristup">
        <div className="flex flex-col gap-4">
          {message && <p role="status" className="text-xs" style={{ color: C.burgundy }}>{message}</p>}
          <Input label="Naziv QR koda" placeholder="npr. Ulazni QR — Sajam" value={qrName} onChange={setQrName} />
          <Select label="Akcija" options={['AK-2026-091 — Jesenji maraton', 'AK-2026-090 — NIS kampus']} value={qrAction} onChange={setQrAction} />
          <Input label="Datum isteka" type="date" value={qrExpiry} onChange={setQrExpiry} />
          <div className="flex gap-3 justify-end">
            <Btn variant="secondary" onClick={() => setNoviQRModal(false)}>Otkaži</Btn>
            <Btn onClick={commitQr}><Ic.QR /> Evidentiraj QR zahtev</Btn>
          </div>
        </div>
      </Modal>

      {/* Novi uređaj modal */}
      <Modal open={noviUredModal} onClose={() => setNoviUredModal(false)} title={editDeviceId ? 'Izmena uređaja' : 'Registracija uređaja'}>
        {message && <p role="status" className="text-xs mb-3" style={{ color: C.burgundy }}>{message}</p>}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Naziv uređaja" placeholder="npr. Tablet — Prijem A" colSpan2 value={deviceName} onChange={setDeviceName} />
          <Select label="Tip" options={['Tablet', 'Laptop', 'Desktop', 'Mobilni']} value={deviceType} onChange={setDeviceType} />
          <Select label="Korisnik" options={['Maja Ilić', 'Dr. Milena Kovač', 'Nikola Vasić']} value={deviceUser} onChange={setDeviceUser} />
          <Select label="Filijala" options={['Beograd', 'Novi Sad', 'Niš']} value={deviceBranch} onChange={setDeviceBranch} />
          <Input label="OS" placeholder="npr. Android 14" value={deviceOs} onChange={setDeviceOs} />
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <Btn variant="secondary" onClick={() => setNoviUredModal(false)}>Otkaži</Btn>
          <Btn onClick={commitDevice}>{editDeviceId ? 'Sačuvaj' : 'Evidentiraj uređaj'}</Btn>
        </div>
      </Modal>
      <ConfirmDialog open={!!pendingRemoval} onClose={() => setPendingRemoval(null)} onConfirm={() => {
        if (!pendingRemoval) return
        if (pendingRemoval.kind === 'device') {
          saveDevices(devices.filter(item => item.id !== pendingRemoval.id))
          setMessage(`${pendingRemoval.name} je uklonjen iz lokalne demo evidencije. Serverska registracija nije promenjena.`)
        } else {
          saveQr(qrRecords.map(item => item.id === pendingRemoval.id ? { ...item, status: 'neaktivan' } : item))
          setMessage('QR je deaktiviran samo u lokalnoj demo evidenciji; stvarni token nije opozvan.')
        }
      }} title={pendingRemoval?.kind === 'qr' ? 'Deaktivacija QR zapisa' : 'Uklanjanje uređaja'}
        message={`Potvrdite izmenu demo zapisa „${pendingRemoval?.name || ''}”. Ova radnja ne menja serverski pristup.`} danger />
    </PageWrap>
  )
}
