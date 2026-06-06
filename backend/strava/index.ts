import { ErrorRequestHandler, Router } from "express"
import { updateActivities } from "./routes/updateActivities"
import { getUserFromSessionId } from "../db/operations/users/selectUser"
import { User } from "../db/schema/users"
import { getUser } from "./routes/user/index"
import { DrizzleQueryError } from "drizzle-orm"
import { getBagData } from "./routes/bagData"
import { getActivityData } from "./routes/activityData"
import { getFellData } from "./routes/fellData"
import { getFellClassificationData } from "./routes/fellClassificationData"
import { getClassificationData } from "./routes/classificationData"
import { activeJobs } from "../lib/jobs/activeJobs"

const router = Router()

// User selection middleware
router.use(async (req, res, next) => {
  let user: User
  try {
    const sessionId = req.headers["x-session-id"] as string
    user = await getUserFromSessionId(sessionId)
  } catch (err) {
    console.log(err)
    if (err instanceof DrizzleQueryError) {
      return res.status(500).json({ error: "Internal server error" })
    }
    return res.status(401).json({ error: "Unauthorised user" })
  }

  res.locals.user = user
  next()
})

// All routes below
router.post("/update-activities", (req, res) => {
  if (activeJobs.has(res.locals.user.sessionId)) {
    return res
      .status(409)
      .json({ error: "This user is already running an update job" })
  }

  activeJobs.set(res.locals.user.sessionId, { status: "running" })

  res.status(202).json({ message: "Successfully started updating activities" })

  updateActivities(res.locals.user)
})
router.get("/update-activities/status", (req, res) => {
  const job = activeJobs.get(res.locals.user.sessionId)
  res.json({ status: job?.status ?? "idle" })
})
router.get("/user", getUser)
router.get("/bag-data/:page", getBagData)
router.get("/activity-data/:page", getActivityData)
router.get("/fell-data/:page", getFellData)
router.get("/fell_classification-data/:page", getFellClassificationData)
router.get("/classification-data/:page", getClassificationData)

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(
    `Internal server error for: ${req.method} ${req.originalUrl}:`,
    err,
  )
  res.status(500).json({ error: "Internal Server Error" })
}
router.use(errorHandler)

export default router
