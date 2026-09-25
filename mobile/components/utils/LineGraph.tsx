import { COLOURS } from "@/constants/colours"
import { useState } from "react"
import { View } from "react-native"
import { LineChart } from "react-native-chart-kit/v2"
import { Loading } from "./Loading"
import { Visual } from "./Visual"

interface LineGraphProps {
  title: string
  data: { xData: string; yData: number }[] | null
  yLabel: string
  formatYLabel?: ((value: number) => string) | undefined
}

export function LineGraph({
  title,
  data,
  yLabel,
  formatYLabel,
}: LineGraphProps) {
  const [chartWidth, setChartWidth] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    undefined,
  )

  if (!data) {
    return (
      <Visual title={title}>
        <Loading />
      </Visual>
    )
  }

  return (
    <Visual title={title}>
      <View onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
        <LineChart
          data={data}
          xKey={"xData"}
          series={[{ yKey: "yData", label: yLabel }]}
          width={chartWidth}
          height={280}
          scrollable
          visiblePoints={10}
          initialIndex='end'
          showHorizontalGridLines
          showVerticalGridLines
          area={false}
          dots={{ radius: 3 }}
          formatYLabel={formatYLabel}
          selectedIndex={selectedIndex}
          activeDot={{ radius: 4 }}
          interaction={{
            mode: "tap",
            selectionPersistence: "persist",
            onSelect: (event) => {
              setSelectedIndex(event.index)
            },
          }}
          tooltip
          theme={{
            background: COLOURS.card,
            text: COLOURS.text,
            series: [COLOURS.graph],
          }}
        />
      </View>
    </Visual>
  )
}
