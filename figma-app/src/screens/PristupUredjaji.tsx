import { useState } from 'react'
import { C, PageWrap, Card, CardHeader, Tabs, Table, TR, TD, Btn, Modal, Input, Select, StatusBadge } from '../components/ui'
import { Ic } from '../components/Icons'

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

export default function PristupUredjaji() {
  const [tab, setTab] = useState('uredjaji')
  const [noviQRModal, setNoviQRModal] = useState(false)
  const [noviUredModal, setNoviUredModal] = useState(false)

  return (
    <PageWrap>
      <Tabs tabs={[
        { id: 'uredjaji', label: 'Uređaji' },
        { id: 'qr', label: 'QR pristup' },
        { id: 'mfa', label: 'MFA podešavanja' },
        { id: 'sesije', label: 'Aktivne sesije' },
      ]} active={tab} onChange={setTab} />

      {tab === 'uredjaji' && (
        <>
          <div className="flex items-center gap-3 justify-end">
            <Btn onClick={() => setNoviUredModal(true)}><Ic.Plus /> Registruj uređaj</Btn>
          </div>
          <Card>
            <Table headers={['ID', 'Naziv', 'Tip', 'Korisnik', 'Filijala', 'OS', 'Poslednja aktivnost', 'Status', '']}>
              {UREDJAJI.map(d => (
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
                      <Btn variant="ghost" size="sm"><Ic.Edit /></Btn>
                      <Btn variant="ghost" size="sm"><Ic.Trash /></Btn>
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
            <Btn onClick={() => setNoviQRModal(true)}><Ic.Plus /> Novi QR kod</Btn>
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            {QR_PRISTUP.map(qr => (
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
                    <Btn variant="secondary" size="sm" className="flex-1"><Ic.Download /> Preuzmi</Btn>
                    {qr.status === 'aktivan' && <Btn variant="danger" size="sm">Deaktiviraj</Btn>}
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
                    {!mfa && <Btn size="sm" variant="secondary"><Ic.Send /> Zahtev</Btn>}
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
                  <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer`}
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
            <Btn variant="danger" size="sm">Odjavi sve</Btn>
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
                <TD><Btn variant="danger" size="sm"><Ic.Logout /> Odjavi</Btn></TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {/* Novi QR modal */}
      <Modal open={noviQRModal} onClose={() => setNoviQRModal(false)} title="Novi QR kod za pristup">
        <div className="flex flex-col gap-4">
          <Input label="Naziv QR koda" placeholder="npr. Ulazni QR — Sajam" />
          <Select label="Akcija" options={['AK-2026-091 — Jesenji maraton', 'AK-2026-090 — NIS kampus']} />
          <Input label="Datum isteka" type="date" />
          <div className="flex gap-3 justify-end">
            <Btn variant="secondary" onClick={() => setNoviQRModal(false)}>Otkaži</Btn>
            <Btn onClick={() => setNoviQRModal(false)}><Ic.QR /> Generiši QR</Btn>
          </div>
        </div>
      </Modal>

      {/* Novi uređaj modal */}
      <Modal open={noviUredModal} onClose={() => setNoviUredModal(false)} title="Registracija uređaja">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Naziv uređaja" placeholder="npr. Tablet — Prijem A" colSpan2 />
          <Select label="Tip" options={['Tablet', 'Laptop', 'Desktop', 'Mobilni']} />
          <Select label="Korisnik" options={['Maja Ilić', 'Dr. Milena Kovač', 'Nikola Vasić']} />
          <Select label="Filijala" options={['Beograd', 'Novi Sad', 'Niš']} />
          <Input label="OS" placeholder="npr. Android 14" />
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <Btn variant="secondary" onClick={() => setNoviUredModal(false)}>Otkaži</Btn>
          <Btn onClick={() => setNoviUredModal(false)}>Registruj</Btn>
        </div>
      </Modal>
    </PageWrap>
  )
}

