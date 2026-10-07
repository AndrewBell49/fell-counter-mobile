import { DB_TYPE } from "../constants"
import { requireDb } from "../setup"
import { insertActivities } from "../activity/insertActivity"
import { removeActivities } from "../activity/removeActivity"
import { removeBags } from "../bag/removeBag"
import { insertBags } from "../bag/insertBag"
import { insertClassifications } from "../classification/insertClassification"
import { removeClassifications } from "../classification/removeClassification"
import { insertFellClassifications } from "../fellClassification/insertFellClassification"
import { removeFellClassifications } from "../fellClassification/removeFellClassification"
import { insertFells } from "../fells/insertFell"
import { removeFells } from "../fells/removeFell"
import { removeOrphanedFells } from "../fells/removeOrphanedFells"
import { SyncDelta } from "./types"

export async function applyDelta(db: DB_TYPE, delta: SyncDelta): Promise<void> {
  requireDb(db)

  await db.withTransactionAsync(async () => {
    await removeBags(db, delta.removedBagIds)
    await removeFellClassifications(db, delta.removedFellClassifications)
    await removeActivities(db, delta.removedActivityIds)
    await removeClassifications(db, delta.removedClassificationIds)
    await removeFells(db, delta.removedFellIds)

    await insertFells(db, delta.fells)
    await insertClassifications(db, delta.classifications)
    await insertActivities(db, delta.activities)
    await insertFellClassifications(db, delta.fellClassifications)
    await insertBags(db, delta.bags)

    await removeOrphanedFells(db)
  })
}
