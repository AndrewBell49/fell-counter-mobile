import { SQLiteDatabase } from "expo-sqlite"
import { DatabaseAdapter } from "./databaseAdapter"
import { insertActivities } from "./sqlite/activity/insertActivity"
import { removeActivities } from "./sqlite/activity/removeActivity"
import { insertBags } from "./sqlite/bag/insertBag"
import { removeBags } from "./sqlite/bag/removeBag"
import { insertClassifications } from "./sqlite/classification/insertClassification"
import { removeClassifications } from "./sqlite/classification/removeClassification"
import { insertFellClassifications } from "./sqlite/fellClassification/insertFellClassification"
import { removeFellClassifications } from "./sqlite/fellClassification/removeFellClassification"
import { insertFells } from "./sqlite/fells/insertFell"
import { removeFells } from "./sqlite/fells/removeFell"
import {
  Activity,
  Bag,
  Classification,
  Fell,
  FellClassification,
} from "./sqlite/schema"

export class SQLiteAdapter implements DatabaseAdapter {
  constructor(private db: SQLiteDatabase) {}

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
}
