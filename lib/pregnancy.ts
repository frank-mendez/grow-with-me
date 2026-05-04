export function getCurrentWeek(dueDate: string | null): number | null {
  if (!dueDate) return null

  const parts = dueDate.split('-')
  if (parts.length !== 3) return null

  const [y, m, d] = parts.map(Number)
  if (![y, m, d].every((v) => Number.isInteger(v) && Number.isFinite(v))) return null

  const now = new Date()
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const dueUtc = Date.UTC(y, m - 1, d)

  const parsed = new Date(dueUtc)
  if (
    parsed.getUTCFullYear() !== y ||
    parsed.getUTCMonth() !== m - 1 ||
    parsed.getUTCDate() !== d
  ) return null

  // Include the due date itself as the final day of week 40
  const startUtc = dueUtc - 279 * 86_400_000
  const daysElapsed = Math.floor((todayUtc - startUtc) / 86_400_000)
  if (!Number.isFinite(daysElapsed) || daysElapsed < 0 || daysElapsed >= 280) return null
  return Math.floor(daysElapsed / 7) + 1
}

// Maps week number to a visual scale (0.4 at week 1 → 1.0 at week 40)
export function computeProgress(weekNumber: number): number {
  return 0.4 + ((weekNumber - 1) / 39) * 0.6
}
