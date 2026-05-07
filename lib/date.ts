/** Returns a local-time ISO date string (YYYY-MM-DD) for today or N days ago. */
export function isoDate(daysAgo = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Returns the ISO date string (YYYY-MM-DD) for N days before a given ISO date.
 * Avoids calling new Date() a second time so callers can anchor all arithmetic
 * to a single point-in-time snapshot (important around midnight).
 */
export function isoDateOffset(from: string, daysAgo: number): string {
  const [y, m, day] = from.split('-').map(Number)
  const d = new Date(y, m - 1, day)
  d.setDate(d.getDate() - daysAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
