// ── Shared Data & Types ────────────────────────────────────────────────────

export type Role = 'super_admin' | 'admin' | 'koordinator' | 'prijem' | 'medicinska' | 'pr_sadrzaj' | 'revizor'
export type Screen =
  | 'kontrolni_centar' | 'akcije' | 'prijem_davalaca' | 'medicinska_sluzba'
  | 'kampanje' | 'studio' | 'odobravanje' | 'izvestaji' | 'osoblje'
  | 'pristup_uredjaji' | 'hijerarhija_audit' | 'api_integracije'
  | 'moja_smena' | 'klinicki_sto' | 'redakcija' | 'audit_log'
  | 'tech_config' | 'incidenti' | 'raspored'

export interface Korisnik {
  id: string; ime: string; prezime: string; email: string
  uloga: Role; aktivan: boolean; avatar: string
  poslednjaPrijava: string; filijala: string; mfa: boolean
}

export interface Akcija {
  id: string; naziv: string; datum: string; lokacija: string
  mesto?: string
  status: 'planirana' | 'aktivna' | 'zavrsena' | 'otkazana'
  kapacitet: number; prijavljeni: number; donacije: number
  koordinator: string; filijala: string
}

export interface Davalac {
  id: string; ime: string; prezime: string; krvnaGrupa: string
  status: 'ceka' | 'pregled' | 'donacija' | 'zavrseno' | 'odbijen'
  akcija: string; vreme: string; prviPut: boolean; telefon: string
}

export interface Vest {
  id: string; naslov: string; status: 'nacrt' | 'recenzija' | 'odobreno' | 'objavljeno' | 'arhivirano'
  autor: string; datum: string; kategorija: string; pregledi: number
  verzija: number; odobrio?: string; sadrzaj: string
}

export interface Odobravanje {
  id: string; tip: string; naziv: string; podnosilac: string
  datum: string; status: 'ceka' | 'odobreno' | 'odbijeno'; hitnost: 'normalno' | 'hitno'
}

export interface AuditLog {
  id: string; korisnik: string; uloga: Role; akcija: string
  resurs: string; ip: string; vreme: string; rezultat: 'uspeh' | 'greska' | 'upozorenje'
}

export interface Integracija {
  id: string; naziv: string; tip: string; status: 'aktivna' | 'greska' | 'degradovana' | 'neaktivna'
  verzija: string; poslednjiPing: string; uptime: number; incidenti: number
}

// ── Demo Accounts ──────────────────────────────────────────────────────────
export const DEMO_NALOZI: Record<string, { lozinka: string; korisnik: Korisnik }> = {
  'superadmin@zavodbk.rs': {
    lozinka: 'admin123',
    korisnik: { id: 'u-001', ime: 'Aleksandar', prezime: 'Đurić', email: 'superadmin@zavodbk.rs', uloga: 'super_admin', aktivan: true, avatar: 'AĐ', poslednjaPrijava: '22. sep 2026, 08:00', filijala: 'Centrala', mfa: true }
  },
  'admin@zavodbk.rs': {
    lozinka: 'admin123',
    korisnik: { id: 'u-002', ime: 'Vesna', prezime: 'Marković', email: 'admin@zavodbk.rs', uloga: 'admin', aktivan: true, avatar: 'VM', poslednjaPrijava: '22. sep 2026, 07:45', filijala: 'Centrala', mfa: true }
  },
  'koordinator@zavodbk.rs': {
    lozinka: 'admin123',
    korisnik: { id: 'u-003', ime: 'Nikola', prezime: 'Vasić', email: 'koordinator@zavodbk.rs', uloga: 'koordinator', aktivan: true, avatar: 'NV', poslednjaPrijava: '22. sep 2026, 07:50', filijala: 'Beograd', mfa: false }
  },
  'prijem@zavodbk.rs': {
    lozinka: 'admin123',
    korisnik: { id: 'u-004', ime: 'Maja', prezime: 'Ilić', email: 'prijem@zavodbk.rs', uloga: 'prijem', aktivan: true, avatar: 'MI', poslednjaPrijava: '22. sep 2026, 08:05', filijala: 'Beograd', mfa: false }
  },
  'dr.kovac@zavodbk.rs': {
    lozinka: 'admin123',
    korisnik: { id: 'u-005', ime: 'Dr. Milena', prezime: 'Kovač', email: 'dr.kovac@zavodbk.rs', uloga: 'medicinska', aktivan: true, avatar: 'MK', poslednjaPrijava: '22. sep 2026, 08:02', filijala: 'Beograd', mfa: true }
  },
  'pr@zavodbk.rs': {
    lozinka: 'admin123',
    korisnik: { id: 'u-006', ime: 'Sara', prezime: 'Aleksić', email: 'pr@zavodbk.rs', uloga: 'pr_sadrzaj', aktivan: true, avatar: 'SA', poslednjaPrijava: '21. sep 2026, 16:30', filijala: 'Centrala', mfa: false }
  },
  'revizor@zavodbk.rs': {
    lozinka: 'admin123',
    korisnik: { id: 'u-007', ime: 'Petar', prezime: 'Simić', email: 'revizor@zavodbk.rs', uloga: 'revizor', aktivan: true, avatar: 'PS', poslednjaPrijava: '20. sep 2026, 11:20', filijala: 'Centrala', mfa: true }
  },
}

