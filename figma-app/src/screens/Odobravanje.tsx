import { useEffect, useState } from 'react'
import { ODOBRAVANJE_LISTA, type Odobravanje, type Vest } from '../data'
import { C, PageWrap, Card, CardHeader, StatusBadge, Table, TR, TD, Btn, Modal, ConfirmDialog, EmptyState } from '../components/ui'
import { Ic } from '../components/Icons'

const APPROVALS_KEY = 'portal-figma-approvals-v1'
const NEWS_KEY = 'portal-figma-vesti-v1'

export function loadApprovals(): Odobravanje[] {
  let previous: Odobravanje[] = ODOBRAVANJE_LISTA
  try {
    const stored = JSON.parse(localStorage.getItem(APPROVALS_KEY) || 'null')
    if (Array.isArray(stored)) previous = stored
    const news = JSON.parse(localStorage.getItem(NEWS_KEY) || 'null') as Vest[] | null
    if (!Array.isArray(news)) return previous
    const pending = news.filter(item => item.status === 'recenzija')
    return [
      ...previous,
      ...pending.filter(vest => !previous.some(item => item.naziv === vest.naslov)).map(vest => ({
        id: `OD-${vest.id}`, tip: 'Vest', naziv: vest.naslov, podnosilac: vest.autor,
        datum: vest.datum, status: 'ceka' as const, hitnost: 'normalno' as const,
      })),
    ]
  } catch {
    return previous
  }
}

