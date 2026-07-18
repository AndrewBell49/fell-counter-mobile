import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { DonutChart } from "react-native-chart-kit/v2"
import { Loading } from "./Loading"
import { Text } from "./Text"
import { Visual } from "./Visual"

interface PieChartProps {
  title: string
  centerLabel: string
  centerLabelSub: string
  data: { label: string; count: number }[] | null
}

export function PieChart({
  title,
  centerLabel,
  centerLabelSub,
  data,
}: PieChartProps) {
  const [width, setWidth] = useState(0)

  if (!data) {
    return (
      <Visual title={title}>
        <Loading />
      </Visual>
    )
  }

  return (
    <Visual title={title}>
      <View
        style={styles.chartWrap}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <DonutChart
            data={data}
            valueKey='count'
            labelKey='label'
            centerLabel={({ theme }) => (
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 20,
                    fontWeight: "800",
                  }}>
                  {centerLabel}
                </Text>
                <Text
                  style={{
                    color: theme.mutedText,
                    fontSize: 14,
                    fontWeight: "700",
                  }}>
                  {centerLabelSub}
                </Text>
              </View>
            )}
            interaction={{
              mode: "tap",
            }}
            sliceSeparator={{ width: 2 }}
            width={width}
            height={width}
          />
        )}
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
  chartWrap: {
    width: "100%",
  },
})