// ── Static Data ────────────────────────────────────────────────────────────
export const AKCIJE: Akcija[] = [
  { id: 'AK-2026-091', naziv: 'Jesenji maraton davanja', datum: '28. sep 2026', lokacija: 'Beogradski sajam, hala 3', status: 'planirana', kapacitet: 200, prijavljeni: 147, donacije: 0, koordinator: 'Nikola Vasić', filijala: 'Beograd' },
  { id: 'AK-2026-090', naziv: 'Korporativna akcija — NIS', datum: '22. sep 2026', lokacija: 'NIS kampus, Novi Sad', status: 'aktivna', kapacitet: 80, prijavljeni: 74, donacije: 52, koordinator: 'Ana Jović', filijala: 'Novi Sad' },
  { id: 'AK-2026-089', naziv: 'Akcija uz Dan bez automobila', datum: '19. sep 2026', lokacija: 'Trg Republike, Beograd', status: 'zavrsena', kapacitet: 120, prijavljeni: 118, donacije: 103, koordinator: 'Nikola Vasić', filijala: 'Beograd' },
  { id: 'AK-2026-088', naziv: 'Humanitarna akcija — Niš', datum: '12. sep 2026', lokacija: 'Tvrđava, Niš', status: 'zavrsena', kapacitet: 60, prijavljeni: 55, donacije: 48, koordinator: 'Marija Đorić', filijala: 'Niš' },
  { id: 'AK-2026-087', naziv: 'Studentska akcija — BU', datum: '5. sep 2026', lokacija: 'Studentski trg, Beograd', status: 'zavrsena', kapacitet: 150, prijavljeni: 142, donacije: 127, koordinator: 'Nikola Vasić', filijala: 'Beograd' },
  { id: 'AK-2026-086', naziv: 'Letnja kampanja', datum: '18. avg 2026', lokacija: 'Zavod — ambulanta', status: 'zavrsena', kapacitet: 50, prijavljeni: 49, donacije: 44, koordinator: 'Ana Jović', filijala: 'Novi Sad' },
]

