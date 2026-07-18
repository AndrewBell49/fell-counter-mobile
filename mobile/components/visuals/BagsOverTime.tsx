import { useDatabase } from "@/hooks/useDatabase"
import { IGetBagsInDateOrder } from "@/services/db/types"
import { useEffect, useState } from "react"
import { LineGraph } from "../utils/LineGraph"

export function BagsOverTime() {
  const database = useDatabase()
  const [bagGraphData, setBagGraphData] = useState<
    IGetBagsInDateOrder[] | null
  >(null)

  useEffect(() => {
    if (!database) return

    database.getBagsInDateOrder().then((data) => {
      setBagGraphData(data)
    })
  }, [database])

  return (
    <LineGraph
      title='Bags over time'
      data={bagGraphData}
      xKey='month'
      yKey='bags'></LineGraph>
  )
}
