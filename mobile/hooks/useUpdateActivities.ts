import { DatabaseContext } from "@/context/DatabaseContext"
import {
  Activity,
  Bag,
  Classification,
  Fell,
  FellClassification,
} from "@/services/db/sqlite/schema"
import { ApiError } from "@/services/errors/apiError"
import { getError } from "@/services/errors/errorMessage"
import { getItem, saveItem } from "@/services/storage/storage"
import { SERVER_URL } from "@/services/strava/constants"
import { getUpdateData } from "@/services/strava/updateData"
import { useContext, useState } from "react"
import { useApi } from "./useApi"

type Status = "idle" | "running" | "completed" | "failed"

const POLL_INTERVAL_MS = 3000

export function useUpdateActivities() {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<null | string>(null)
  const { request } = useApi()
  const { database, isReady } = useContext(DatabaseContext)

  async function pollStatus() {
    try {
      const res = await request<{ status: Status }>(
        `${SERVER_URL}/strava/update-activities/status`,
      )
      setStatus(res.status)

      if (res.status === "running") {
        setTimeout(pollStatus, POLL_INTERVAL_MS) // schedule next check
      } else if (res.status === "failed") {
        setError("Update failed, please try again")
      }
    } catch {
      setStatus("failed")
      setError("Lost connection to server")
    }
  }

  const trigger = async () => {
    if (status == "running") return
    setStatus("running")
    setError(null)

    try {
      await request(
        `${SERVER_URL}/strava/update-activities`,
        {
          method: "POST",
        },
        [409],
      )

      pollStatus()
    } catch (err) {
      setStatus("failed")
      setError(getError(err).message)
    }
  }

  const updateDatabaseData = async () => {
    if (status != "completed" || !database) return
    setError(null)

    try {
      const lastUpdatedItem = await getItem("lastUpdated")
      const lastUpdated = lastUpdatedItem
        ? new Date(parseInt(lastUpdatedItem))
        : null
      const currentDate = new Date()

      let fells, classifications, fellClassifications, activities, bags
      try {
        ;[fells, classifications, fellClassifications, activities, bags] =
          await Promise.all([
            getUpdateData<Fell>("fell", lastUpdated, currentDate, request),
            getUpdateData<Classification>(
              "classification",
              lastUpdated,
              currentDate,
              request,
            ),
            getUpdateData<FellClassification>(
              "fell-classification",
              lastUpdated,
              currentDate,
              request,
            ),
            getUpdateData<Activity>(
              "activity",
              lastUpdated,
              currentDate,
              request,
            ),
            getUpdateData<Bag>("bag", lastUpdated, currentDate, request),
          ])
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to fetch data")
        return // don't write anything if fetching failed
      }

      try {
        // Remove children first
        await database.removeBags(bags.removedItems.map((i) => i.id))
        await database.removeFellClassifications(
          fellClassifications.removedItems,
        )
        await database.removeActivities(
          activities.removedItems.map((i) => i.id),
        )
        await database.removeClassifications(
          classifications.removedItems.map((i) => i.id),
        )
        await database.removeFells(fells.removedItems.map((i) => i.id))

        // Insert parents first
        await database.insertFells(fells.items)
        await database.insertClassifications(classifications.items)
        await database.insertActivities(activities.items)
        await database.insertFellClassifications(fellClassifications.items)
        await database.insertBags(bags.items)
      } catch (err) {
        setError("Failed to save data — please try again")
        return // don't save lastUpdated if writes failed
      }

      await saveItem("lastUpdated", currentDate.getTime().toString())
    } catch (error) {
      setError("Unexpected error — please try again")
    }
  }

  return { trigger, updateDatabaseData, status, error, isReady }
}
