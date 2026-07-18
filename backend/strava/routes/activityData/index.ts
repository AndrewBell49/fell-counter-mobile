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

  const activities = (
    await getAllActiveActivities(
      res.locals.user.id,
      page,
      lastUpdated,
      currentDate,
    )
  ).map((activity) => {
    return { ...activity, start_date: activity.start_date.getTime() }
  })

  const removedActivities = (
    await getAllInactiveActivities(
      res.locals.user.id,
      page,
      lastUpdated,
      currentDate,
    )
  ).map((activity) => {
    return { ...activity, start_date: activity.start_date.getTime() }
  })

  return res.json({
    items: activities,
    removed_items: removedActivities,
    finished:
      activities.length < ROW_RETURN_LIMIT &&
      removedActivities.length < ROW_RETURN_LIMIT,
    nextUpdate: currentDate,
  })
}