export const DAVALACI: Davalac[] = [
  { id: 'D-1847', ime: 'Milica', prezime: 'Petrović', krvnaGrupa: 'A+', status: 'donacija', akcija: 'AK-2026-090', vreme: '08:15', prviPut: false, telefon: '+381 60 123 4567' },
  { id: 'D-1848', ime: 'Stefan', prezime: 'Nikolić', krvnaGrupa: 'O+', status: 'pregled', akcija: 'AK-2026-090', vreme: '08:32', prviPut: true, telefon: '+381 64 234 5678' },
  { id: 'D-1849', ime: 'Ana', prezime: 'Jovanović', krvnaGrupa: 'B−', status: 'zavrseno', akcija: 'AK-2026-090', vreme: '08:45', prviPut: false, telefon: '+381 63 345 6789' },
  { id: 'D-1850', ime: 'Marko', prezime: 'Stojanović', krvnaGrupa: 'AB+', status: 'ceka', akcija: 'AK-2026-090', vreme: '09:00', prviPut: false, telefon: '+381 61 456 7890' },
  { id: 'D-1851', ime: 'Jelena', prezime: 'Đorđević', krvnaGrupa: 'A−', status: 'odbijen', akcija: 'AK-2026-090', vreme: '09:15', prviPut: true, telefon: '+381 65 567 8901' },
  { id: 'D-1852', ime: 'Nikola', prezime: 'Vasić', krvnaGrupa: 'O−', status: 'pregled', akcija: 'AK-2026-090', vreme: '09:30', prviPut: false, telefon: '+381 66 678 9012' },
  { id: 'D-1853', ime: 'Dragana', prezime: 'Lukić', krvnaGrupa: 'B+', status: 'ceka', akcija: 'AK-2026-090', vreme: '09:45', prviPut: false, telefon: '+381 62 789 0123' },
  { id: 'D-1854', ime: 'Ivan', prezime: 'Pešić', krvnaGrupa: 'O+', status: 'ceka', akcija: 'AK-2026-090', vreme: '10:00', prviPut: true, telefon: '+381 60 890 1234' },
]

export const VESTI: Vest[] = [
  { id: 'V-001', naslov: 'Jesenji maraton davanja krvi — Sajam 28. septembra', status: 'objavljeno', autor: 'Sara Aleksić', datum: '20. sep 2026', kategorija: 'Akcija', pregledi: 2841, verzija: 3, odobrio: 'Dr. M. Kovač', sadrzaj: 'Zavod za transfuziju krvi Srbije organizuje veliku jesensku akciju davanja krvi na Beogradskom sajmu, hala 3, 28. septembra 2026. od 08:00 do 16:00 sati. Svi zainteresovani donori pozivaju se da se registruju unapred putem ovog portala.' },
  { id: 'V-002', naslov: 'Zašto je O− najtraženija krvna grupa?', status: 'recenzija', autor: 'Dr. Ivan Marković', datum: '21. sep 2026', kategorija: 'Edukacija', pregledi: 0, verzija: 2, sadrzaj: 'Krvna grupa O− je tzv. univerzalni davalac — može se koristiti za transfuziju svima bez obzira na krvnu grupu primaoca. Zbog toga je stalna potreba za ovom krvnom grupom izuzetno visoka...' },
  { id: 'V-003', naslov: 'Rezultati letnje kampanje 2026.', status: 'odobreno', autor: 'Sara Aleksić', datum: '19. sep 2026', kategorija: 'Izveštaj', pregledi: 1205, verzija: 1, odobrio: 'Aleksandar Đurić', sadrzaj: 'Letnja kampanja 2026. završena je sa izvanrednim rezultatima. Ukupno je sakupljeno 374 jedinice krvi na 6 lokacija širom Srbije...' },
  { id: 'V-004', naslov: 'Novi protokol prijavljivanja donora', status: 'nacrt', autor: 'Admin Portal', datum: '22. sep 2026', kategorija: 'Obaveštenje', pregledi: 0, verzija: 1, sadrzaj: '' },
]

export const ODOBRAVANJE_LISTA: Odobravanje[] = [
  { id: 'OD-041', tip: 'Vest', naziv: 'Zašto je O− najtraženija krvna grupa?', podnosilac: 'Dr. Ivan Marković', datum: '21. sep 2026', status: 'ceka', hitnost: 'normalno' },
  { id: 'OD-040', tip: 'Kampanja', naziv: 'Zimska kampanja — Dec 2026', podnosilac: 'Nikola Vasić', datum: '20. sep 2026', status: 'ceka', hitnost: 'hitno' },
  { id: 'OD-039', tip: 'Korisnik', naziv: 'Novi tehničar — Dragan Popović', podnosilac: 'Vesna Marković', datum: '19. sep 2026', status: 'odobreno', hitnost: 'normalno' },
  { id: 'OD-038', tip: 'Integracija', naziv: 'Ažuriranje LIS API v3.2', podnosilac: 'Vesna Marković', datum: '18. sep 2026', status: 'odobreno', hitnost: 'normalno' },
  { id: 'OD-037', tip: 'Izveštaj', naziv: 'Kvartalni izveštaj Q3 2026', podnosilac: 'Petar Simić', datum: '17. sep 2026', status: 'odbijeno', hitnost: 'normalno' },
]

