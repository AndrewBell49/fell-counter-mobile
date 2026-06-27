import {
  Activity,
  Bag,
  Classification,
  Fell,
  FellClassification,
} from "./sqlite/schema"

export interface DatabaseAdapter {
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
}
