import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Akcija } from '../data'
import { C, Card, CardHeader, StatusBadge } from './ui'

const CITY_POINTS: Record<string, [number, number]> = {
  Beograd: [44.8125, 20.4612],
  'Novi Sad': [45.2555, 19.8472],
  Niš: [43.3209, 21.8958],
  Kragujevac: [44.0128, 20.9114],
}

function actionPoint(action: Akcija, index: number): [number, number] {
  const location = action.lokacija.toLocaleLowerCase('sr-Latn-RS')
  if (location.includes('sajam')) return [44.8066, 20.4355]
  if (location.includes('studentski trg')) return [44.8189, 20.4574]
  if (location.includes('trg republike')) return [44.8161, 20.4607]
  if (location.includes('nis kampus')) return [45.2527, 19.8413]
  if (location.includes('tvrđava')) return [43.325, 21.895]
  const center = CITY_POINTS[action.filijala] ?? CITY_POINTS.Beograd
  const shift = (index % 5) * 0.006
  return [center[0] + shift, center[1] - shift]
}

export function ActionMap({ actions, onOpenActions }: { actions: Akcija[]; onOpenActions?: () => void }) {
  const mapElement = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(actions.find(action => action.status === 'aktivna')?.id ?? actions[0]?.id ?? null)
  const selected = actions.find(action => action.id === selectedId) ?? actions[0]

  useEffect(() => {
    if (!mapElement.current) return
    const map = L.map(mapElement.current, { scrollWheelZoom: false, zoomControl: false }).setView([44.2, 20.8], 7)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const points: [number, number][] = []
    actions.forEach((action, index) => {
      const point = actionPoint(action, index)
      points.push(point)
      L.circleMarker(point, {
        radius: action.status === 'aktivna' ? 10 : 8,
        weight: 3,
        color: C.white,
        fillColor: action.status === 'aktivna' ? C.burgundy : action.status === 'planirana' ? C.teal : C.navy3,
        fillOpacity: 1,
      }).addTo(map).bindTooltip(action.naziv).on('click', () => setSelectedId(action.id))
    })
    if (points.length) map.fitBounds(points, { padding: [32, 32], maxZoom: 9 })
    const refresh = window.setTimeout(() => map.invalidateSize(), 100)
    return () => { window.clearTimeout(refresh); map.remove() }
  }, [actions])

  return (
    <Card>
      <CardHeader title="Mapa akcija" subtitle="Izaberite tačku za podatke o akciji" action={onOpenActions &&
        <button onClick={onOpenActions} className="text-xs font-medium" style={{ color: C.teal }}>Sve akcije →</button>
      } />
      <div className="grid lg:grid-cols-[minmax(0,1.8fr)_minmax(260px,1fr)]">
        <div ref={mapElement} role="region" aria-label="Mapa akcija u Srbiji" className="h-[300px] sm:h-[340px] z-0" />
        <div className="p-5 border-t lg:border-t-0 lg:border-l flex flex-col gap-4" style={{ borderColor: C.s100 }}>
          {selected ? <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs mb-1" style={{ color: C.ink3 }}>{selected.id}</div>
                <div className="font-medium leading-snug" style={{ color: C.navy }}>{selected.naziv}</div>
              </div>
              <StatusBadge status={selected.status} />
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-xs">
              {[
                ['Datum', selected.datum], ['Mesto', selected.lokacija],
                ['Filijala', selected.filijala], ['Koordinator', selected.koordinator],
                ['Kapacitet', String(selected.kapacitet)], ['Prijavljeni', String(selected.prijavljeni)],
                ['Donacije', String(selected.donacije)],
              ].map(([label, value]) => <div key={label} className="min-w-0"><dt style={{ color: C.ink3 }}>{label}</dt><dd className="font-medium break-words mt-0.5" style={{ color: C.ink7 }}>{value}</dd></div>)}
            </dl>
            {onOpenActions && <button onClick={onOpenActions} className="mt-auto h-9 px-4 rounded-lg text-sm font-medium self-start" style={{ background: C.teal, color: C.white }}>Otvori akcije →</button>}
          </> : <p className="text-sm" style={{ color: C.ink3 }}>Nema akcija za prikaz.</p>}
        </div>
      </div>
      <p className="px-5 py-2 text-[11px] border-t" style={{ borderColor: C.s100, color: C.ink3 }}>Prikazane su demonstracione akcije. Za lokacije bez adrese koordinate su približne prema filijali.</p>
    </Card>
  )
}
