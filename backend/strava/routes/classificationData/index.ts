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

  let lastUpdated = getNullOrDateParam(req, res, "lastUpdated")
  if (lastUpdated === null && req.query.lastUpdated) return

  const currentDate = getNullOrDateParam(req, res, "currentDate")
  if (currentDate === null)
    return res.status(400).json({ error: "currentDate is required" })

  lastUpdated = lastUpdated ?? new Date(0)
  if (currentDate <= lastUpdated)
    return res
      .status(400)
      .json({ error: "currentDate must be after lastUpdated" })

  const classifications = await getAllActiveClassifications(
    page,
    lastUpdated,
    currentDate,
  )

  const removedClassifications = await getAllInactiveClassifications(
    page,
    lastUpdated,
    currentDate,
  )

  const finished =
    classifications.length < ROW_RETURN_LIMIT &&
    removedClassifications.length < ROW_RETURN_LIMIT

  const nextCursor =
    finished ||
    (classifications.length === 0 && removedClassifications.length === 0)
      ? null
      : Math.max(
          ...classifications.map((c) => c.id),
          ...removedClassifications.map((c) => c.id),
          page ?? 0,
        )

  return res.json({
    items: classifications,
    removed_items: removedClassifications,
    finished,
    nextCursor,
    nextUpdate: currentDate,
  })
}
