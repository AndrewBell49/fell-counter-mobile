import { RequestFn } from "@/hooks/useApi"
import { SQLiteDatabase } from "expo-sqlite"
import { sendBagUpdates } from "../strava/updateBags"
import { DatabaseAdapter } from "./databaseAdapter"
import { insertActivities } from "./sqlite/activity/insertActivity"
import { removeActivities } from "./sqlite/activity/removeActivity"
import { insertBags } from "./sqlite/bag/insertBag"
import { removeBags } from "./sqlite/bag/removeBag"
import { selectBagById } from "./sqlite/bag/selectBagById"
import { getMaxMinBagDate } from "./sqlite/bag/selectBag"
import { insertClassifications } from "./sqlite/classification/insertClassification"
import { removeClassifications } from "./sqlite/classification/removeClassification"
import { insertFellClassifications } from "./sqlite/fellClassification/insertFellClassification"
import { removeFellClassifications } from "./sqlite/fellClassification/removeFellClassification"
import { insertFells } from "./sqlite/fells/insertFell"
import { removeFells } from "./sqlite/fells/removeFell"
import { removeOrphanedFells } from "./sqlite/fells/removeOrphanedFells"
import { applyDelta } from "./sqlite/sync/syncDelta"
import type { SyncDelta } from "./sqlite/sync/types"
import {
  insertPendingSync,
  type NewPendingSync,
} from "./sqlite/pendingSync/insertPendingSync"
import { removePendingSyncByIds } from "./sqlite/pendingSync/removePendingSync"
import { removePendingSyncByActionAndBagId } from "./sqlite/pendingSync/removePendingSyncByActionAndBagId"
import { selectPendingSync } from "./sqlite/pendingSync/selectPendingSync"
import type {
  Activity,
  Bag,
  Classification,
  Fell,
  FellClassification,
  PendingSync,
} from "./sqlite/schema"
import { getActivities } from "./sqlite/visuals/getActivities"
import { getSportCounts } from "./sqlite/visuals/getActivityCounts"
import { getActivityDistanceInDateOrder } from "./sqlite/visuals/getActivityDistanceInDateOrder"
import { getActivityInfo } from "./sqlite/visuals/getActivityInfo"
import { getAllClassifications } from "./sqlite/visuals/getAllClassifications"
import { getBagCount } from "./sqlite/visuals/getBagCount"
import { getBagHeightBoxPlot } from "./sqlite/visuals/getBagHeightBoxPlot"
import { getBagLocationsByClassification } from "./sqlite/visuals/getBagLocationsByClassification"
import { getBagsByCountry } from "./sqlite/visuals/getBagsByCountry"
import { getBagsInDateOrder } from "./sqlite/visuals/getBagsInDateOrder"
import { getFellInfo } from "./sqlite/visuals/getFellInfo"
import type {
  IActivityListItem,
  IGetActivitiesParams,
  IGetActivityDistanceInDateOrder,
  IGetActivityInfo,
  IGetBagCount,
  IGetBagHeightBoxPlot,
  IGetBagsInDateOrder,
  IGetCountryBag,
  IGetFellInfo,
  IGetFellLocations,
  IGetMaxMinBagDate,
  IGetSportCount,
} from "./types"

export class SQLiteAdapter implements DatabaseAdapter {
  constructor(private db: SQLiteDatabase) {}

