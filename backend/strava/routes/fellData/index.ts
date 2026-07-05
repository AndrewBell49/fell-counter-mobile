import { Request, Response } from "express"
import {
  getAllInactiveUserFells,
  getAllActiveUserFells,
} from "../../../db/operations/fells/selectFell"
import { getIntParam, getNullOrDateParam } from "../params"
import { ROW_RETURN_LIMIT } from "../../../lib/constants"

export async function getFellData(req: Request, res: Response) {
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

  const fells = await getAllActiveUserFells(
    res.locals.user.id,
    page,
    lastUpdated,
    currentDate,
  )

  const removedFells = await getAllInactiveUserFells(
    res.locals.user.id,
    page,
    lastUpdated,
    currentDate,
  )

  return res.json({
    items: fells,
    removed_items: removedFells,
    finished:
      fells.length < ROW_RETURN_LIMIT && removedFells.length < ROW_RETURN_LIMIT,
    nextUpdate: currentDate,
  })
}
