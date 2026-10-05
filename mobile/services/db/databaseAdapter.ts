import { RequestFn } from "@/hooks/useApi"
import { NewPendingSync } from "./sqlite/pendingSync/insertPendingSync"
import type {
  Activity,
  Bag,
  Classification,
  Fell,
  FellClassification,
  PendingSync,
} from "./sqlite/schema"
import type {
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

export interface DatabaseAdapter {
  // Updating database
  insertFells(fells: Fell[] | Fell): Promise<void>
  removeFells(ids: number[] | number): Promise<void>
  insertClassifications(
    classifications: Classification[] | Classification,
  ): Promise<void>
  removeClassifications(classificationIds: number[] | number): Promise<void>
  insertFellClassifications(
    fellClassifications: FellClassification[] | FellClassification,
  ): Promise<void>
  removeFellClassifications(
    fellClassifications: FellClassification[] | FellClassification,
  ): Promise<void>
  insertActivities(activities: Activity[] | Activity): Promise<void>
  removeActivities(activityIds: number[] | number): Promise<void>
  insertBags(bags: Bag[] | Bag): Promise<void>
  removeBags(bagIds: number[] | number): Promise<void>

  // Queries
  getMaxMinBagDate(): Promise<IGetMaxMinBagDate>

  // Bag Visuals
  getBagCount(): Promise<IGetBagCount>
  getBagHeightBoxPlot(): Promise<IGetBagHeightBoxPlot>
  getBagsInDateOrder(): Promise<IGetBagsInDateOrder[]>
  getBagsByCountry(): Promise<IGetCountryBag[]>

  // Activity Visuals
  getSportCounts(): Promise<IGetSportCount[]>
  getActivityDistanceInDateOrder(
    sport: string,
  ): Promise<IGetActivityDistanceInDateOrder[]>

  // Map
  getBagLocationsByClassification(
    classificationId: number,
  ): Promise<IGetFellLocations[]>
  getAllClassifications(): Promise<Classification[]>

  // Pending Sync
  insertPendingSync(
    pendingSync: NewPendingSync[] | NewPendingSync,
  ): Promise<void>
  removePendingSyncByIds(ids: number[]): Promise<void>
  selectPendingSync(): Promise<PendingSync[]>

  // Fell & Activity Info
  getFellInfo(fellId: number): Promise<IGetFellInfo | undefined>
  getActivityInfo(activityId: number): Promise<IGetActivityInfo | undefined>
  removeBag(bagId: number, request: RequestFn): Promise<void>
}
