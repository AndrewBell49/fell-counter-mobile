import { DB_TYPE } from "../constants"
import { FellClassification } from "../schema"
import { requireDb } from "../setup"

export async function insertFellClassifications(
  db: DB_TYPE,
  fellClassifications: FellClassification[] | FellClassification,
) {
  requireDb(db)
  const items = Array.isArray(fellClassifications)
    ? fellClassifications
    : [fellClassifications]
  if (items.length === 0) return

  const placeholders = items.map(() => `(?, ?)`).join(", ")
  const values = items.flatMap((fc) => [fc.fellId, fc.classificationId])

  await db.runAsync(
    `INSERT OR REPLACE INTO fell_classifications (fell_id, classification_id)
     VALUES ${placeholders}`,
    values,
  )
}
