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

  const fellClassifications = await getAllActiveFellClassifications(
    page,
    lastUpdated,
    currentDate,
  )

  const removedFellClassifications =
    await getAllInactiveFellClassifications(
      page,
      lastUpdated,
      currentDate,
    )

  const finished =
    fellClassifications.length < ROW_RETURN_LIMIT &&
    removedFellClassifications.length < ROW_RETURN_LIMIT

  const nextCursor =
    finished ||
    (fellClassifications.length === 0 &&
      removedFellClassifications.length === 0)
      ? null
      : Math.max(
          ...fellClassifications.map((fc) => fc.fell_id),
          ...removedFellClassifications.map((fc) => fc.fell_id),
          page ?? 0,
        )

  return res.json({
    items: fellClassifications,
    removed_items: removedFellClassifications,
    finished,
    nextCursor,
    nextUpdate: currentDate,
  })
}
