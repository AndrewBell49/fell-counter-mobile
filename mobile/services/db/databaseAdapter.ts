import type {
  Activity,
  Bag,
  Classification,
  Fell,
  FellClassification,
} from "./sqlite/schema"
import type {
  IGetBagCount,
  IGetBagHeightBoxPlot,
  IGetBagsInDateOrder,
  IGetCountryBag,
  IGetFellLocations,
  IGetMaxMinBagDate,
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

  // Visuals
  getBagCount(): Promise<IGetBagCount>
  getBagHeightBoxPlot(): Promise<IGetBagHeightBoxPlot>
  getBagsInDateOrder(): Promise<IGetBagsInDateOrder[]>
  getBagsByCountry(): Promise<IGetCountryBag[]>

  // Map
  getBagLocationsByClassification(
    classificationId: number,
  ): Promise<IGetFellLocations[]>
  getAllClassifications(): Promise<Classification[]>
}
