// src/App.tsx
import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Discover from './components/Discover'
import MyHobbies from './components/MyHobbies'
import Quiz from './components/Quiz'

const TABS = [
  { id: 'dashboard', label: 'Panel', emoji: '📊' },
  { id: 'mine', label: 'Hobilerim', emoji: '🎯' },
  { id: 'discover', label: 'Keşfet', emoji: '🔍' },
  { id: 'quiz', label: 'Bana Hobi Bul', emoji: '✨' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function App() {
  const [tab, setTab] = useState<TabId>('dashboard')

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">🎨 Hobilerim</h1>
        <p className="text-sm text-slate-500">Hobilerini yönet, yenilerini keşfet, her gün biraz ilerle.</p>
      </header>

      <main>
        {tab === 'dashboard' && <Dashboard goTo={setTab} />}
        {tab === 'mine' && <MyHobbies goTo={setTab} />}
        {tab === 'discover' && <Discover />}
        {tab === 'quiz' && <Quiz />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                tab === t.id ? 'font-semibold text-indigo-600' : 'text-slate-500'
              }`}
            >
              <span className="text-lg">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
