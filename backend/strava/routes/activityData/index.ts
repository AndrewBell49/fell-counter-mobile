import { Request, Response } from "express"
import {
  getAllActiveActivities,
  getAllInactiveActivities,
} from "../../../db/operations/activities/selectActivity"
import { getIntParam, getNullOrDateParam } from "../params"
import { ROW_RETURN_LIMIT } from "../../../lib/constants"

export async function getActivityData(req: Request, res: Response) {
  const page = getIntParam(req, res, "page")
  if (page === null) return

  const date = getNullOrDateParam(req, res, "lastUpdated")
  if (date === null && req.query.lastUpdated) return

  const endDate = new Date()

  const activities = await getAllActiveActivities(
    res.locals.user.id,
    page,
    date ?? new Date(0),
    endDate,
  )

  const removedActivities = await getAllInactiveActivities(
    res.locals.user.id,
    page,
    date ?? new Date(0),
    endDate,
  )

  return res.json({
    items: activities,
    removed_items: removedActivities,
    finished:
      activities.length < ROW_RETURN_LIMIT &&
      removedActivities.length < ROW_RETURN_LIMIT,
    nextUpdate: endDate,
  })
}