export const AUDIT_LOGOVI: AuditLog[] = [
  { id: 'AL-9901', korisnik: 'Aleksandar Đurić', uloga: 'super_admin', akcija: 'PRIJAVLJIVANJE', resurs: 'Sistem', ip: '192.168.1.10', vreme: '22. sep 2026, 08:00', rezultat: 'uspeh' },
  { id: 'AL-9900', korisnik: 'Vesna Marković', uloga: 'admin', akcija: 'IZMENA_KORISNIKA', resurs: 'Korisnik #u-008', ip: '192.168.1.15', vreme: '22. sep 2026, 07:52', rezultat: 'uspeh' },
  { id: 'AL-9899', korisnik: 'Dr. Milena Kovač', uloga: 'medicinska', akcija: 'PREGLED_ZAPISA', resurs: 'Davalac #D-1849', ip: '10.0.0.22', vreme: '22. sep 2026, 07:48', rezultat: 'uspeh' },
  { id: 'AL-9898', korisnik: 'Nepoznato', uloga: 'revizor', akcija: 'NEUSPELA_PRIJAVA', resurs: 'Sistem', ip: '185.220.101.5', vreme: '22. sep 2026, 06:33', rezultat: 'greska' },
  { id: 'AL-9897', korisnik: 'Sara Aleksić', uloga: 'pr_sadrzaj', akcija: 'OBJAVLJENO', resurs: 'Vest #V-001', ip: '192.168.1.30', vreme: '21. sep 2026, 16:20', rezultat: 'uspeh' },
  { id: 'AL-9896', korisnik: 'Nikola Vasić', uloga: 'koordinator', akcija: 'KREIRANJE_AKCIJE', resurs: 'Akcija #AK-2026-091', ip: '192.168.1.25', vreme: '21. sep 2026, 14:05', rezultat: 'uspeh' },
  { id: 'AL-9895', korisnik: 'Maja Ilić', uloga: 'prijem', akcija: 'REGISTRACIJA_DAVAOCA', resurs: 'Davalac #D-1854', ip: '10.0.0.40', vreme: '22. sep 2026, 10:00', rezultat: 'uspeh' },
  { id: 'AL-9894', korisnik: 'Vesna Marković', uloga: 'admin', akcija: 'PROMENA_KONFIGURACIJE', resurs: 'API/LIS', ip: '192.168.1.15', vreme: '20. sep 2026, 11:30', rezultat: 'upozorenje' },
]

export const INTEGRACIJE: Integracija[] = [
  { id: 'INT-01', naziv: 'LIS — Laboratorijski sistem', tip: 'REST API', status: 'aktivna', verzija: 'v3.1.2', poslednjiPing: '22. sep 2026, 09:41', uptime: 99.8, incidenti: 0 },
  { id: 'INT-02', naziv: 'Matična baza donora', tip: 'SOAP/HL7', status: 'aktivna', verzija: 'v2.4.0', poslednjiPing: '22. sep 2026, 09:40', uptime: 99.5, incidenti: 1 },
  { id: 'INT-03', naziv: 'eZdravlje portal', tip: 'REST API', status: 'degradovana', verzija: 'v1.8.1', poslednjiPing: '22. sep 2026, 09:15', uptime: 87.2, incidenti: 3 },
  { id: 'INT-04', naziv: 'SMS gateway', tip: 'REST API', status: 'aktivna', verzija: 'v4.0.1', poslednjiPing: '22. sep 2026, 09:41', uptime: 99.9, incidenti: 0 },
  { id: 'INT-05', naziv: 'Email servis (SMTP)', tip: 'SMTP', status: 'aktivna', verzija: 'v1.0', poslednjiPing: '22. sep 2026, 09:38', uptime: 99.7, incidenti: 0 },
  { id: 'INT-06', naziv: 'Backup sistem', tip: 'SFTP', status: 'greska', verzija: 'v2.0', poslednjiPing: '21. sep 2026, 02:00', uptime: 95.1, incidenti: 2 },
]

