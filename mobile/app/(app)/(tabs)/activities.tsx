import ActivityPage from "@/components/ActivityPage"
import { Loading } from "@/components/utils/Loading"
import { Visual } from "@/components/utils/Visual"
import { SportProvider } from "@/context/SportContext"
import { useDatabase } from "@/hooks/useDatabase"
import { IGetSportCount } from "@/services/db/types"
import { useEffect, useState } from "react"

export default function ActivitiesScreen() {
  const database = useDatabase()
  const [allSports, setAllSports] = useState<IGetSportCount[] | null>(null)

  useEffect(() => {
    if (!database) return

    database.getSportCounts().then((sportData) => {
      setAllSports(sportData)
    })
  }, [database])

  if (!allSports) {
    return (
      <Visual title='Loading Activities'>
        <Loading />
      </Visual>
    )
  }

  const maxIndex = allSports.reduce(
    (maxIdx, item, idx, arr) => (item.count > arr[maxIdx].count ? idx : maxIdx),
    0,
  )

  return (
    <SportProvider defaultSport={maxIndex} defaultAllSports={allSports}>
      <ActivityPage />
    </SportProvider>
  )
}
