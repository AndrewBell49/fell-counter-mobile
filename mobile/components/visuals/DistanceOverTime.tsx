import { SportContext } from "@/context/SportContext"
import { useDatabase } from "@/hooks/useDatabase"
import { IGetActivityDistanceInDateOrder } from "@/services/db/types"
import { useContext, useEffect, useState } from "react"
import { LineGraph } from "../utils/LineGraph"

export function DistanceOverTime() {
  const database = useDatabase()
  const [distanceGraphData, setDistanceGraphDAta] = useState<
    IGetActivityDistanceInDateOrder[] | null
  >(null)
  const { allSports, selectedSportIdx } = useContext(SportContext)

  useEffect(() => {
    if (!database) return

    database
      .getActivityDistanceInDateOrder(allSports[selectedSportIdx].sport)
      .then((data) => {
        setDistanceGraphDAta(data)
      })
  }, [database, allSports, selectedSportIdx])

  return (
    <LineGraph
      title={`${allSports[selectedSportIdx].sport} distance over time`}
      data={
        distanceGraphData?.map((d) => ({ xData: d.month, yData: d.kms })) ||
        null
      }
      yLabel={"Distance"}
      formatYLabel={(y) => `${Math.round(y)} km`}
    />
  )
}
