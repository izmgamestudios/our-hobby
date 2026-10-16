// src/types.ts
export type Vibe = 'creative' | 'active' | 'mind' | 'calm'
export type Setting = 'indoor' | 'outdoor' | 'both'
export type Social = 'solo' | 'group' | 'both'
export type Status = 'wishlist' | 'active' | 'paused'

export interface CatalogHobby {
  id: string
  name: string
  emoji: string
  category: string
  description: string
  cost: 1 | 2 | 3
  hoursPerWeek: number
  setting: Setting
  social: Social
  difficulty: 1 | 2 | 3
  vibes: Vibe[]
  starter: string[]
}

export interface Goal {
  id: string
  text: string
  done: boolean
}

export interface Session {
  id: string
  date: string // YYYY-MM-DD
  minutes: number
  note: string
}

export interface UserHobby {
  id: string
  catalogId?: string
  name: string
  emoji: string
  category: string
  status: Status
  createdAt: string
  goals: Goal[]
  sessions: Session[]
}

export interface AppState {
  hobbies: UserHobby[]
}
