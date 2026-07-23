import { COLOURS } from "@/constants/colours"
import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { DonutChart } from "react-native-chart-kit/v2"
import { Loading } from "./Loading"
import { Text } from "./Text"
import { Visual } from "./Visual"

interface PieChartProps {
  title: string
  data: { label: string; count: number }[] | null
  centerLabel: string
  centerLabelSub?: string
  selectedIndex: number | null
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>
}

const ROW_HEIGHT = 25 // approx height of one legend row, adjust to taste
const ITEMS_PER_ROW = 3 // roughly how many legend items fit per row at this width

export function PieChart({
  title,
  centerLabel,
  centerLabelSub,
  data,
  selectedIndex,
  setSelectedIndex,
}: PieChartProps) {
  const [width, setWidth] = useState(0)

  if (!data) {
    return (
      <Visual title={title}>
        <Loading />
      </Visual>
    )
  }

  const legendRows = Math.ceil((data?.length ?? 0) / ITEMS_PER_ROW)
  const legendReservedHeight = Math.max(60, legendRows * ROW_HEIGHT)

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
            theme={{ background: COLOURS.background }}
            colors={[
              "#2563EB", // blue
              "#DC2626", // red
              "#059669", // green
              "#D97706", // amber
              "#7C3AED", // violet
              "#DB2777", // pink
              "#0891B2", // cyan
              "#65A30D", // lime
              "#EA580C", // orange
            ]}
            centerLabel={({ theme }) => (
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                  }}>
                  {centerLabel}
                </Text>
                {centerLabelSub ? (
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                    }}>
                    {centerLabelSub}
                  </Text>
                ) : (
                  <></>
                )}
              </View>
            )}
            formatPercentage={(percentage) =>
              percentage > 0 && percentage < 0.01
                ? "<1%"
                : `${Math.round(percentage * 100)}%`
            }
            legend={{
              itemGap: 8,
              reservedHeight: legendReservedHeight,
              renderItem: ({ item, theme, index }) => {
                const isSelected = index === selectedIndex
                return (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                    onTouchEnd={() => setSelectedIndex(index)}>
                    <View
                      style={{
                        backgroundColor: item.color,
                        borderRadius: 4,
                        height: 8,
                        width: 8,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: isSelected ? "900" : "500",
                      }}>
                      {item.label} {item.percentageLabel}
                    </Text>
                  </View>
                )
              },
            }}
            selectedIndex={selectedIndex ?? undefined}
            interaction={{
              mode: "tap",
              onSelect: (event) => setSelectedIndex(event.index),
            }}
            sliceSeparator={{ width: 1 }}
            width={width}
            height={width * 1.2}
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