  // Updating database
  insertFells(fells: Fell[] | Fell): Promise<void> {
    return insertFells(this.db, fells)
  }
  removeFells(ids: number[] | number): Promise<void> {
    return removeFells(this.db, ids)
  }
  insertClassifications(
    classifications: Classification[] | Classification,
  ): Promise<void> {
    return insertClassifications(this.db, classifications)
  }
  removeClassifications(classificationIds: number[] | number): Promise<void> {
    return removeClassifications(this.db, classificationIds)
  }
  insertFellClassifications(
    fellClassifications: FellClassification[] | FellClassification,
  ): Promise<void> {
    return insertFellClassifications(this.db, fellClassifications)
  }
  removeFellClassifications(
    fellClassifications: FellClassification[] | FellClassification,
  ): Promise<void> {
    return removeFellClassifications(this.db, fellClassifications)
  }
  insertActivities(activities: Activity[] | Activity): Promise<void> {
    return insertActivities(this.db, activities)
  }
  removeActivities(activityIds: number[] | number): Promise<void> {
    return removeActivities(this.db, activityIds)
  }
  insertBags(bags: Bag[] | Bag): Promise<void> {
    return insertBags(this.db, bags)
  }
  removeBags(bagIds: number[] | number): Promise<void> {
    return removeBags(this.db, bagIds)
  }
  removeOrphanedFells(): Promise<void> {
    return removeOrphanedFells(this.db)
  }
  applyDelta(delta: SyncDelta): Promise<void> {
    return applyDelta(this.db, delta)
  }
  getMaxMinBagDate(): Promise<IGetMaxMinBagDate> {
    return getMaxMinBagDate(this.db)
  }

  // Bag Visuals
  getBagCount(): Promise<IGetBagCount> {
    return getBagCount(this.db)
  }
  getBagHeightBoxPlot(): Promise<IGetBagHeightBoxPlot> {
    return getBagHeightBoxPlot(this.db)
  }
  getBagsInDateOrder(): Promise<IGetBagsInDateOrder[]> {
    return getBagsInDateOrder(this.db)
  }
  getBagsByCountry(): Promise<IGetCountryBag[]> {
    return getBagsByCountry(this.db)
  }

  // Sport Visuals
  getSportCounts(): Promise<IGetSportCount[]> {
    return getSportCounts(this.db)
  }
  getActivityDistanceInDateOrder(
    sport: string,
  ): Promise<IGetActivityDistanceInDateOrder[]> {
    return getActivityDistanceInDateOrder(sport, this.db)
  }

  // Maps
  getBagLocationsByClassification(
    classificationId: number,
  ): Promise<IGetFellLocations[]> {
    return getBagLocationsByClassification(classificationId, this.db)
  }
  getAllClassifications(): Promise<Classification[]> {
    return getAllClassifications(this.db)
  }

  // Pending Sync
  insertPendingSync(
    pendingSync: NewPendingSync[] | NewPendingSync,
  ): Promise<void> {
    return insertPendingSync(this.db, pendingSync)
  }
  removePendingSyncByIds(ids: number[]): Promise<void> {
    return removePendingSyncByIds(this.db, ids)
  }
  selectPendingSync(): Promise<PendingSync[]> {
    return selectPendingSync(this.db)
  }
  removePendingSyncByActionAndBagId(
    action: "ADD_BAG" | "REMOVE_BAG",
    bagId: number,
  ): Promise<void> {
    return removePendingSyncByActionAndBagId(this.db, action, bagId)
  }
  selectBagById(bagId: number): Promise<Bag | null> {
    return selectBagById(this.db, bagId)
  }

  // Fell & Activity Info
  getActivities(params?: IGetActivitiesParams): Promise<IActivityListItem[]> {
    return getActivities(this.db, params)
  }
  getFellInfo(fellId: number): Promise<IGetFellInfo | undefined> {
    return getFellInfo(fellId, this.db)
  }
  getActivityInfo(activityId: number): Promise<IGetActivityInfo | undefined> {
    return getActivityInfo(activityId, this.db)
  }

  async removeBag(bagId: number, request: RequestFn): Promise<void> {
    const bag = await selectBagById(this.db, bagId)
    if (!bag) return

    await removeBags(this.db, [bagId])

    const status = await sendBagUpdates([], [bagId], request)

    if (status === "RETRY") {
      await this.insertPendingSync({
        action: "REMOVE_BAG",
        payload: JSON.stringify({
          bagId,
          fell_id: bag.fell_id,
          activity_id: bag.activity_id,
          bag_date: bag.bag_date,
        }),
        created_at: Date.now(),
      })
    } else if (status === "ERROR") {
      await this.removePendingSyncByActionAndBagId("REMOVE_BAG", bagId)
    }
  }
}
