import { RequestFn } from "@/hooks/useApi"
import {
  BagUpdateItem,
  sendBagUpdates,
  SyncStatus,
} from "@/services/strava/updateBags"
import { DatabaseAdapter } from "../db/databaseAdapter"

export async function flushPendingSync(
  db: DatabaseAdapter,
  request: RequestFn,
): Promise<SyncStatus> {
  const pendingItems = await db.selectPendingSync()
  console.log(pendingItems)
  if (pendingItems.length === 0) return "SUCCESS"

  const addBags: BagUpdateItem[] = []
  const removeBagIds: number[] = []
  const processedIds: number[] = []

  for (const item of pendingItems) {
    try {
      const payload = JSON.parse(item.payload)

      if (item.action === "ADD_BAG") {
        addBags.push({
          ...payload,
          bag_date: new Date(payload.bag_date),
        })
        processedIds.push(item.id)
      } else if (item.action === "REMOVE_BAG") {
        removeBagIds.push(payload.bagId)
        processedIds.push(item.id)
      }
    } catch (e) {
      // Corrupt payload — mark for deletion so it doesn't block future syncs
      processedIds.push(item.id)
    }
  }

  // If we only had corrupt items, clean them up and return
  if (addBags.length === 0 && removeBagIds.length === 0) {
    await db.removePendingSyncByIds(processedIds)
    return "SUCCESS"
  }

  const syncStatus = await sendBagUpdates(addBags, removeBagIds, request)

  // Tidy up database on SUCCESS or unrecoverable ERROR (e.g. 400/422 invalid payload)
  // On RETRY (offline / 5xx), keep data in the database
  if (syncStatus === "SUCCESS" || syncStatus === "ERROR") {
    await db.removePendingSyncByIds(processedIds)
  }

  return syncStatus
}
