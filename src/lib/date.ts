// src/lib/date.ts
export function toDay(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(day: string, delta: number): string {
  const [y, m, d] = day.split('-').map(Number)
  return toDay(new Date(y, m - 1, d + delta))
}

export function lastNDays(n: number, today: string = toDay()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)))
}
