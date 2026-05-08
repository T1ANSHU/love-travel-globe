// Format ISO date strings for display

export function formatDate(isoDate: string, lang: 'zh' | 'en' = 'zh'): string {
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return isoDate
  if (lang === 'zh') {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(isoDate: string, time?: string, lang: 'zh' | 'en' = 'zh'): string {
  const datePart = formatDate(isoDate, lang)
  if (!time) return datePart
  if (lang === 'zh') return `${datePart} ${time}`
  return `${datePart}, ${time}`
}

export function formatYearMonth(isoDate: string, lang: 'zh' | 'en' = 'zh'): string {
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return isoDate
  if (lang === 'zh') return `${d.getFullYear()}年${d.getMonth() + 1}月`
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}
