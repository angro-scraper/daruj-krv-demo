// ── Shared UI Components ───────────────────────────────────────────────────
import { type Role, ROLE_LABELS, ROLE_COLORS } from '../data'
import { createPortal } from 'react-dom'

// ── Color tokens ───────────────────────────────────────────────────────────
export const C = {
  navy: '#0B1E3D', navy2: '#122652', navy3: '#1a3068',
  teal: '#17A89B', teal2: '#0e8a7f', teal3: '#5dd9ce', tealBg: '#17A89B18',
  burgundy: '#8B1A2D', burgundy2: '#b52239', burgundyBg: '#8B1A2D18',
  s50: '#f6f8fb', s100: '#eef1f6', s200: '#dde3ed', s300: '#c4cede',
  ink9: '#0d1117', ink7: '#2c3347', ink5: '#5a6378', ink3: '#8e97a8',
  white: '#ffffff', amber: '#d97706', amberBg: '#fef3c7',
  green: '#15803d', greenBg: '#dcfce7',
}

// ── Typography ─────────────────────────────────────────────────────────────
export function DisplayText({ children, size = 'base', color = C.navy }: { children: React.ReactNode; size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl'; color?: string }) {
  const sizes = { sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl', '2xl': 'text-2xl' }
  return <span className={`font-display ${sizes[size]} leading-tight`} style={{ color, fontFamily: 'DM Serif Display, Georgia, serif' }}>{children}</span>
}

// ── Badges ─────────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    ceka: { label: 'Čeka', bg: C.amberBg, color: C.amber },
    pregled: { label: 'Pregled', bg: '#dbeafe', color: '#1d4ed8' },
    donacija: { label: 'Donacija', bg: C.tealBg, color: C.teal2 },
    zavrseno: { label: 'Završeno', bg: C.greenBg, color: C.green },
    odbijen: { label: 'Odbijen', bg: C.burgundyBg, color: C.burgundy },
    planirana: { label: 'Planirana', bg: '#ede9fe', color: '#7c3aed' },
    aktivna: { label: 'Aktivna', bg: C.tealBg, color: C.teal2 },
    zavrsena: { label: 'Završena', bg: C.s100, color: C.ink5 },
    otkazana: { label: 'Otkazana', bg: C.burgundyBg, color: C.burgundy },
    nacrt: { label: 'Nacrt', bg: C.s100, color: C.ink5 },
    recenzija: { label: 'Recenzija', bg: C.amberBg, color: C.amber },
    odobreno: { label: 'Odobreno', bg: C.tealBg, color: C.teal2 },
    objavljeno: { label: 'Objavljeno', bg: C.greenBg, color: C.green },
    arhivirano: { label: 'Arhivirano', bg: C.s100, color: C.ink3 },
    odbijeno: { label: 'Odbijeno', bg: C.burgundyBg, color: C.burgundy },
    aktivna_int: { label: 'Aktivna', bg: C.greenBg, color: C.green },
    greska: { label: 'Greška', bg: C.burgundyBg, color: C.burgundy },
    degradovana: { label: 'Degradovana', bg: C.amberBg, color: C.amber },
    neaktivna: { label: 'Neaktivna', bg: C.s100, color: C.ink3 },
    uspeh: { label: 'Uspeh', bg: C.greenBg, color: C.green },
    upozorenje: { label: 'Upozorenje', bg: C.amberBg, color: C.amber },
    normalno: { label: 'Normalno', bg: C.s100, color: C.ink5 },
    hitno: { label: 'Hitno', bg: C.burgundyBg, color: C.burgundy },
  }
  const s = map[status] ?? { label: status, bg: C.s100, color: C.ink5 }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

export function BloodBadge({ tip }: { tip: string }) {
  const neg = tip.includes('−')
  return (
    <span className="inline-flex items-center justify-center w-10 h-6 rounded text-white text-xs font-medium"
      style={{ background: neg ? C.burgundy : C.navy3, fontFamily: 'JetBrains Mono, monospace' }}>
      {tip}
    </span>
  )
}

export function RoleBadge({ uloga }: { uloga: Role }) {
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: ROLE_COLORS[uloga] + '18', color: ROLE_COLORS[uloga] }}>
      {ROLE_LABELS[uloga]}
    </span>
  )
}

// ── Layout Primitives ──────────────────────────────────────────────────────
export function Card({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`bg-white rounded-xl border ${className}`} style={{ borderColor: C.s100, ...style }}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }: { title: React.ReactNode; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between px-5 py-4 border-b" style={{ borderColor: C.s100 }}>
      <div>
        <div style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: C.navy, fontSize: '1rem', lineHeight: 1.2 }}>{title}</div>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: C.ink3 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function PageWrap({ children }: { children: React.ReactNode }) {
  return <div className="p-6 flex flex-col gap-5 fade-up">{children}</div>
}