export const KORISNICI_LISTA: Korisnik[] = [
  { id: 'u-001', ime: 'Aleksandar', prezime: 'Đurić', email: 'superadmin@zavodbk.rs', uloga: 'super_admin', aktivan: true, avatar: 'AĐ', poslednjaPrijava: '22. sep 2026, 08:00', filijala: 'Centrala', mfa: true },
  { id: 'u-002', ime: 'Vesna', prezime: 'Marković', email: 'admin@zavodbk.rs', uloga: 'admin', aktivan: true, avatar: 'VM', poslednjaPrijava: '22. sep 2026, 07:45', filijala: 'Centrala', mfa: true },
  { id: 'u-003', ime: 'Nikola', prezime: 'Vasić', email: 'koordinator@zavodbk.rs', uloga: 'koordinator', aktivan: true, avatar: 'NV', poslednjaPrijava: '22. sep 2026, 07:50', filijala: 'Beograd', mfa: false },
  { id: 'u-004', ime: 'Maja', prezime: 'Ilić', email: 'prijem@zavodbk.rs', uloga: 'prijem', aktivan: true, avatar: 'MI', poslednjaPrijava: '22. sep 2026, 08:05', filijala: 'Beograd', mfa: false },
  { id: 'u-005', ime: 'Dr. Milena', prezime: 'Kovač', email: 'dr.kovac@zavodbk.rs', uloga: 'medicinska', aktivan: true, avatar: 'MK', poslednjaPrijava: '22. sep 2026, 08:02', filijala: 'Beograd', mfa: true },
  { id: 'u-006', ime: 'Sara', prezime: 'Aleksić', email: 'pr@zavodbk.rs', uloga: 'pr_sadrzaj', aktivan: true, avatar: 'SA', poslednjaPrijava: '21. sep 2026, 16:30', filijala: 'Centrala', mfa: false },
  { id: 'u-007', ime: 'Petar', prezime: 'Simić', email: 'revizor@zavodbk.rs', uloga: 'revizor', aktivan: true, avatar: 'PS', poslednjaPrijava: '20. sep 2026, 11:20', filijala: 'Centrala', mfa: true },
  { id: 'u-008', ime: 'Ana', prezime: 'Jović', email: 'a.jovic@zavodbk.rs', uloga: 'koordinator', aktivan: true, avatar: 'AJ', poslednjaPrijava: '22. sep 2026, 07:55', filijala: 'Novi Sad', mfa: false },
  { id: 'u-009', ime: 'Marija', prezime: 'Đorić', email: 'm.djoric@zavodbk.rs', uloga: 'koordinator', aktivan: false, avatar: 'MĐ', poslednjaPrijava: '12. sep 2026, 15:00', filijala: 'Niš', mfa: false },
]

export const ZALIHE = [
  { tip: 'A+', kolicina: 42, max: 80 }, { tip: 'A−', kolicina: 18, max: 50 },
  { tip: 'B+', kolicina: 31, max: 60 }, { tip: 'B−', kolicina: 9, max: 40 },
  { tip: 'AB+', kolicina: 22, max: 35 }, { tip: 'AB−', kolicina: 6, max: 20 },
  { tip: 'O+', kolicina: 57, max: 100 }, { tip: 'O−', kolicina: 14, max: 45 },
]

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin', admin: 'Administrator', koordinator: 'Koordinator',
  prijem: 'Prijem', medicinska: 'Medicinska služba', pr_sadrzaj: 'PR i sadržaj', revizor: 'Revizor',
}

export const ROLE_COLORS: Record<Role, string> = {
  super_admin: '#8B1A2D', admin: '#0B1E3D', koordinator: '#17A89B',
  prijem: '#234085', medicinska: '#0e8a7f', pr_sadrzaj: '#5a6378', revizor: '#8e97a8',
}
