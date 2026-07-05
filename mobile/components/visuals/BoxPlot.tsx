import { IGetBagHeightBoxPlot } from "@/services/db/sqlite/visuals/getBagHeightBoxPlot"
import { StyleSheet, Text, View } from "react-native"
import { Candlestick, CartesianChart } from "victory-native"
import { Loading } from "../utils/Loading"

interface BoxPlotProps {
  data: IGetBagHeightBoxPlot | null
}

export function ElevationBoxPlot({ data }: BoxPlotProps) {
  if (!data) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bagged Fell Elevations</Text>
        <Loading />
      </View>
    )
  }

  const chartData = [
    {
      x: 1,
      low: data.min,
      open: data.q1,
      close: data.q3,
      high: data.max,
    },
  ]

  console.log(data)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bagged Fell Elevations</Text>
      <CartesianChart
        data={chartData}
        xKey='x'
        yKeys={["low", "open", "close", "high"]}>
        {({ points, chartBounds }) => (
          <Candlestick
            lowPoints={points.low}
            openPoints={points.open}
            closePoints={points.close}
            highPoints={points.high}
            chartBounds={chartBounds}
            candleColors={{
              positive: "#4f86c6",
              negative: "#4f86c6",
              neutral: "#4f86c6",
            }}
            candleRatio={0.4}
          />
        )}
      </CartesianChart>
      {data.outliersMax.length > 0 && (
        <Text style={styles.outliers}>
          High outliers: {data.outliersMax.join(", ")}m
        </Text>
      )}
      {data.outliersMin.length > 0 && (
        <Text style={styles.outliers}>
          Low outliers: {data.outliersMin.join(", ")}m
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  outliers: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
})
