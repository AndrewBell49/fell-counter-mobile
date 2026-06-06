import { Request, Response } from "express"
import { getIntParam, getNullOrDateParam } from "../params"
import { ROW_RETURN_LIMIT } from "../../../lib/constants"
import {
  getAllActiveFellClassifications,
  getAllInactiveFellClassifications,
} from "../../../db/operations/fellClassifications/selectFellClassification"

export async function getFellClassificationData(req: Request, res: Response) {
  const page = getIntParam(req, res, "page")
  if (page === null) return

  const date = getNullOrDateParam(req, res, "lastUpdated")
  if (date === null && req.query.lastUpdated) return

  const endDate = new Date()

  const fellClassifications = await getAllActiveFellClassifications(
    res.locals.user.id,
    page,
    date ?? new Date(0),
    endDate,
  )

  const removedFellClassifications = await getAllInactiveFellClassifications(
    res.locals.user.id,
    page,
    date ?? new Date(0),
    endDate,
  )

  return res.json({
    items: fellClassifications,
    removed_items: removedFellClassifications,
    finished:
      fellClassifications.length < ROW_RETURN_LIMIT &&
      removedFellClassifications.length < ROW_RETURN_LIMIT,
    nextUpdate: endDate,
  })
}
