import { useEffect, useRef, useState } from 'react'
import { VESTI, type Vest } from '../data'
import { C, PageWrap, Card, CardHeader, Tabs, StatusBadge, Table, TR, TD, Btn, Modal, Input, Select, SearchBar, EmptyState } from '../components/ui'
import { Ic } from '../components/Icons'

const KAT = ['Sve kategorije', 'Akcija', 'Edukacija', 'Izveštaj', 'Obaveštenje', 'Intervju']
const STORAGE_KEY = 'portal-figma-vesti-v1'

function loadVesti(): Vest[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    const current = Array.isArray(saved) ? saved as Vest[] : [...VESTI]
    const oldDrafts = JSON.parse(localStorage.getItem('kapi-zivota.portal-news-drafts') || '[]')
    if (!Array.isArray(oldDrafts)) return current
    const imported = oldDrafts.filter(item => item && item.id && item.title && !current.some(v => v.id === item.id))
      .map(item => ({
        id: item.id, naslov: item.title, status: 'nacrt' as const,
        autor: item.author || 'Redakcija', datum: item.updated || 'Raniji nacrt',
        kategorija: item.type || 'Obaveštenje', pregledi: 0, verzija: 1,
        sadrzaj: item.summary || '',
      }))
    return [...imported, ...current]
  } catch {
    return VESTI
  }
}

