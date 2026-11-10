// src/lib/storage.ts
// Tek giriş noktası: ileride Supabase'e geçişte yalnızca bu dosya değişir.
import type { AppState } from '../types'

const KEY = 'our-hobby:v1'
const EMPTY: AppState = { hobbies: [] }

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as AppState
    return Array.isArray(parsed.hobbies) ? parsed : EMPTY
  } catch {
    return EMPTY
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // depolama dolu / kapalı: sessizce geç
  }
}

export function exportJson(state: AppState): string {
  return JSON.stringify({ app: 'our-hobby', version: 1, ...state }, null, 2)
}

// Dışarıdan gelen dosyayı güvenle doğrular; geçersizse null döner.
export function parseImport(text: string): AppState | null {
  try {
    const data = JSON.parse(text) as Partial<AppState>
    if (!data || !Array.isArray(data.hobbies)) return null
    const ok = data.hobbies.every(
      (h) =>
        h &&
        typeof h.id === 'string' &&
        typeof h.name === 'string' &&
        Array.isArray(h.goals) &&
        Array.isArray(h.sessions) &&
        h.sessions.every((x) => typeof x.date === 'string' && Number.isFinite(x.minutes)),
    )
    return ok ? { hobbies: data.hobbies } : null
  } catch {
    return null
  }
}
