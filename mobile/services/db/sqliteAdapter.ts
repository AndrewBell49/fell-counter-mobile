import { SQLiteDatabase } from "expo-sqlite"
import { DatabaseAdapter } from "./databaseAdapter"
import { insertActivities } from "./sqlite/activity/insertActivity"
import { removeActivities } from "./sqlite/activity/removeActivity"
import { insertBags } from "./sqlite/bag/insertBag"
import { removeBags } from "./sqlite/bag/removeBag"
import { getMaxMinBagDate } from "./sqlite/bag/selectBag"
import { insertClassifications } from "./sqlite/classification/insertClassification"
import { removeClassifications } from "./sqlite/classification/removeClassification"
import { insertFellClassifications } from "./sqlite/fellClassification/insertFellClassification"
import { removeFellClassifications } from "./sqlite/fellClassification/removeFellClassification"
import { insertFells } from "./sqlite/fells/insertFell"
import { removeFells } from "./sqlite/fells/removeFell"
import type {
  Activity,
  Bag,
  Classification,
  Fell,
  FellClassification,
} from "./sqlite/schema"
import { getAllClassifications } from "./sqlite/visuals/getAllClassifications"
import { getBagCount } from "./sqlite/visuals/getBagCount"
import { getBagHeightBoxPlot } from "./sqlite/visuals/getBagHeightBoxPlot"
import { getBagLocationsByClassification } from "./sqlite/visuals/getBagLocationsByClassification"
import { getBagsByCountry } from "./sqlite/visuals/getBagsByCountry"
import { getBagsInDateOrder } from "./sqlite/visuals/getBagsInDateOrder"
import type {
  IGetBagCount,
  IGetBagHeightBoxPlot,
  IGetBagsInDateOrder,
  IGetCountryBag,
  IGetFellLocations,
  IGetMaxMinBagDate,
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
  getMaxMinBagDate(): Promise<IGetMaxMinBagDate> {
    return getMaxMinBagDate(this.db)
  }

  // Visuals
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

  // Maps
  getBagLocationsByClassification(
    classificationId: number,
  ): Promise<IGetFellLocations[]> {
    return getBagLocationsByClassification(classificationId, this.db)
  }
  getAllClassifications(): Promise<Classification[]> {
    return getAllClassifications(this.db)
  }
}