// ── Tabs ───────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: C.s100 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className="px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap"
          style={{
            background: active === t.id ? C.white : 'transparent',
            color: active === t.id ? C.navy : C.ink3,
            boxShadow: active === t.id ? '0 1px 3px #0001' : 'none',
          }}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ── Buttons ────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled = false, type = 'button', className = '', title }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'; disabled?: boolean; type?: 'button' | 'submit'; className?: string; title?: string
}) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-all'
  const sizes = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm' }
  const variants = {
    primary: { background: C.teal, color: C.white },
    secondary: { background: C.s100, color: C.ink5 },
    danger: { background: C.burgundyBg, color: C.burgundy },
    ghost: { background: 'transparent', color: C.ink5 },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${className}`} style={{ ...variants[variant], opacity: disabled ? 0.5 : 1 }} title={title}>
      {children}
    </button>
  )
}

// ── Table ──────────────────────────────────────────────────────────────────
export function Table({ headers, children, empty }: { headers: string[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: C.s50 }}>
            {headers.map(h => (
              <th key={h} className="text-left px-5 py-3 text-xs font-medium whitespace-nowrap" style={{ color: C.ink3 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {empty ? (
            <tr><td colSpan={headers.length} className="px-5 py-12 text-center text-sm" style={{ color: C.ink3 }}>Nema podataka za prikaz.</td></tr>
          ) : children}
        </tbody>
      </table>
    </div>
  )
}

export function TR({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr onClick={onClick} className={`border-t transition-colors ${onClick ? 'cursor-pointer hover:bg-surface-50' : 'hover:bg-surface-50'}`}
      style={{ borderColor: C.s100 }}>
      {children}
    </tr>
  )
}

export function TD({ children, mono = false, muted = false }: { children: React.ReactNode; mono?: boolean; muted?: boolean }) {
  return (
    <td className="px-5 py-3" style={{ color: muted ? C.ink3 : C.ink9, fontFamily: mono ? 'JetBrains Mono, monospace' : undefined, fontSize: mono ? '0.75rem' : undefined }}>
      {children}
    </td>
  )
}

// ── Input ──────────────────────────────────────────────────────────────────
export function Input({ label, type = 'text', value, onChange, placeholder, colSpan2 = false }: {
  label: string; type?: string; value?: string; onChange?: (v: string) => void
  placeholder?: string; colSpan2?: boolean
}) {
  return (
    <div className={colSpan2 ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium mb-1.5" style={{ color: C.ink7 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
        className="w-full h-10 px-3 rounded-lg border text-sm outline-none transition-all"
        style={{ borderColor: C.s200, background: C.s50, color: C.ink9 }}
        onFocus={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.teal}22` }}
        onBlur={e => { e.currentTarget.style.borderColor = C.s200; e.currentTarget.style.boxShadow = 'none' }}
      />
    </div>
  )
}

export function Select({ label, options, value, onChange }: { label: string; options: string[]; value?: string; onChange?: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: C.ink7 }}>{label}</label>
      <select value={value} onChange={e => onChange?.(e.target.value)}
        className="w-full h-10 px-3 rounded-lg border text-sm outline-none"
        style={{ borderColor: C.s200, background: C.s50, color: C.ink9 }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

// ── Search ─────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Pretraži...', width = 'max-w-sm' }: { value: string; onChange: (v: string) => void; placeholder?: string; width?: string }) {
  return (
    <div className={`relative flex-1 ${width}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: C.ink5, display: 'flex' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
      </span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-10 pl-9 pr-4 rounded-lg border text-sm outline-none"
        style={{ borderColor: C.s200, background: C.white, color: C.ink9 }} />
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 'max-w-lg' }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: string }) {
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4" style={{ background: '#0B1E3D80' }} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`bg-white rounded-2xl shadow-xl w-full ${width} max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.s100 }}>
          <span style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: C.navy, fontSize: '1.1rem' }}>{title}</span>
          <button onClick={onClose} className="opacity-40 hover:opacity-100 transition-opacity" style={{ color: C.ink5 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

// ── KPI Card ───────────────────────────────────────────────────────────────
export function KpiCard({ label, value, sub, color, icon, alert = false, onClick }: { label: string; value: string; sub: string; color: string; icon: React.ReactNode; alert?: boolean; onClick?: () => void }) {
  const content = <>
        <div className="flex items-start justify-between">
          <span className="text-xs font-medium" style={{ color: C.ink3 }}>{label}</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + '18', color }}>
            {icon}
          </div>
        </div>
        <div>
          <div className="text-2xl font-medium" style={{ color: alert ? C.burgundy : C.navy, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
          <div className="text-xs mt-1" style={{ color: C.ink3 }}>{sub}</div>
        </div>
      </>
  return (
    <Card>
      {onClick
        ? <button type="button" onClick={onClick} className="p-5 flex flex-col gap-3 w-full text-left hover:bg-slate-50 transition-colors">{content}</button>
        : <div className="p-5 flex flex-col gap-3 w-full text-left">{content}</div>}
    </Card>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: C.s100 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.ink3} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
      </div>
      <p className="text-sm" style={{ color: C.ink3 }}>{message}</p>
    </div>
  )
}

// ── Progress bar ───────────────────────────────────────────────────────────
export function Progress({ value, max, color = C.teal, height = 6 }: { value: number; max: number; color?: string; height?: number }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height, background: C.s100 }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono w-8 text-right" style={{ color: C.ink3, fontFamily: 'JetBrains Mono, monospace' }}>{pct}%</span>
    </div>
  )
}

// ── Confirm dialog ─────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger = false }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; danger?: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <p className="text-sm mb-6" style={{ color: C.ink7 }}>{message}</p>
      <div className="flex gap-3 justify-end">
        <Btn variant="secondary" onClick={onClose}>Otkaži</Btn>
        <Btn variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose() }}>Potvrdi</Btn>
      </div>
    </Modal>
  )
}

// ── Back link ──────────────────────────────────────────────────────────────
export function BackLink({ onClick, label = 'Nazad' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm hover:underline" style={{ color: C.teal }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
      {label}
    </button>
  )
}

// ── Section label ──────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: C.ink3 }}>{children}</span>
}
