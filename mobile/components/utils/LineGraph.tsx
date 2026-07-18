import { COLOURS } from "@/constants/colours"
import { useEffect, useRef, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { LineChart } from "react-native-chart-kit"
import { Loading } from "./Loading"
import { Visual } from "./Visual"

interface LineGraphProps<T extends Record<string, unknown>> {
  title: string
  data: T[] | null
  xKey: keyof T
  yKey: keyof T
  colour?: string
}

function hexToRgba(hex: string, opacity: number) {
  const parsed = hex.replace("#", "")
  const r = parseInt(parsed.substring(0, 2), 16)
  const g = parseInt(parsed.substring(2, 4), 16)
  const b = parseInt(parsed.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function LineGraph<T extends Record<string, unknown>>({
  title,
  data,
  xKey,
  yKey,
  colour,
}: LineGraphProps<T>) {
  const [chartWidth, setChartWidth] = useState(0)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (data && data.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: false })
      }, 50)
    }
  }, [data])

  if (!data) {
    return (
      <Visual title={title}>
        <Loading />
      </Visual>
    )
  }

  const labels = data.map((d) => String(d[xKey]))
  const values = data.map((d) => Number(d[yKey]))

  return (
    <Visual title={title}>
      <View onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
        <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator>
          <LineChart
            data={{
              labels,
              datasets: [{ data: values }],
            }}
            width={Math.max(chartWidth, labels.length * 50)}
            height={280}
            fromZero
            withInnerLines
            withOuterLines
            withVerticalLines
            withHorizontalLines
            formatYLabel={(y) => Math.round(Number(y)).toString()}
            chartConfig={{
              backgroundGradientFrom: COLOURS.card,
              backgroundGradientTo: COLOURS.card,
              fillShadowGradientOpacity: 0,
              color: (opacity = 1) =>
                hexToRgba(colour || COLOURS.graph, opacity),
              labelColor: () => COLOURS.text,
              propsForDots: {
                r: "3",
              },
            }}
            style={styles.chart}
          />
        </ScrollView>
      </View>
    </Visual>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  chart: {
    borderRadius: 12,
  },
})