export default function OdobravanjeScreen() {
  const [lista, setLista] = useState<Odobravanje[]>(loadApprovals)
  const [selItem, setSelItem] = useState<Odobravanje | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAkcija, setConfirmAkcija] = useState<'odobreno' | 'odbijeno'>('odobreno')
  const [filterStatus, setFilterStatus] = useState<'sve' | 'ceka' | 'odobreno' | 'odbijeno'>('ceka')
  const [komentar, setKomentar] = useState('')

  useEffect(() => { localStorage.setItem(APPROVALS_KEY, JSON.stringify(lista)) }, [lista])

  const filtered = lista.filter(o => filterStatus === 'sve' || o.status === filterStatus)
  const naCekanju = lista.filter(o => o.status === 'ceka').length

  function handleOdluka(akcija: 'odobreno' | 'odbijeno') {
    if (!selItem) return
    setLista(prev => prev.map(o => o.id === selItem.id ? { ...o, status: akcija } : o))
    if (selItem.tip === 'Vest') {
      try {
        const news = JSON.parse(localStorage.getItem(NEWS_KEY) || '[]') as Vest[]
        localStorage.setItem(NEWS_KEY, JSON.stringify(news.map(vest => vest.naslov === selItem.naziv
          ? { ...vest, status: akcija === 'odobreno' ? 'odobreno' : 'nacrt', verzija: vest.verzija + 1 }
          : vest)))
      } catch { /* Invalid local demo data must not block the decision UI. */ }
    }
    setModalOpen(false)
    setKomentar('')
  }

  return (
    <PageWrap>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: C.s100 }}>
          {(['ceka', 'odobreno', 'odbijeno', 'sve'] as const).map(s => {
            const label = s === 'ceka' ? `Na čekanju (${naCekanju})` : s === 'odobreno' ? 'Odobreno' : s === 'odbijeno' ? 'Odbijeno' : 'Sve'
            return (
              <button key={s} onClick={() => setFilterStatus(s)}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap"
                style={{
                  background: filterStatus === s ? C.white : 'transparent',
                  color: filterStatus === s ? (s === 'ceka' ? C.burgundy : C.navy) : C.ink3,
                  boxShadow: filterStatus === s ? '0 1px 3px #0001' : 'none',
                }}>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <Card>
        <CardHeader title="Red odobravanja" subtitle={`${filtered.length} zahteva`} />
        <Table headers={['ID', 'Tip', 'Naziv', 'Podnosilac', 'Datum', 'Hitnost', 'Status', 'Akcija']}>
          {filtered.length === 0
            ? <tr><td colSpan={8}><EmptyState message="Nema zahteva u ovoj kategoriji." /></td></tr>
            : filtered.map(o => (
              <TR key={o.id}>
                <TD mono muted>{o.id}</TD>
                <TD>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: C.s100, color: C.ink5 }}>{o.tip}</span>
                </TD>
                <TD><span className="font-medium" style={{ color: C.ink9 }}>{o.naziv}</span></TD>
                <TD muted>{o.podnosilac}</TD>
                <TD mono>{o.datum}</TD>
                <TD><StatusBadge status={o.hitnost} /></TD>
                <TD><StatusBadge status={o.status === 'ceka' ? 'ceka' : o.status} /></TD>
                <TD>
                  {o.status === 'ceka' ? (
                    <Btn size="sm" onClick={() => { setSelItem(o); setModalOpen(true) }}>
                      Pregledaj
                    </Btn>
                  ) : (
                    <Btn variant="ghost" size="sm" onClick={() => { setSelItem(o); setModalOpen(true) }}>
                      <Ic.Eye />
                    </Btn>
                  )}
                </TD>
              </TR>
            ))}
        </Table>
      </Card>

      {/* Pregled zahteva */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Pregled zahteva za odobrenje" width="max-w-lg">
        {selItem && (
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono mb-1" style={{ color: C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{selItem.id}</div>
                <div className="text-lg" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: C.navy }}>{selItem.naziv}</div>
              </div>
              <StatusBadge status={selItem.hitnost} />
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl" style={{ background: C.s50 }}>
              {[
                { l: 'Tip zahteva', v: selItem.tip },
                { l: 'Podnosilac', v: selItem.podnosilac },
                { l: 'Datum podnošenja', v: selItem.datum },
                { l: 'Hitnost', v: selItem.hitnost === 'hitno' ? '🔴 Hitno' : '🟡 Normalno' },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div className="text-xs mb-0.5" style={{ color: C.ink3 }}>{l}</div>
                  <div className="text-sm font-medium" style={{ color: C.ink7 }}>{v}</div>
                </div>
              ))}
            </div>

            {selItem.status === 'ceka' && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: C.ink7 }}>Komentar (opciono)</label>
                <textarea rows={3} value={komentar} onChange={e => setKomentar(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                  style={{ borderColor: C.s200, background: C.s50 }} placeholder="Napomena uz odluku..." />
              </div>
            )}

            {selItem.status === 'ceka' ? (
              <div className="flex gap-3">
                <Btn onClick={() => { setConfirmAkcija('odobreno'); setConfirmOpen(true) }} className="flex-1">
                  <Ic.Check /> Odobri
                </Btn>
                <Btn variant="danger" onClick={() => { setConfirmAkcija('odbijeno'); setConfirmOpen(true) }} className="flex-1">
                  <Ic.X /> Odbij
                </Btn>
                <Btn variant="secondary" onClick={() => setModalOpen(false)}>Otkaži</Btn>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex-1 rounded-xl p-3 text-center" style={{ background: selItem.status === 'odobreno' ? '#dcfce7' : C.burgundyBg }}>
                  <div className="text-sm font-medium" style={{ color: selItem.status === 'odobreno' ? '#15803d' : C.burgundy }}>
                    {selItem.status === 'odobreno' ? '✓ Odobreno' : '✕ Odbijeno'}
                  </div>
                </div>
                <Btn variant="secondary" onClick={() => setModalOpen(false)}>Zatvori</Btn>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => handleOdluka(confirmAkcija)}
        title={confirmAkcija === 'odobreno' ? 'Potvrda odobrenja' : 'Potvrda odbijanja'}
        message={`Da li ste sigurni da želite da ${confirmAkcija === 'odobreno' ? 'odobrite' : 'odbijete'} zahtev "${selItem?.naziv}"?`}
        danger={confirmAkcija === 'odbijeno'}
      />
    </PageWrap>
  )
}
