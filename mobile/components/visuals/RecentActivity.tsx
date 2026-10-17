import { COLOURS } from "@/constants/colours"
import { useDatabase } from "@/hooks/useDatabase"
import { IActivityListItem } from "@/services/db/types"
import { useEffect, useState } from "react"
import { ActivityCard } from "../activityTab/ActivityCard"
import { Loading } from "../utils/Loading"
import { Visual } from "../utils/Visual"

export function RecentActivity() {
  const title = "Most recent fell"
  const database = useDatabase()
  const [recentActivity, setRecentActivity] =
    useState<IActivityListItem | null>(null)

  useEffect(() => {
    if (!database) return

    database.getRecentActivity().then((activity) => {
      setRecentActivity(activity)
    })
  }, [database])

  if (!recentActivity) {
    return (
      <Visual title={title}>
        <Loading />
      </Visual>
    )
  }

  return (
    <Visual title={title}>
      <ActivityCard
        item={recentActivity}
        backgroundColour={COLOURS.cardSecondary}
      />
    </Visual>
  )
}
