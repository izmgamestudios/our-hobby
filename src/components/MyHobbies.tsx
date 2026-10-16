// src/components/MyHobbies.tsx
import { useState, type FormEvent } from 'react'
import { CATEGORIES } from '../data/hobbies'
import { toDay } from '../lib/date'
import { hobbyXp } from '../lib/gamification'
import { useStore } from '../store'
import type { Status, UserHobby } from '../types'

const STATUS_LABEL: Record<Status, string> = { active: 'Aktif', wishlist: 'Denemek istiyorum', paused: 'Ara verdim' }

interface Props {
  goTo: (tab: 'discover' | 'quiz') => void
}

export default function MyHobbies({ goTo }: Props) {
  const { state, addCustom } = useStore()
  const [filter, setFilter] = useState<Status | 'all'>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const list = state.hobbies.filter((h) => filter === 'all' || h.status === filter)

  function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name')).trim()
    if (!name) return
    addCustom(name, String(f.get('emoji')).trim() || '⭐', String(f.get('category')))
    setAdding(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'active', 'wishlist', 'paused'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs ${filter === s ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 shadow-sm'}`}
          >
            {s === 'all' ? 'Tümü' : STATUS_LABEL[s]}
          </button>
        ))}
        <button onClick={() => setAdding((v) => !v)} className="ml-auto rounded-full bg-emerald-600 px-3 py-1 text-xs text-white">
          + Kendi hobim
        </button>
      </div>

      {adding && (
        <form onSubmit={onAdd} className="flex flex-wrap gap-2 rounded-2xl bg-white p-3 shadow-sm">
          <input name="emoji" placeholder="🎲" maxLength={2} className="w-14 rounded-lg border border-slate-300 px-2 py-1.5 text-center" />
          <input name="name" placeholder="Hobi adı" required maxLength={40} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5" />
          <select name="category" className="rounded-lg border border-slate-300 px-2 py-1.5">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm text-white">Ekle</button>
        </form>
      )}

      {list.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Burada gösterilecek hobi yok.
          <div className="mt-3 flex justify-center gap-2">
            <button onClick={() => goTo('quiz')} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white">✨ Bana hobi bul</button>
            <button onClick={() => goTo('discover')} className="rounded-lg border border-slate-300 px-3 py-1.5">🔍 Keşfet</button>
          </div>
        </div>
      )}

      {list.map((h) => (
        <HobbyCard key={h.id} hobby={h} open={openId === h.id} onToggle={() => setOpenId(openId === h.id ? null : h.id)} />
      ))}
    </div>
  )
}

function HobbyCard({ hobby: h, open, onToggle }: { hobby: UserHobby; open: boolean; onToggle: () => void }) {
  const { dispatch } = useStore()
  const totalMin = h.sessions.reduce((s, x) => s + x.minutes, 0)
  const doneGoals = h.goals.filter((g) => g.done).length

  function onSession(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const minutes = Number(f.get('minutes'))
    if (!Number.isFinite(minutes) || minutes <= 0) return
    dispatch({ type: 'addSession', id: h.id, date: String(f.get('date')) || toDay(), minutes, note: String(f.get('note')).trim() })
    e.currentTarget.reset()
  }

  function onGoal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const text = String(f.get('text')).trim()
    if (!text) return
    dispatch({ type: 'addGoal', id: h.id, text })
    e.currentTarget.reset()
  }

  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm">
      <button onClick={onToggle} className="flex w-full items-center gap-3 text-left">
        <span className="text-3xl">{h.emoji}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{h.name}</span>
          <span className="block text-xs text-slate-500">
            {STATUS_LABEL[h.status]} · {Math.floor(totalMin / 60)}s {totalMin % 60}dk · {doneGoals}/{h.goals.length} hedef · {hobbyXp(h)} XP
          </span>
        </span>
        <span className="text-slate-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Durum:</span>
            {(['active', 'wishlist', 'paused'] as const).map((s) => (
              <button
                key={s}
                onClick={() => dispatch({ type: 'setStatus', id: h.id, status: s })}
                className={`rounded-full px-2.5 py-1 ${h.status === s ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
            <button
              onClick={() => confirm(`"${h.name}" silinsin mi? Tüm kayıtları da silinir.`) && dispatch({ type: 'remove', id: h.id })}
              className="ml-auto shrink-0 text-red-600"
            >
              Sil
            </button>
          </div>

          <section>
            <h3 className="mb-2 text-sm font-semibold">Hedefler</h3>
            <ul className="space-y-1">
              {h.goals.map((g) => (
                <li key={g.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={g.done} onChange={() => dispatch({ type: 'toggleGoal', id: h.id, goalId: g.id })} />
                  <span className={g.done ? 'text-slate-400 line-through' : ''}>{g.text}</span>
                  <button onClick={() => dispatch({ type: 'removeGoal', id: h.id, goalId: g.id })} className="ml-auto text-xs text-slate-400" aria-label="Hedefi sil">✕</button>
                </li>
              ))}
            </ul>
            <form onSubmit={onGoal} className="mt-2 flex gap-2">
              <input name="text" placeholder="Yeni hedef…" maxLength={120} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
              <button className="rounded-lg bg-slate-800 px-3 text-sm text-white">Ekle</button>
            </form>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold">Seans kaydet (+XP)</h3>
            <form onSubmit={onSession} className="flex flex-wrap gap-2">
              <input name="date" type="date" defaultValue={toDay()} max={toDay()} className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
              <input name="minutes" type="number" min={1} max={1440} placeholder="dk" required className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
              <input name="note" placeholder="Not (opsiyonel)" maxLength={200} className="order-last min-w-0 basis-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm sm:order-none sm:basis-0 sm:flex-1" />
              <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white">Kaydet</button>
            </form>
            <ul className="mt-2 divide-y divide-slate-100 text-sm">
              {h.sessions.slice(0, 10).map((s) => (
                <li key={s.id} className="flex items-center gap-2 py-1.5">
                  <span className="text-xs text-slate-500">{s.date}</span>
                  <span className="font-medium">{s.minutes} dk</span>
                  <span className="min-w-0 flex-1 truncate text-slate-500">{s.note}</span>
                  <button onClick={() => dispatch({ type: 'removeSession', id: h.id, sessionId: s.id })} className="text-xs text-slate-400" aria-label="Seansı sil">✕</button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </article>
  )
}
