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
