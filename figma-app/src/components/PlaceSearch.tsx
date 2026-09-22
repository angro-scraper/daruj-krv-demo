import { useMemo, useState } from 'react'
import settlements from '../places-serbia.json'
import { C } from './ui'

const normalize = (value: string) => value.toLocaleLowerCase('sr-Latn-RS')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'dj')

export function PlaceSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const matches = useMemo(() => {
    const query = normalize(value.trim())
    if (query.length < 2) return []
    return settlements.filter(place => normalize(`${place.name} ${place.municipality} ${place.city}`).includes(query))
      .sort((a, b) => {
        const rank = (place: typeof a) => normalize(place.name) === query ? 0 : normalize(place.name).startsWith(query) ? 1 : normalize(place.municipality).startsWith(query) ? 2 : 3
        return rank(a) - rank(b)
      }).slice(0, 8)
  }, [value])

  return <div className="col-span-2 relative">
    <label htmlFor="action-place" className="block text-xs font-medium mb-1" style={{ color: C.ink5 }}>Mesto akcije</label>
    <input id="action-place" role="combobox" aria-expanded={open && matches.length > 0} aria-controls="action-place-options"
      aria-autocomplete="list" autoComplete="off" value={value} onChange={event => { onChange(event.target.value); setOpen(true) }}
      onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 120)}
      placeholder="Kucajte mesto ili opštinu (npr. Smederevo)"
      className="w-full h-10 px-3 rounded-lg border text-sm outline-none" style={{ borderColor: C.s200, background: C.white, color: C.ink7 }} />
    {open && matches.length > 0 && <div id="action-place-options" role="listbox" className="absolute z-50 w-full rounded-lg border shadow-lg overflow-auto max-h-64"
      style={{ background: C.white, borderColor: C.s200 }}>
      {matches.map(place => {
        const label = `${place.name}, ${place.municipality}${place.city !== place.municipality ? ` (${place.city})` : ''}`
        return <button key={place.id} type="button" role="option" aria-selected={value === label}
          onMouseDown={event => event.preventDefault()} onClick={() => { onChange(label); setOpen(false) }}
          className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50" style={{ color: C.ink7 }}>{label}</button>
      })}
    </div>}
    <p className="mt-1 text-xs" style={{ color: C.ink3 }}>Pretraga svih 6.170 naseljenih mesta iz registra RZS; radi i bez interneta.</p>
  </div>
}
