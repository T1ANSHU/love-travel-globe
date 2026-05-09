import { useState, useEffect } from 'react'

// localStorage key per user — avoids cross-account bleed
function storageKey(userId: string): string {
  return `ltg_couple_start_date_${userId}`
}

// Fallback used when no date has been saved yet
export const COUPLE_DATE_FALLBACK = '2024-05-20'

export function useCoupleDate(userId: string | undefined) {
  // Start with fallback; sync from localStorage once userId is available
  const [date, setDate] = useState<string>(COUPLE_DATE_FALLBACK)

  useEffect(() => {
    if (!userId) return
    const saved = localStorage.getItem(storageKey(userId))
    if (saved) setDate(saved)
  }, [userId])

  const save = (newDate: string) => {
    setDate(newDate)
    if (userId) {
      localStorage.setItem(storageKey(userId), newDate)
    }
  }

  return { date, save }
}
