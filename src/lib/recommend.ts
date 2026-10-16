// src/lib/recommend.ts
import type { CatalogHobby, Setting, Social, Vibe } from '../types'

export interface QuizAnswers {
  budget: 1 | 2 | 3
  hoursPerWeek: number
  setting: Setting
  social: Social
  vibes: Vibe[]
}

export interface Recommendation {
  hobby: CatalogHobby
  score: number
  reasons: string[]
}

export function recommend(answers: QuizAnswers, catalog: CatalogHobby[], exclude: Set<string>): Recommendation[] {
  return catalog
    .filter((h) => !exclude.has(h.id))
    .map((hobby) => {
      let score = 0
      const reasons: string[] = []

      const vibeMatches = hobby.vibes.filter((v) => answers.vibes.includes(v)).length
      score += vibeMatches * 30
      if (vibeMatches > 0) reasons.push('Aradığın havaya uyuyor')

      if (hobby.cost <= answers.budget) {
        score += 20
        reasons.push('Bütçene uygun')
      } else {
        score -= (hobby.cost - answers.budget) * 25
      }

      if (hobby.hoursPerWeek <= answers.hoursPerWeek) {
        score += 15
        reasons.push('Zamanına sığıyor')
      } else {
        score -= 10
      }

      if (hobby.setting === 'both' || answers.setting === 'both' || hobby.setting === answers.setting) {
        score += 10
      } else {
        score -= 20
      }

      if (hobby.social === 'both' || answers.social === 'both' || hobby.social === answers.social) {
        score += 10
        if (hobby.social === answers.social) reasons.push(answers.social === 'solo' ? 'Tek başına yapılabilir' : 'Birlikte yapılır')
      } else {
        score -= 20
      }

      if (hobby.difficulty === 1) score += 5 // MVP: kolay giriş = daha yüksek bağlılık
      return { hobby, score, reasons }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}
