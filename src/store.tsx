// src/store.tsx
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { loadState, saveState } from './lib/storage'
import type { AppState, CatalogHobby, Status, UserHobby } from './types'

type Action =
  | { type: 'add'; hobby: UserHobby }
  | { type: 'remove'; id: string }
  | { type: 'setStatus'; id: string; status: Status }
  | { type: 'addSession'; id: string; date: string; minutes: number; note: string }
  | { type: 'removeSession'; id: string; sessionId: string }
  | { type: 'addGoal'; id: string; text: string }
  | { type: 'toggleGoal'; id: string; goalId: string }
  | { type: 'removeGoal'; id: string; goalId: string }

const uid = () => crypto.randomUUID()

function patch(state: AppState, id: string, fn: (h: UserHobby) => UserHobby): AppState {
  return { hobbies: state.hobbies.map((h) => (h.id === id ? fn(h) : h)) }
}

function reducer(state: AppState, a: Action): AppState {
  switch (a.type) {
    case 'add':
      return { hobbies: [a.hobby, ...state.hobbies] }
    case 'remove':
      return { hobbies: state.hobbies.filter((h) => h.id !== a.id) }
    case 'setStatus':
      return patch(state, a.id, (h) => ({ ...h, status: a.status }))
    case 'addSession':
      return patch(state, a.id, (h) => ({
        ...h,
        status: h.status === 'wishlist' ? 'active' : h.status,
        sessions: [{ id: uid(), date: a.date, minutes: a.minutes, note: a.note }, ...h.sessions],
      }))
    case 'removeSession':
      return patch(state, a.id, (h) => ({ ...h, sessions: h.sessions.filter((s) => s.id !== a.sessionId) }))
    case 'addGoal':
      return patch(state, a.id, (h) => ({ ...h, goals: [...h.goals, { id: uid(), text: a.text, done: false }] }))
    case 'toggleGoal':
      return patch(state, a.id, (h) => ({
        ...h,
        goals: h.goals.map((g) => (g.id === a.goalId ? { ...g, done: !g.done } : g)),
      }))
    case 'removeGoal':
      return patch(state, a.id, (h) => ({ ...h, goals: h.goals.filter((g) => g.id !== a.goalId) }))
  }
}

interface Store {
  state: AppState
  addFromCatalog: (c: CatalogHobby, status: Status) => void
  addCustom: (name: string, emoji: string, category: string) => void
  dispatch: React.Dispatch<Action>
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => saveState(state), [state])

  const value = useMemo<Store>(
    () => ({
      state,
      dispatch,
      addFromCatalog: (c, status) =>
        dispatch({
          type: 'add',
          hobby: {
            id: uid(),
            catalogId: c.id,
            name: c.name,
            emoji: c.emoji,
            category: c.category,
            status,
            createdAt: new Date().toISOString(),
            goals: c.starter.map((text) => ({ id: uid(), text, done: false })),
            sessions: [],
          },
        }),
      addCustom: (name, emoji, category) =>
        dispatch({
          type: 'add',
          hobby: { id: uid(), name, emoji, category, status: 'active', createdAt: new Date().toISOString(), goals: [], sessions: [] },
        }),
    }),
    [state],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside StoreProvider')
  return s
}
