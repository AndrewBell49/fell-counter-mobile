import { Router } from "express"
import { getAuthUrl, getCallback } from "./handlers"

const router = Router()

router.get("/url", getAuthUrl)
router.get("/callback", getCallback)

export default router
