export function fillMissingRows<K extends string, T extends Record<K, string>>(
  rows: T[],
  dateKey: K,
  createEmpty: (dateValue: string) => T,
): T[] {
  if (rows.length === 0) return []
  const existing = new Map<number, T>()
  for (const row of rows) {
    existing.set(monthKey(row[dateKey]), row)
  }

  const startKey = monthKey(rows[0][dateKey])
  const endKey = Math.max(
    monthKey(rows[rows.length - 1][dateKey]),
    monthKey(currentMonthStr()),
  )

  const filled: T[] = []
  for (let key = startKey; key <= endKey; key++) {
    const found = existing.get(key)
    filled.push(found ?? createEmpty(keyToMonthStr(key)))
  }

  return filled
}

/** Current month/year as "MM/YY", matching the SQL query's format. */
function currentMonthStr(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const year = String(now.getFullYear() % 100).padStart(2, "0")
  return `${month}/${year}`
}

/** Converts "MM/YY" to a single sortable integer: year * 12 + month. */
function monthKey(dt: string): number {
  const [monthStr, yearStr] = dt.split("/")
  return Number(yearStr) * 12 + Number(monthStr)
}

/** Converts a monthKey back to "MM/YY", zero-padded. */
function keyToMonthStr(key: number): string {
  const year = Math.floor(key / 12)
  const month = key % 12 === 0 ? 12 : key % 12
  const adjustedYear = key % 12 === 0 ? year - 1 : year
  return `${String(month).padStart(2, "0")}/${String(adjustedYear).padStart(2, "0")}`
}
