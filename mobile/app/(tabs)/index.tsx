import { ElevationBoxPlot } from "@/components/visuals/BoxPlot"
import { useDatabase } from "@/hooks/useDatabase"
import { IGetBagHeightBoxPlot } from "@/services/db/sqlite/visuals/getBagHeightBoxPlot"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"

export default function HomePage() {
  const database = useDatabase()
  const [boxPlotData, setBoxPlotData] = useState<IGetBagHeightBoxPlot | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false

    database.getBagHeightBoxPlot().then((data) => {
      if (!cancelled) {
        setBoxPlotData(data)
      }
    })

    return () => {
      cancelled = true
    }
  }, [database])

  return (
    <View>
      <Text>Index screen this screen</Text>
      <ElevationBoxPlot data={boxPlotData}></ElevationBoxPlot>
    </View>
  )
}
