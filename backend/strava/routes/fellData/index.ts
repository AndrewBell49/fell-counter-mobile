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

  const date = getNullOrDateParam(req, res, "lastUpdated")
  if (date === null && req.query.lastUpdated) return

  const endDate = new Date()

  const fells = await getAllActiveUserFells(
    res.locals.user.id,
    page,
    date ?? new Date(0),
    endDate,
  )

  const removedFells = await getAllInactiveUserFells(
    res.locals.user.id,
    page,
    date ?? new Date(0),
    endDate,
  )

  return res.json({
    items: fells,
    removed_items: removedFells,
    finished:
      fells.length < ROW_RETURN_LIMIT && removedFells.length < ROW_RETURN_LIMIT,
    nextUpdate: endDate,
  })
}
