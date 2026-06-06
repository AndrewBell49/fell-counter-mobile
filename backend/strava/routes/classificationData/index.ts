import { Request, Response } from "express"
import { getIntParam, getNullOrDateParam } from "../params"
import { ROW_RETURN_LIMIT } from "../../../lib/constants"
import {
  getAllActiveClassifications,
  getAllInactiveClassifications,
} from "../../../db/operations/classifications/selectClassification"

export async function getClassificationData(req: Request, res: Response) {
  const page = getIntParam(req, res, "page")
  if (page === null) return

  const date = getNullOrDateParam(req, res, "lastUpdated")
  if (date === null && req.query.lastUpdated) return

  const endDate = new Date()

  const classifications = await getAllActiveClassifications(
    page,
    date ?? new Date(0),
    endDate,
  )

  const removedClassifications = await getAllInactiveClassifications(
    page,
    date ?? new Date(0),
    endDate,
  )

  return res.json({
    items: classifications,
    removed_items: removedClassifications,
    finished:
      classifications.length < ROW_RETURN_LIMIT &&
      removedClassifications.length < ROW_RETURN_LIMIT,
    nextUpdate: endDate,
  })
}
