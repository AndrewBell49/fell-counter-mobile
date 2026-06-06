import { insertActivities } from "@/services/db/activity/insertActivity"
import { removeActivities } from "@/services/db/activity/removeActivity"
import { insertBags } from "@/services/db/bag/insertBag"
import { removeBags } from "@/services/db/bag/removeBag"
import { insertClassifications } from "@/services/db/classification/insertClassification"
import { removeClassifications } from "@/services/db/classification/removeClassification"
import { DB_TYPE } from "@/services/db/constants"
import { insertFellClassifications } from "@/services/db/fellClassification/insertFellClassification"
import { removeFellClassifications } from "@/services/db/fellClassification/removeFellClassification"
import { insertFells } from "@/services/db/fells/insertFell"
import { removeFells } from "@/services/db/fells/removeFell"
import {
  Activity,
  Bag,
  Classification,
  Fell,
  FellClassification,
} from "@/services/db/schema"
import { setupDatabase } from "@/services/db/setup"
import { useEffect, useState } from "react"

export function useDatabase() {
  const [db, setDb] = useState<DB_TYPE>(null)

  useEffect(() => {
    setupDatabase(setDb)
  }, [])

  return {
    db,
    insertFells: (fells: Fell[] | Fell) => insertFells(db, fells),
    removeFells: (fellIds: number[] | number) => removeFells(db, fellIds),
    insertClassifications: (
      classifications: Classification[] | Classification,
    ) => insertClassifications(db, classifications),
    removeClassifications: (classificationIds: number[] | number) =>
      removeClassifications(db, classificationIds),
    insertFellClassifications: (
      fellClassifications: FellClassification[] | FellClassification,
    ) => insertFellClassifications(db, fellClassifications),
    removeFellClassifications: (
      fellClassifications: FellClassification[] | FellClassification,
    ) => removeFellClassifications(db, fellClassifications),
    insertActivities: (activities: Activity[] | Activity) =>
      insertActivities(db, activities),
    removeActivities: (activityIds: number[] | number) =>
      removeActivities(db, activityIds),
    insertBags: (bags: Bag[] | Bag) => insertBags(db, bags),
    removeBags: (bagIds: number[] | number) => removeBags(db, bagIds),
  }
}
