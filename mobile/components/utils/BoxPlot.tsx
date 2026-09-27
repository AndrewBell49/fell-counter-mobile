import { COLOURS } from "@/constants/colours"
import { IGetBagHeightBoxPlot } from "@/services/db/types"
import React, { useEffect, useRef, useState } from "react"
import { Animated, LayoutChangeEvent, StyleSheet, View } from "react-native"
import { Loading } from "./Loading"
import { Slider } from "./Slider"
import { Text } from "./Text"
import { Visual } from "./Visual"

const AnimatedText = Animated.createAnimatedComponent(Text)

interface Props {
  data: IGetBagHeightBoxPlot | null
  title: string
  includeOutliers?: boolean
  onIncludeOutliersChange?: (value: boolean) => void
}

const CHART_HEIGHT = 100
const LINE_WIDTH = 3
const LABEL_GAP = 6
const LABEL_ROW_HEIGHT = 20

type LabelKey = "min" | "q1" | "median" | "q3" | "max"

export function BoxPlot({
  data,
  title,
  includeOutliers = false,
  onIncludeOutliersChange,
}: Props) {
  const [width, setWidth] = useState(0)
  const [labelWidths, setLabelWidths] = useState<Record<LabelKey, number>>({
    min: 0,
    q1: 0,
    median: 0,
    q3: 0,
    max: 0,
  })

  // 0 = excluded, 1 = included
  const anim = useRef(new Animated.Value(includeOutliers ? 1 : 0)).current

  useEffect(() => {
    Animated.spring(anim, {
      toValue: includeOutliers ? 1 : 0,
      bounciness: 6,
      speed: 12,
      useNativeDriver: false,
    }).start()
  }, [includeOutliers, anim])

  if (!data) {
    return (
      <Visual title={title}>
        <Loading />
      </Visual>
    )
  }

  // Range 0: Exclude outliers
  const min0 = data.min
  const max0 = data.max
  const range0 = max0 - min0 || 1

  // Range 1: Include outliers
  const min1 =
    data.outliersMin && data.outliersMin.length > 0
      ? Math.min(...data.outliersMin, data.min)
      : data.min
  const max1 =
    data.outliersMax && data.outliersMax.length > 0
      ? Math.max(...data.outliersMax, data.max)
      : data.max
  const range1 = max1 - min1 || 1

  // Positions for Mode 0 (Exclude)
  const xQ1_0 = width * ((data.q1 - min0) / range0)
  const xMedian_0 = width * ((data.median - min0) / range0)
  const xQ3_0 = width * ((data.q3 - min0) / range0)

  // Positions for Mode 1 (Include)
  const xQ1_1 = width * ((data.q1 - min1) / range1)
  const xMedian_1 = width * ((data.median - min1) / range1)
  const xQ3_1 = width * ((data.q3 - min1) / range1)

  // Animated positions
  const xMin = 0
  const xQ1 = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [xQ1_0, xQ1_1],
  })
  const xMedian = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [xMedian_0, xMedian_1],
  })
  const xQ3 = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [xQ3_0, xQ3_1],
  })
  const xMax = width

  // Width calculations using Animated.subtract
  const leftLineWidth = xQ1
  const rightLineWidth = Animated.subtract(xMax, xQ3)
  const boxLeftWidth = Animated.subtract(xMedian, xQ1)
  const boxRightWidth = Animated.subtract(xQ3, xMedian)

  // Labels positioning
  const currentWidths = [
    labelWidths.min,
    labelWidths.q1,
    labelWidths.median,
    labelWidths.q3,
    labelWidths.max,
  ]

  const labelLefts0 = resolveLabelPositions(
    [0, xQ1_0, xMedian_0, xQ3_0, width],
    currentWidths,
    LABEL_GAP,
    width,
  )

  const labelLefts1 = resolveLabelPositions(
    [0, xQ1_1, xMedian_1, xQ3_1, width],
    currentWidths,
    LABEL_GAP,
    width,
  )

  const labelKeys: LabelKey[] = ["min", "q1", "median", "q3", "max"]
  const labelValues = [
    includeOutliers ? min1 : min0,
    data.q1,
    data.median,
    data.q3,
    includeOutliers ? max1 : max0,
  ]

  function handleLabelLayout(key: LabelKey, e: LayoutChangeEvent) {
    const measuredWidth = e.nativeEvent.layout.width
    setLabelWidths((prev) =>
      prev[key] === measuredWidth ? prev : { ...prev, [key]: measuredWidth },
    )
  }

  return (
    <Visual title={title}>
      <View>
        <View
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          style={{
            width: "100%",
            justifyContent: "center",
            height: CHART_HEIGHT,
          }}>
          {/* Left whisker to box */}
          <Animated.View
            style={[{ left: xMin, width: leftLineWidth }, styles.line]}
          />

          {/* Box to right whisker */}
          <Animated.View
            style={[{ left: xQ3, width: rightLineWidth }, styles.line]}
          />

          {/* Left whisker */}
          <View style={[{ left: xMin - LINE_WIDTH / 2 }, styles.whisker]} />

          {/* Q1 - median */}
          <Animated.View
            style={[
              {
                left: xQ1,
                width: boxLeftWidth,
                borderTopLeftRadius: 10,
                borderBottomLeftRadius: 10,
              },
              styles.box,
            ]}
          />

          {/* Median - Q3 */}
          <Animated.View
            style={[
              {
                left: xMedian,
                width: boxRightWidth,
                borderTopRightRadius: 10,
                borderBottomRightRadius: 10,
                borderLeftWidth: 0,
              },
              styles.box,
            ]}
          />

          {/* Right whisker */}
          <View style={[{ left: xMax - LINE_WIDTH / 2 }, styles.whisker]} />
        </View>

        <View style={{ height: LABEL_ROW_HEIGHT }}>
          {labelKeys.map((key, i) => {
            const measured = labelWidths[key]
            const animatedLeft = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [labelLefts0[i], labelLefts1[i]],
            })

            return (
              <AnimatedText
                key={key}
                onLayout={(e) => handleLabelLayout(key, e)}
                style={[
                  styles.text,
                  {
                    left: animatedLeft,
                    opacity: measured ? 1 : 0,
                  },
                ]}>
                {Math.round(labelValues[i])}m
              </AnimatedText>
            )
          })}
        </View>

        {onIncludeOutliersChange && (
          <Slider<boolean>
            options={[
              { label: "No Outliers", value: false },
              { label: "Outliers", value: true },
            ]}
            value={includeOutliers}
            onChange={onIncludeOutliersChange}
          />
        )}
      </View>
    </Visual>
  )
}

