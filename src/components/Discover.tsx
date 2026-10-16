// src/components/Discover.tsx
import { useMemo, useState } from 'react'
import { CATALOG, CATEGORIES } from '../data/hobbies'
import { useStore } from '../store'
import type { CatalogHobby } from '../types'

const COST_LABEL = ['', '₺ Ucuz', '₺₺ Orta', '₺₺₺ Pahalı']
const DIFF_LABEL = ['', 'Kolay', 'Orta', 'Zor']

export default function Discover() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [maxCost, setMaxCost] = useState<number>(3)

  const list = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase('tr')
    return CATALOG.filter(
      (h) =>
        (category === 'all' || h.category === category) &&
        h.cost <= maxCost &&
        (!needle || h.name.toLocaleLowerCase('tr').includes(needle) || h.description.toLocaleLowerCase('tr').includes(needle)),
    )
  }, [q, category, maxCost])

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-2xl bg-white p-3 shadow-sm">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Hobi ara…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
            <option value="all">Tüm kategoriler</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={maxCost} onChange={(e) => setMaxCost(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
            <option value={1}>Sadece ucuz</option>
            <option value={2}>Orta bütçeye kadar</option>
            <option value={3}>Her bütçe</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-slate-500">{list.length} hobi</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((h) => <CatalogCard key={h.id} hobby={h} />)}
      </div>
    </div>
  )
}

export function CatalogCard({ hobby: h, reasons }: { hobby: CatalogHobby; reasons?: string[] }) {
  const { state, addFromCatalog } = useStore()
  const owned = state.hobbies.find((u) => u.catalogId === h.id)

  return (
    <article className="flex flex-col rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{h.emoji}</span>
        <div>
          <h3 className="font-semibold">{h.name}</h3>
          <p className="text-xs text-slate-500">
            {h.category} · {COST_LABEL[h.cost]} · {DIFF_LABEL[h.difficulty]} · ~{h.hoursPerWeek}s/hafta
          </p>
        </div>
      </div>
      <p className="mt-2 flex-1 text-sm text-slate-600">{h.description}</p>
      {reasons && reasons.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {reasons.map((r) => <span key={r} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">{r}</span>)}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        {owned ? (
          <span className="text-xs text-slate-500">✓ Listende</span>
        ) : (
          <>
            <button onClick={() => addFromCatalog(h, 'active')} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white">Başla</button>
            <button onClick={() => addFromCatalog(h, 'wishlist')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs">Denemek istiyorum</button>
          </>
        )}
      </div>
    </article>
  )
}
