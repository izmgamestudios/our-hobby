# Hobilerim

Kişisel hobi yönetme + hobi keşfetme uygulaması (MVP).

| Modül | Ne yapar |
|---|---|
| Panel | XP/seviye, günlük seri, haftalık grafik, rozetler |
| Hobilerim | Aktif / denemek istediğim / ara verdim; hedefler; seans (süre) kaydı |
| Keşfet | 28 hobilik katalog; arama, kategori, bütçe filtresi |
| Bana Hobi Bul | 5 soruluk test → skorlanmış top 5 öneri |

## Çalıştırma

```bash
npm install
npm run dev
```

## Mimari

- Vite + React + TypeScript + Tailwind v4
- Veri: `localStorage` (`src/lib/storage.ts`). Supabase'e geçişte sadece bu dosya + `store.tsx` değişir.
- Gamification (XP, seri, rozet) tamamen **türetilir**: `src/lib/gamification.ts`; ayrı tabloya gerek yok.

## Yol haritası

1. Supabase Auth + `hobbies/goals/sessions` tabloları (RLS: `user_id = auth.uid()`)
2. Dışa/içe aktarma (JSON) ve PWA
3. Topluluk: hobi bazlı grup, haftalık mücadele, yakındaki etkinlik/mekân haritası
