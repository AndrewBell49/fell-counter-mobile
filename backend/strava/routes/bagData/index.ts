import { Request, Response } from "express"
import {
  getAllActiveBags,
  getAllInactiveBags,
} from "../../../db/operations/bags/selectBag"
import { getIntParam, getNullOrDateParam } from "../params"
import { ROW_RETURN_LIMIT } from "../../../lib/constants"

export async function getBagData(req: Request, res: Response) {
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

  const bags = await getAllActiveBags(
    res.locals.user.id,
    page,
    lastUpdated,
    currentDate,
  )

  const removedBags = await getAllInactiveBags(
    res.locals.user.id,
    page,
    lastUpdated,
    currentDate,
  )

  return res.json({
    items: bags,
    removed_items: removedBags,
    finished:
      bags.length < ROW_RETURN_LIMIT && removedBags.length < ROW_RETURN_LIMIT,
  })
}
