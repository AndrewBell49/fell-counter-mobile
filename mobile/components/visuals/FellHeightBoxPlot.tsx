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

  return (
    <BoxPlot
      data={boxPlotData}
      title={`Bag Heights${getMaxMinText(boxPlotData)}`}
    />
  )
}

function getMaxMinText(boxPlotData: IGetBagHeightBoxPlot | null): string {
  if (!boxPlotData) return ""
  let max = boxPlotData.max
  let min = boxPlotData.min
  if (boxPlotData.outliersMax.length > 0) {
    max = boxPlotData.outliersMax.sort()[0]
  }
  if (boxPlotData.outliersMin.length > 0) {
    min = boxPlotData.outliersMin.sort()[0]
  }
  return ` (range: ${min}m - ${max}m)`
}
