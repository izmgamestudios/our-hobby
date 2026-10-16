// src/lib/gamification.ts
import type { AppState, UserHobby } from '../types'
import { addDays, toDay } from './date'

const XP_PER_MINUTE = 1
const XP_PER_SESSION = 20
const XP_PER_GOAL = 50

export function hobbyXp(h: UserHobby): number {
  const minutes = h.sessions.reduce((s, x) => s + x.minutes, 0)
  const goals = h.goals.filter((g) => g.done).length
  return minutes * XP_PER_MINUTE + h.sessions.length * XP_PER_SESSION + goals * XP_PER_GOAL
}

export function totalXp(state: AppState): number {
  return state.hobbies.reduce((s, h) => s + hobbyXp(h), 0)
}

export interface LevelInfo {
  level: number
  current: number
  needed: number
}

// Seviye n için gereken toplam XP: 100 * (n-1)^2
export function levelInfo(xp: number): LevelInfo {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1
  const floor = 100 * (level - 1) ** 2
  const next = 100 * level ** 2
  return { level, current: xp - floor, needed: next - floor }
}

export function activeDays(state: AppState): Set<string> {
  return new Set(state.hobbies.flatMap((h) => h.sessions.map((s) => s.date)))
}

// Bugün kayıt yoksa dünden saymaya başla; seri hemen sıfırlanmasın.
export function currentStreak(state: AppState, today: string = toDay()): number {
  const days = activeDays(state)
  let cursor = days.has(today) ? today : addDays(today, -1)
  let streak = 0
  while (days.has(cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function minutesByDay(state: AppState): Map<string, number> {
  const map = new Map<string, number>()
  for (const h of state.hobbies)
    for (const s of h.sessions) map.set(s.date, (map.get(s.date) ?? 0) + s.minutes)
  return map
}

export interface Badge {
  id: string
  name: string
  emoji: string
  description: string
  earned: boolean
}

export function badges(state: AppState): Badge[] {
  const sessions = state.hobbies.flatMap((h) => h.sessions)
  const minutes = sessions.reduce((s, x) => s + x.minutes, 0)
  const goals = state.hobbies.flatMap((h) => h.goals).filter((g) => g.done).length
  const streak = currentStreak(state)
  const active = state.hobbies.filter((h) => h.status === 'active').length
  return [
    { id: 'first', name: 'İlk Adım', emoji: '🌟', description: 'İlk seansını kaydet', earned: sessions.length >= 1 },
    { id: 'streak3', name: '3 Gün Seri', emoji: '🔥', description: '3 gün üst üste pratik yap', earned: streak >= 3 },
    { id: 'streak7', name: 'Haftalık Seri', emoji: '⚡', description: '7 gün üst üste pratik yap', earned: streak >= 7 },
    { id: 'hour10', name: '10 Saat', emoji: '⏱️', description: 'Toplam 10 saat pratik', earned: minutes >= 600 },
    { id: 'hour50', name: '50 Saat', emoji: '🏅', description: 'Toplam 50 saat pratik', earned: minutes >= 3000 },
    { id: 'goal', name: 'Hedef Avcısı', emoji: '🎯', description: 'İlk hedefini tamamla', earned: goals >= 1 },
    { id: 'multi', name: 'Çok Yönlü', emoji: '🎭', description: '3 aktif hobi edin', earned: active >= 3 },
  ]
}
