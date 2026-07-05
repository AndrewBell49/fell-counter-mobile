import { DB_TYPE } from "../constants"
import { FellClassification } from "../schema"
import { requireDb } from "../setup"

export async function removeFellClassifications(
  db: DB_TYPE,
  fellClassifications: FellClassification[] | FellClassification,
) {
  requireDb(db)
  const items = Array.isArray(fellClassifications)
    ? fellClassifications
    : [fellClassifications]
  if (items.length === 0) return

  await db.withTransactionAsync(async () => {
    for (const { fell_id, classification_id } of items) {
      await db.runAsync(
        `DELETE FROM fell_classifications
         WHERE fell_id = ? AND classification_id = ?`,
        [fell_id, classification_id],
      )
    }
  })
}
