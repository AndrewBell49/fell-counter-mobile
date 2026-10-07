import { DatabaseContext } from "@/context/DatabaseContext"
import {
  Activity,
  Bag,
  Classification,
  Fell,
  FellClassification,
} from "@/services/db/sqlite/schema"
import { getItem, saveItem } from "@/services/storage/storage"
import { SERVER_URL } from "@/services/strava/constants"
import { flushPendingSync } from "@/services/strava/flushPendingSync"
import { getUpdateData } from "@/services/strava/updateData"
import { useCallback, useContext, useState } from "react"
import { Platform } from "react-native"
import { useApi } from "./useApi"

type Status = "idle" | "running" | "completed" | "ready" | "failed"

const POLL_INTERVAL_MS = 3000

export function useUpdateActivities() {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<null | string>(null)
  const [isOffline, setIsOffline] = useState(false)
  const { request } = useApi()
  const { database, isReady } = useContext(DatabaseContext)

  const handleOfflineFallback = useCallback(() => {
    setIsOffline(true)
    setStatus("ready")
  }, [])

  async function pollStatus() {
    try {
      const res = await request<{ status: Status }>({
        url: `${SERVER_URL}/strava/update-activities/status`,
        retries: 1,
      })
      setStatus(res.status)

      if (res.status === "running") {
        setTimeout(pollStatus, POLL_INTERVAL_MS)
      } else if (res.status === "failed") {
        setError("Update failed")
        setStatus("failed")
      }
    } catch {
      handleOfflineFallback()
    }
  }

  const trigger = useCallback(async () => {
    if (status === "running") return
    setStatus("running")
    setError(null)
    setIsOffline(false)

    // 1. Flush pending offline sync items first
    if (database) {
      try {
        const syncStatus = await flushPendingSync(database, request)
        if (syncStatus === "RETRY") {
          // Server offline / network error — stop here and continue offline
          handleOfflineFallback()
          return
        }
      } catch (err) {
        handleOfflineFallback()
        return
      }
    }

    // 2. Server is online and pending items are synced — proceed with activity update
    try {
      await request({
        url: `${SERVER_URL}/strava/update-activities`,
        options: { method: "POST" },
        allowedCodes: [409],
      })

      pollStatus()
    } catch {
      handleOfflineFallback()
    }
  }, [status, database, request, handleOfflineFallback])

  const updateDatabaseData = useCallback(async () => {
    if (status !== "completed" || !database) return
    setError(null)

    try {
      const lastUpdatedItem = await getItem("lastUpdated")
      const lastUpdated = lastUpdatedItem
        ? new Date(parseInt(lastUpdatedItem))
        : null

      let currentDate: Date
      try {
        const bounds = await request<{ upperBound: number }>({
          url: `${SERVER_URL}/strava/sync-bounds`,
          retries: 1,
        })
        currentDate = new Date(bounds.upperBound)
      } catch {
        handleOfflineFallback()
        return
      }

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
      } catch {
        handleOfflineFallback()
        return
      }

      console.log(fells)

      try {
        await database.applyDelta({
          removedBagIds: bags.removedItems.map((i) => i.id),
          removedFellClassifications: fellClassifications.removedItems,
          removedActivityIds: activities.removedItems.map((i) => i.id),
          removedClassificationIds: classifications.removedItems.map(
            (i) => i.id,
          ),
          removedFellIds: fells.removedItems.map((i) => i.id),
          fells: fells.items,
          classifications: classifications.items,
          activities: activities.items,
          fellClassifications: fellClassifications.items,
          bags: bags.items,
        })
      } catch (err) {
        console.error("SQLite write failed:", err)
        setError("Failed to save local data")
        setStatus("failed")
        return
      }

      await saveItem("lastUpdated", currentDate.getTime().toString())
      setStatus("ready")
    } catch {
      handleOfflineFallback()
    }
  }, [status, database, request, handleOfflineFallback])

  if (Platform.OS === "web") {
    return {
      trigger: () => {},
      updateDatabaseData: () => {},
      status: "ready" as Status,
      error: "",
      isOffline: false,
      isReady: true,
    }
  }

  return { trigger, updateDatabaseData, status, error, isOffline, isReady }
}