function resolveLabelPositions(
  anchors: number[],
  widths: number[],
  gap: number,
  containerWidth: number,
): number[] {
  const lefts = anchors.map((anchor, i) => anchor - widths[i] / 2)

  for (let i = 1; i < lefts.length; i++) {
    const minLeft = lefts[i - 1] + widths[i - 1] + gap
    if (lefts[i] < minLeft) {
      lefts[i] = minLeft
    }
  }

  const lastIndex = lefts.length - 1
  if (containerWidth > 0) {
    const overflow = lefts[lastIndex] + widths[lastIndex] - containerWidth
    if (overflow > 0) {
      lefts[lastIndex] -= overflow
      for (let i = lastIndex - 1; i >= 0; i--) {
        const maxLeft = lefts[i + 1] - widths[i] - gap
        if (lefts[i] > maxLeft) {
          lefts[i] = maxLeft
        }
      }
    }
  }

  if (lefts[0] < 0) {
    const shift = -lefts[0]
    for (let i = 0; i < lefts.length; i++) {
      lefts[i] += shift
    }
  }

  return lefts
}

const styles = StyleSheet.create({
  whisker: {
    width: LINE_WIDTH,
    height: CHART_HEIGHT * 0.8,
    backgroundColor: COLOURS.graph,
    borderRadius: 7,
    position: "absolute",
  },
  box: {
    height: CHART_HEIGHT,
    backgroundColor: COLOURS.graph,
    borderColor: COLOURS.shadow,
    borderWidth: 2,
    position: "absolute",
  },
  line: {
    top: CHART_HEIGHT * 0.5,
    backgroundColor: COLOURS.graph,
    height: LINE_WIDTH,
    position: "absolute",
  },
  text: {
    color: COLOURS.text,
    fontSize: 12,
    position: "absolute",
  },
})
