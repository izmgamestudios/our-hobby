// src/components/Dashboard.tsx
import { useRef } from 'react'
import { exportJson, parseImport } from '../lib/storage'
import { badges, currentStreak, levelInfo, minutesByDay, totalXp } from '../lib/gamification'
import { lastNDays, toDay } from '../lib/date'
import { useStore } from '../store'

interface Props {
  goTo: (tab: 'mine' | 'discover' | 'quiz') => void
}

const DAY_LABELS = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct']

export default function Dashboard({ goTo }: Props) {
  const { state, dispatch } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const xp = totalXp(state)
  const lvl = levelInfo(xp)
  const streak = currentStreak(state)
  const perDay = minutesByDay(state)
  const week = lastNDays(7)
  const weekMinutes = week.reduce((s, d) => s + (perDay.get(d) ?? 0), 0)
  const maxDay = Math.max(30, ...week.map((d) => perDay.get(d) ?? 0))
  const today = toDay()
  const active = state.hobbies.filter((h) => h.status === 'active')

  function download() {
    const url = URL.createObjectURL(new Blob([exportJson(state)], { type: 'application/json' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `hobilerim-${today}.json` })
    a.click()
    URL.revokeObjectURL(url)
  }

  async function upload(file: File | undefined) {
    if (!file) return
    const parsed = parseImport(await file.text())
    if (!parsed) return alert('Geçersiz yedek dosyası.')
    if (confirm(`${parsed.hobbies.length} hobi yüklenecek. Mevcut verilerin üzerine yazılır, devam edilsin mi?`))
      dispatch({ type: 'replace', state: parsed })
  }

  if (state.hobbies.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <div className="text-4xl">🌱</div>
        <h2 className="mt-2 text-lg font-semibold">Henüz hobin yok</h2>
        <p className="mt-1 text-sm text-slate-500">Küçük bir adımla başla: bir hobi seç ya da sana uygun olanı bulalım.</p>
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={() => goTo('quiz')} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">✨ Bana hobi bul</button>
          <button onClick={() => goTo('discover')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">🔍 Keşfet</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Seviye" value={`Lv ${lvl.level}`} />
        <Stat label="Seri" value={`🔥 ${streak} gün`} />
        <Stat label="Bu hafta" value={`${Math.floor(weekMinutes / 60)}s ${weekMinutes % 60}dk`} />
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{xp} XP</span>
          <span className="text-slate-500">Sonraki seviyeye {lvl.needed - lvl.current} XP</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-indigo-500" style={{ width: `${(lvl.current / lvl.needed) * 100}%` }} />
        </div>
      </section>

      {active.length > 0 && (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold">Bugün hızlı kayıt</h2>
          <ul className="space-y-2">
            {active.map((h) => {
              const todayMin = h.sessions.filter((s) => s.date === today).reduce((t, s) => t + s.minutes, 0)
              return (
                <li key={h.id} className="flex items-center gap-2 text-sm">
                  <span className="text-xl">{h.emoji}</span>
                  <span className="min-w-0 flex-1 truncate">
                    {h.name}
                    {todayMin > 0 && <span className="ml-1 text-xs text-emerald-600">✓ {todayMin} dk</span>}
                  </span>
                  {[15, 30, 60].map((m) => (
                    <button
                      key={m}
                      onClick={() => dispatch({ type: 'addSession', id: h.id, date: today, minutes: m, note: '' })}
                      className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 active:bg-indigo-100"
                    >
                      +{m}
                    </button>
                  ))}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">Son 7 gün (dakika)</h2>
        <div className="flex h-28 items-end gap-2">
          {week.map((d) => {
            const m = perDay.get(d) ?? 0
            const [y, mo, da] = d.split('-').map(Number)
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-slate-500">{m || ''}</span>
                <div
                  className={`w-full rounded-t ${d === today ? 'bg-indigo-500' : 'bg-indigo-300'}`}
                  style={{ height: `${Math.max(2, (m / maxDay) * 80)}px` }}
                />
                <span className="text-[10px] text-slate-500">{DAY_LABELS[new Date(y, mo - 1, da).getDay()]}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold">Rozetler</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {badges(state).map((b) => (
            <div key={b.id} className={`rounded-xl border p-3 text-center ${b.earned ? 'border-amber-300 bg-amber-50' : 'border-slate-200 opacity-50'}`}>
              <div className="text-2xl">{b.emoji}</div>
              <div className="text-xs font-semibold">{b.name}</div>
              <div className="text-[10px] text-slate-500">{b.description}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-center gap-4 pt-2 text-xs text-slate-500">
        <button onClick={download} className="underline">Yedeği indir</button>
        <button onClick={() => fileRef.current?.click()} className="underline">Yedekten yükle</button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = '' }} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}
