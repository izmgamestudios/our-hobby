// src/components/Quiz.tsx
import { useState } from 'react'
import { CATALOG } from '../data/hobbies'
import { recommend, type QuizAnswers, type Recommendation } from '../lib/recommend'
import { useStore } from '../store'
import type { Setting, Social, Vibe } from '../types'
import { CatalogCard } from './Discover'

const VIBES: { id: Vibe; label: string }[] = [
  { id: 'creative', label: '🎨 Yaratıcı' },
  { id: 'active', label: '⚡ Hareketli' },
  { id: 'mind', label: '🧠 Zihin açıcı' },
  { id: 'calm', label: '🍃 Sakinleştirici' },
]

const INITIAL: QuizAnswers = { budget: 2, hoursPerWeek: 3, setting: 'both', social: 'both', vibes: [] }

export default function Quiz() {
  const { state } = useStore()
  const [answers, setAnswers] = useState<QuizAnswers>(INITIAL)
  const [results, setResults] = useState<Recommendation[] | null>(null)

  const set = <K extends keyof QuizAnswers>(k: K, v: QuizAnswers[K]) => setAnswers((a) => ({ ...a, [k]: v }))
  const toggleVibe = (v: Vibe) => set('vibes', answers.vibes.includes(v) ? answers.vibes.filter((x) => x !== v) : [...answers.vibes, v])

  function submit() {
    const owned = new Set(state.hobbies.flatMap((h) => (h.catalogId ? [h.catalogId] : [])))
    setResults(recommend(answers, CATALOG, owned))
  }

  if (results) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Sana uygun hobiler</h2>
          <button onClick={() => setResults(null)} className="text-sm text-indigo-600">Testi tekrarla</button>
        </div>
        {results.length === 0 && <p className="text-sm text-slate-500">Katalogdaki tüm hobiler zaten listende 🎉</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((r) => <CatalogCard key={r.hobby.id} hobby={r.hobby} reasons={r.reasons} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 rounded-2xl bg-white p-4 shadow-sm">
      <Question title="Nasıl bir his arıyorsun? (birden fazla seçebilirsin)">
        <div className="flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <Chip key={v.id} active={answers.vibes.includes(v.id)} onClick={() => toggleVibe(v.id)}>{v.label}</Chip>
          ))}
        </div>
      </Question>

      <Question title="Bütçen">
        <Choice value={answers.budget} onChange={(v) => set('budget', v as 1 | 2 | 3)} options={[[1, 'Düşük'], [2, 'Orta'], [3, 'Fark etmez']]} />
      </Question>

      <Question title={`Haftada ayırabileceğin süre: ${answers.hoursPerWeek} saat`}>
        <input type="range" min={1} max={10} value={answers.hoursPerWeek} onChange={(e) => set('hoursPerWeek', Number(e.target.value))} className="w-full" />
      </Question>

      <Question title="Mekân">
        <Choice value={answers.setting} onChange={(v) => set('setting', v as Setting)} options={[['indoor', 'İç mekân'], ['outdoor', 'Dış mekân'], ['both', 'Fark etmez']]} />
      </Question>

      <Question title="Kiminle?">
        <Choice value={answers.social} onChange={(v) => set('social', v as Social)} options={[['solo', 'Tek başıma'], ['group', 'Başkalarıyla'], ['both', 'Fark etmez']]} />
      </Question>

      <button
        onClick={submit}
        disabled={answers.vibes.length === 0}
        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white disabled:opacity-40"
      >
        Önerileri göster
      </button>
    </div>
  )
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-sm ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>
      {children}
    </button>
  )
}

function Choice<T extends string | number>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([v, label]) => (
        <Chip key={String(v)} active={value === v} onClick={() => onChange(v)}>{label}</Chip>
      ))}
    </div>
  )
}