export default function Studio() {
  const [vesti, setVesti] = useState<Vest[]>(loadVesti)
  const [tab, setTab] = useState('vesti')
  const [search, setSearch] = useState('')
  const [kat, setKat] = useState('Sve kategorije')
  const [editor, setEditor] = useState<Vest | null>(null)
  const [novaModal, setNovaModal] = useState(false)
  const [previewModal, setPreviewModal] = useState(false)
  const [prevVest, setPrevVest] = useState<Vest | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Akcija')
  const [newAuthor, setNewAuthor] = useState('')
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<{ name: string; type: string; url: string }[]>([])
  const uploadRef = useRef<HTMLInputElement>(null)
  const galleryUploadRef = useRef<HTMLInputElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const [assetNotice, setAssetNotice] = useState('')
  const [assetPreview, setAssetPreview] = useState<{ name: string; url: string; type: string } | null>(null)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(vesti)) }, [vesti])

  function saveVest(item: Vest, nextStatus: Vest['status'] = item.status) {
    const updated = { ...item, status: nextStatus, verzija: item.verzija + 1 }
    setVesti(current => current.some(v => v.id === item.id)
      ? current.map(v => v.id === item.id ? updated : v)
      : [updated, ...current])
    setEditor(updated)
    setMessage(nextStatus === 'objavljeno' ? 'Vest je objavljena u demonstracionom portalu.' : 'Nacrt je sačuvan i nalazi se u listi vesti.')
  }

  function createVest() {
    if (!newTitle.trim()) { setMessage('Unesite naslov vesti.'); return }
    const item: Vest = {
      id: `V-${Date.now()}`, naslov: newTitle.trim(), status: 'nacrt',
      autor: newAuthor.trim() || 'Redakcija', datum: new Date().toLocaleDateString('sr-Latn-RS'),
      kategorija: newCategory, pregledi: 0, verzija: 0, sadrzaj: '',
    }
    setNewTitle(''); setNewAuthor(''); setNewCategory('Akcija'); setNovaModal(false)
    setEditor(item); setMessage('Nova vest je otvorena. Sačuvajte nacrt u uredniku.')
  }

  function chooseFile(accept: string) {
    if (!uploadRef.current) return
    uploadRef.current.accept = accept
    uploadRef.current.click()
  }
  function addFile(file?: File) {
    if (!file) return
    setAttachments(current => [...current, { name: file.name, type: file.type, url: URL.createObjectURL(file) }])
    setMessage(`Fajl „${file.name}” je dostupan u ovoj sesiji. Za trajno čuvanje je potreban serverski servis.`)
  }
  function formatContent(mark: string) {
    if (!editor || !textRef.current) return
    const input = textRef.current
    const before = editor.sadrzaj.slice(0, input.selectionStart)
    const selected = editor.sadrzaj.slice(input.selectionStart, input.selectionEnd) || 'tekst'
    const after = editor.sadrzaj.slice(input.selectionEnd)
    const wrapped: Record<string, string> = {
      B: `**${selected}**`, I: `*${selected}*`, U: `<u>${selected}</u>`,
      H1: `# ${selected}`, H2: `## ${selected}`, '"': `> ${selected}`,
      '—': `- ${selected}`, '🔗': `[${selected}](https://)`,
    }
    setEditor({ ...editor, sadrzaj: before + wrapped[mark] + after })
    input.focus()
  }

  const filtered = vesti.filter(v => {
    const matchSearch = v.naslov.toLowerCase().includes(search.toLowerCase()) || v.autor.toLowerCase().includes(search.toLowerCase())
    const matchKat = kat === 'Sve kategorije' || v.kategorija === kat
    return matchSearch && matchKat
  })

  if (editor) return (
    <div className="flex flex-col h-full fade-up">
      {/* Editor topbar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b bg-white" style={{ borderColor: C.s100 }}>
        <Btn variant="ghost" size="sm" onClick={() => setEditor(null)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          Nazad
        </Btn>
        <div className="flex-1 text-sm font-medium truncate" style={{ color: C.ink7 }}>{editor.naslov}</div>
        <div className="flex items-center gap-2">
          <StatusBadge status={editor.status} />
          <span className="text-xs font-mono" style={{ color: C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>v{editor.verzija}</span>
          <Btn variant="secondary" size="sm" onClick={() => { setPrevVest(editor); setPreviewModal(true) }}><Ic.Eye /> Pregled</Btn>
          <Btn size="sm" onClick={() => saveVest(editor)}>Sačuvaj</Btn>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <input
            value={editor.naslov}
            onChange={e => setEditor({ ...editor, naslov: e.target.value })}
            className="w-full text-3xl outline-none border-b pb-4 mb-8 font-display"
            style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: C.navy, borderColor: C.s100 }}
            placeholder="Naslov vesti..."
          />

          {/* Mini toolbar */}
          <div className="flex items-center gap-1 mb-4 pb-4 border-b" style={{ borderColor: C.s100 }}>
            {['B', 'I', 'U', 'H1', 'H2', '"', '—', '🔗'].map(t => (
              <button key={t} type="button" title={`Umetni ${t}`} onClick={() => formatContent(t)} className="w-7 h-7 rounded flex items-center justify-center text-xs font-mono hover:bg-surface-100 transition-colors" style={{ color: C.ink5 }}>{t}</button>
            ))}
            <div className="h-5 w-px mx-2" style={{ background: C.s200 }} />
            <Btn variant="ghost" size="sm" onClick={() => chooseFile('image/*')}><Ic.Upload /> Slika</Btn>
            <Btn variant="ghost" size="sm" onClick={() => chooseFile('video/*')}><Ic.Link /> Video</Btn>
            <Btn variant="ghost" size="sm" onClick={() => chooseFile('application/pdf')}><Ic.Upload /> PDF</Btn>
          </div>

          <input ref={uploadRef} type="file" className="hidden" onChange={e => {
            const file = e.target.files?.[0]
            addFile(file)
            e.target.value = ''
          }} />
          {message && <p role="status" className="text-xs mb-3" style={{ color: C.teal2 }}>{message}</p>}
          {attachments.length > 0 && <div className="flex flex-wrap gap-2 mb-4">{attachments.map(file => (
            <a key={file.url} href={file.url} target="_blank" rel="noreferrer" className="text-xs px-3 py-2 rounded-lg border" style={{ borderColor: C.s200, color: C.teal2 }}>{file.name}</a>
          ))}</div>}

          <textarea ref={textRef}
            value={editor.sadrzaj}
            onChange={e => setEditor({ ...editor, sadrzaj: e.target.value })}
            rows={20}
            className="w-full outline-none resize-none text-base leading-relaxed"
            style={{ color: C.ink7, fontFamily: 'inherit' }}
            placeholder="Unesite tekst vesti..."
          />
        </div>

        {/* Sidebar panel */}
        <div className="w-72 border-l overflow-y-auto" style={{ borderColor: C.s100, background: C.s50 }}>
          <div className="p-5 flex flex-col gap-5">
            {/* Status */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: C.ink3 }}>Objava</div>
              <div className="text-sm"><StatusBadge status={editor.status} /></div>
            </div>
            <div className="text-xs" style={{ color: C.ink5 }}>Datum zapisa: {editor.datum}</div>
            <Input label="Autor" value={editor.autor} onChange={autor => setEditor({ ...editor, autor })} />
            <Select label="Kategorija" options={KAT.slice(1)} value={editor.kategorija} onChange={kategorija => setEditor({ ...editor, kategorija })} />

            {/* Verzije */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.ink3 }}>Istorija verzija</div>
              {[
                { v: editor.verzija, datum: '22. sep 2026, 10:00', autor: editor.autor },
                ...(editor.verzija > 1 ? [{ v: editor.verzija - 1, datum: '21. sep 2026, 14:30', autor: editor.autor }] : []),
                ...(editor.verzija > 2 ? [{ v: editor.verzija - 2, datum: '20. sep 2026, 09:15', autor: editor.autor }] : []),
              ].map(({ v, datum, autor }) => (
                <div key={v} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: C.s200 }}>
                  <div>
                    <div className="text-xs font-mono" style={{ color: C.ink7, fontFamily: 'JetBrains Mono, monospace' }}>v{v}</div>
                    <div className="text-xs" style={{ color: C.ink3 }}>{autor}</div>
                  </div>
                  <div className="text-xs" style={{ color: C.ink3 }}>{datum.slice(0, 10)}</div>
                </div>
              ))}
            </div>

            {/* Stručna provera */}
            {editor.status === 'recenzija' && (
              <div className="p-3 rounded-lg" style={{ background: '#fef3c718', border: `1px solid ${'#d97706'}40` }}>
                <div className="text-xs font-semibold mb-1" style={{ color: '#d97706' }}>Čeka stručnu proveru</div>
                <div className="text-xs mb-2" style={{ color: C.ink5 }}>Potrebna medicinska validacija sadržaja pre objave.</div>
                <Btn size="sm" variant="secondary" onClick={() => saveVest(editor, 'recenzija')}>Zatraži recenziju</Btn>
              </div>
            )}

            {editor.odobrio && (
              <div className="p-3 rounded-lg" style={{ background: C.greenBg, border: `1px solid ${'#15803d'}30` }}>
                <div className="text-xs font-semibold mb-1" style={{ color: '#15803d' }}>Odobreno</div>
                <div className="text-xs" style={{ color: C.ink5 }}>Odobrio: {editor.odobrio}</div>
              </div>
            )}

            {/* Statistike */}
            {editor.pregledi > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.ink3 }}>Statistike</div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: C.ink5 }}>Pregledi</span>
                    <span className="font-mono" style={{ color: C.ink7, fontFamily: 'JetBrains Mono, monospace' }}>{editor.pregledi.toLocaleString('sr')}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              {editor.status !== 'objavljeno' && <Btn onClick={() => editor.status === 'odobreno' ? saveVest(editor, 'objavljeno') : (setMessage('Pre objave je potrebna stručna provera i odobrenje.'), saveVest(editor, 'recenzija'))}>{editor.status === 'odobreno' ? 'Objavi' : 'Pošalji na proveru'}</Btn>}
              {editor.status === 'objavljeno' && <Btn variant="danger" onClick={() => saveVest(editor, 'arhivirano')}>Povuci objavu</Btn>}
              <Btn variant="secondary" onClick={() => window.print()}><Ic.Download /> Štampaj / sačuvaj PDF</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <PageWrap>
      {message && <div role="status" className="rounded-lg border p-3 text-sm" style={{ borderColor: C.s200, background: C.s50, color: C.ink7 }}>{message}</div>}
      <input ref={galleryUploadRef} type="file" className="hidden" onChange={e => { addFile(e.target.files?.[0]); e.target.value = '' }} />
      <div className="flex items-center gap-3 flex-wrap">
        <Tabs tabs={[{ id: 'vesti', label: 'Vesti i objave' }, { id: 'dokumenti', label: 'Dokumenti' }, { id: 'mediji', label: 'Mediji' }]}
          active={tab} onChange={setTab} />
        <div className="flex-1" />
        <Btn onClick={() => setNovaModal(true)}><Ic.Plus /> Nova vest</Btn>
      </div>

      {tab === 'vesti' && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <SearchBar value={search} onChange={setSearch} placeholder="Pretraži vesti..." />
            <select value={kat} onChange={e => setKat(e.target.value)}
              className="h-10 px-3 rounded-lg border text-sm outline-none" style={{ borderColor: C.s200, background: C.white, color: C.ink7 }}>
              {KAT.map(k => <option key={k}>{k}</option>)}
            </select>
          </div>

          <Card>
            <Table headers={['Naslov', 'Kategorija', 'Autor', 'Datum', 'Pregledi', 'Verzija', 'Status', '']}>
              {filtered.length === 0
                ? <tr><td colSpan={8}><EmptyState message="Nema vesti za prikaz." /></td></tr>
                : filtered.map(v => (
                  <TR key={v.id} onClick={() => setEditor(v)}>
                    <TD><span className="font-medium" style={{ color: C.ink9 }}>{v.naslov}</span></TD>
                    <TD muted>{v.kategorija}</TD>
                    <TD muted>{v.autor}</TD>
                    <TD mono>{v.datum}</TD>
                    <TD mono>{v.pregledi > 0 ? v.pregledi.toLocaleString('sr') : '—'}</TD>
                    <TD mono>v{v.verzija}</TD>
                    <TD><StatusBadge status={v.status} /></TD>
                    <TD>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <Btn variant="ghost" size="sm" onClick={() => setEditor(v)}><Ic.Edit /></Btn>
                        <Btn variant="ghost" size="sm" onClick={() => { setPrevVest(v); setPreviewModal(true) }}><Ic.Eye /></Btn>
                      </div>
                    </TD>
                  </TR>
                ))}
            </Table>
          </Card>
        </>
      )}

      {tab === 'dokumenti' && (
        <div className="grid lg:grid-cols-3 gap-4">
          {[
            { naziv: 'Godišnji izveštaj 2025', tip: 'PDF', velicina: '4.2 MB', datum: '15. jan 2026', kategorija: 'Izveštaj' },
            { naziv: 'Protokol davanja krvi — javna verzija', tip: 'PDF', velicina: '1.1 MB', datum: '1. mar 2026', kategorija: 'Protokol' },
            { naziv: 'Brošura za korisnike', tip: 'PDF', velicina: '2.8 MB', datum: '1. jan 2026', kategorija: 'Materijali' },
            { naziv: 'Prezentacija — jesenji maraton', tip: 'PPTX', velicina: '8.3 MB', datum: '20. sep 2026', kategorija: 'Kampanja' },
            { naziv: 'Infografika — tipovi krvi', tip: 'PNG', velicina: '0.6 MB', datum: '5. jun 2026', kategorija: 'Mediji' },
            { naziv: 'Video spot — Daruj krv', tip: 'MP4', velicina: '45.2 MB', datum: '1. avg 2026', kategorija: 'Video' },
          ].map(d => (
            <Card key={d.naziv} className="hover:shadow-sm transition-shadow">
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: d.tip === 'PDF' ? C.burgundyBg : d.tip === 'MP4' ? '#dbeafe' : C.tealBg }}>
                    <span className="text-xs font-bold font-mono" style={{ color: d.tip === 'PDF' ? C.burgundy : d.tip === 'MP4' ? '#1d4ed8' : C.teal2, fontFamily: 'JetBrains Mono, monospace' }}>{d.tip}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate" style={{ color: C.ink7 }}>{d.naziv}</div>
                    <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>{d.kategorija} · {d.velicina}</div>
                  </div>
                </div>
                <div className="text-xs mb-3" style={{ color: C.ink3 }}>Dodato: {d.datum}</div>
                <div className="flex gap-2">
                  <Btn variant="secondary" size="sm" onClick={() => setAssetNotice(`„${d.naziv}” je primer stavke. Originalni ${d.tip} fajl nije priložen demo portalu.`)}><Ic.Eye /> Detalji</Btn>
                  <Btn variant="secondary" size="sm" onClick={() => setAssetNotice(`„${d.naziv}” nije priložen. Nije preuzet nikakav fajl.`)}><Ic.Download /> Preuzmi</Btn>
                </div>
              </div>
            </Card>
          ))}

          {attachments.filter(file => !file.type.startsWith('image/')).map(file => <Card key={file.url}>
            <div className="p-5"><div className="font-medium text-sm mb-2" style={{ color: C.ink7 }}>{file.name}</div>
              <div className="flex gap-2"><Btn variant="secondary" size="sm" onClick={() => setAssetPreview(file)}><Ic.Eye /> Pregled</Btn>
                <a href={file.url} download={file.name} className="inline-flex items-center rounded-lg px-3 h-8 text-xs font-medium" style={{ background: C.s100, color: C.ink5 }}>Preuzmi</a></div>
            </div></Card>)}
          <Card className="border-dashed" style={{ borderStyle: 'dashed' }}>
            <div className="p-5 flex flex-col items-center justify-center h-full min-h-[150px] text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: C.s100, color: C.ink3 }}>
                <Ic.Upload />
              </div>
              <button type="button" className="text-sm font-medium" style={{ color: C.ink5 }} onClick={() => { if (galleryUploadRef.current) { galleryUploadRef.current.accept = '.pdf,.doc,.docx,.ppt,.pptx,video/*'; galleryUploadRef.current.click() } }}>Otpremi dokument</button>
              <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>PDF, Word, slike, video</div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'mediji' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { url: 'https://images.unsplash.com/photo-1615461066841-6116e61059e9?w=400&h=300&fit=crop&auto=format', alt: 'Davanje krvi' },
            { url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop&auto=format', alt: 'Medicinska oprema' },
            { url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=300&fit=crop&auto=format', alt: 'Laboratorija' },
            { url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&auto=format', alt: 'Medicinski tim' },
          ].map(({ url, alt }) => (
            <div key={url} className="aspect-video rounded-xl overflow-hidden relative group" style={{ background: C.s100 }}>
              <img src={url} alt={alt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: '#0b1e3d80' }}>
                <Btn size="sm" variant="secondary" title={`Pregled: ${alt}`} onClick={() => setAssetPreview({ name: alt, url, type: 'image/jpeg' })}><Ic.Eye /></Btn>
                <Btn size="sm" variant="secondary" title={`Otvori izvor: ${alt}`} onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}><Ic.Link /></Btn>
              </div>
            </div>
          ))}
          {attachments.filter(file => file.type.startsWith('image/')).map(file => <div key={file.url} className="aspect-video rounded-xl overflow-hidden relative group" style={{ background: C.s100 }}>
            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100" style={{ background: '#0b1e3d80' }}>
              <Btn size="sm" variant="secondary" onClick={() => setAssetPreview(file)}><Ic.Eye /></Btn>
              <a href={file.url} download={file.name} className="inline-flex items-center rounded-lg px-3 h-8 text-xs" style={{ background: C.s100, color: C.ink5 }}>Preuzmi</a>
            </div></div>)}
          <div className="aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center hover:border-teal-400 transition-colors" style={{ borderColor: C.s300 }}>
            <Ic.Upload />
            <button type="button" className="text-xs mt-1" style={{ color: C.ink3 }} onClick={() => { if (galleryUploadRef.current) { galleryUploadRef.current.accept = 'image/*'; galleryUploadRef.current.click() } }}>Otpremi sliku</button>
          </div>
        </div>
      )}

      <Modal open={!!assetNotice} onClose={() => setAssetNotice('')} title="Dokument nije povezan">
        <p className="text-sm" style={{ color: C.ink7 }}>{assetNotice}</p>
        <div className="flex justify-end mt-5"><Btn onClick={() => setAssetNotice('')}>U redu</Btn></div>
      </Modal>
      <Modal open={!!assetPreview} onClose={() => setAssetPreview(null)} title={assetPreview?.name || 'Pregled fajla'} width="max-w-2xl">
        {assetPreview?.type.startsWith('image/') ? <img src={assetPreview.url} alt={assetPreview.name} className="w-full rounded-lg" />
          : <div className="text-sm" style={{ color: C.ink7 }}>Za ovaj tip fajla koristite otvaranje u pregledaču ili preuzimanje.<div className="mt-4"><a href={assetPreview?.url} target="_blank" rel="noreferrer" className="underline" style={{ color: C.teal2 }}>Otvori fajl</a></div></div>}
      </Modal>

      {/* Preview modal */}
      <Modal open={previewModal} onClose={() => setPreviewModal(false)} title="Pregled vesti" width="max-w-2xl">
        {prevVest && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={prevVest.status} />
              <span className="text-xs" style={{ color: C.ink3 }}>{prevVest.kategorija} · {prevVest.datum}</span>
            </div>
            <h2 style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: C.navy, fontSize: '1.5rem' }}>{prevVest.naslov}</h2>
            <div className="text-xs" style={{ color: C.ink3 }}>Autor: {prevVest.autor}</div>
            {prevVest.sadrzaj ? (
              <div className="text-sm leading-relaxed" style={{ color: C.ink7 }}>{prevVest.sadrzaj}</div>
            ) : (
              <div className="text-sm py-8 text-center" style={{ color: C.ink3 }}>Sadržaj nije unet.</div>
            )}
            <div className="flex gap-3 pt-2">
              <Btn variant="secondary" onClick={() => setPreviewModal(false)}>Zatvori</Btn>
              <Btn onClick={() => { setPreviewModal(false); setEditor(prevVest!) }}><Ic.Edit /> Uredi</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Nova vest modal */}
      <Modal open={novaModal} onClose={() => setNovaModal(false)} title="Nova vest" width="max-w-lg">
        <div className="flex flex-col gap-4">
          <Input label="Naslov vesti" value={newTitle} onChange={setNewTitle} placeholder="Unesite naslov..." colSpan2 />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Kategorija" options={KAT.slice(1)} value={newCategory} onChange={setNewCategory} />
            <Input label="Autor" value={newAuthor} onChange={setNewAuthor} placeholder="Ime autora" />
          </div>
          <div className="flex gap-3 mt-2 justify-end">
            <Btn variant="secondary" onClick={() => setNovaModal(false)}>Otkaži</Btn>
            <Btn onClick={createVest}>Otvori editor</Btn>
          </div>
        </div>
      </Modal>
    </PageWrap>
  )
}
