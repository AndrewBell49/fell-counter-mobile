import { useDatabase } from "@/hooks/useDatabase"
import { IGetBagHeightBoxPlot } from "@/services/db/types"
import React, { useEffect, useState } from "react"
import { BoxPlot } from "../utils/BoxPlot"

export function FellHeightBoxPlot() {
  const database = useDatabase()
  const [boxPlotData, setBoxPlotData] = useState<IGetBagHeightBoxPlot | null>(
    null,
  )
  const [includeOutliers, setIncludeOutliers] = useState(false)

  useEffect(() => {
    if (!database) return

    database.getBagHeightBoxPlot().then((boxPlotData) => {
      setBoxPlotData(boxPlotData)
    })
  }, [database])

  return (
    <BoxPlot
      data={boxPlotData}
      title={`Bag Heights${getMaxMinText(boxPlotData, includeOutliers)}`}
      includeOutliers={includeOutliers}
      onIncludeOutliersChange={setIncludeOutliers}
    />
  )
}

function getMaxMinText(
  boxPlotData: IGetBagHeightBoxPlot | null,
  includeOutliers: boolean,
): string {
  if (!boxPlotData) return ""
  let max = boxPlotData.max
  let min = boxPlotData.min

  if (includeOutliers) {
    if (boxPlotData.outliersMax && boxPlotData.outliersMax.length > 0) {
      max = Math.max(...boxPlotData.outliersMax, boxPlotData.max)
    }
    if (boxPlotData.outliersMin && boxPlotData.outliersMin.length > 0) {
      min = Math.min(...boxPlotData.outliersMin, boxPlotData.min)
    }
  }

  return ` (range: ${min}m - ${max}m)`
}
