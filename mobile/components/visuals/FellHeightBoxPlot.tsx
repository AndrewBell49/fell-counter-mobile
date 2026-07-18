import { useDatabase } from "@/hooks/useDatabase"
import { IGetBagHeightBoxPlot } from "@/services/db/types"
import { useEffect, useState } from "react"
import { BoxPlot } from "../utils/BoxPlot"

export function FellHeightBoxPlot() {
  const database = useDatabase()
  const [boxPlotData, setBoxPlotData] = useState<IGetBagHeightBoxPlot | null>(
    null,
  )

  useEffect(() => {
    if (!database) return

    database.getBagHeightBoxPlot().then((boxPlotData) => {
      setBoxPlotData(boxPlotData)
    })
  }, [database])

  return <BoxPlot data={boxPlotData} title='Bag Heights'></BoxPlot>
}
