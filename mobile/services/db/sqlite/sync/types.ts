import { Activity, Bag, Classification, Fell, FellClassification } from "../schema"

export interface SyncDelta {
  removedBagIds: number[]
  removedFellClassifications: FellClassification[]
  removedActivityIds: number[]
  removedClassificationIds: number[]
  removedFellIds: number[]
  fells: Fell[]
  classifications: Classification[]
  activities: Activity[]
  fellClassifications: FellClassification[]
  bags: Bag[]
}
