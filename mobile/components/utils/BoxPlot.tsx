import { COLOURS } from "@/constants/colours"
import { IGetBagHeightBoxPlot } from "@/services/db/types"
import React, { useState } from "react"
import { LayoutChangeEvent, StyleSheet, View } from "react-native"
import { Loading } from "./Loading"
import { Text } from "./Text"
import { Visual } from "./Visual"

interface Props {
  data: IGetBagHeightBoxPlot | null
  title: string
}

const CHART_HEIGHT = 100
const LINE_WIDTH = 3
const LABEL_GAP = 6
const LABEL_ROW_HEIGHT = 20

type LabelKey = "min" | "q1" | "median" | "q3" | "max"

export function BoxPlot({ data, title }: Props) {
  const [width, setWidth] = useState(0)
  const [labelWidths, setLabelWidths] = useState<Record<LabelKey, number>>({
    min: 0,
    q1: 0,
    median: 0,
    q3: 0,
    max: 0,
  })

  if (!data) {
    return (
      <Visual title={title}>
        <Loading />
      </Visual>
    )
  }

  function position(pos: number): number {
    return width * ((pos - data.min) / (data.max - data.min))
  }

  const xMin = position(data.min)
  const xQ1 = position(data.q1)
  const xMedian = position(data.median)
  const xQ3 = position(data.q3)
  const xMax = position(data.max)

  const labels: { key: LabelKey; value: number; anchor: number }[] = [
    { key: "min", value: data.min, anchor: xMin },
    { key: "q1", value: data.q1, anchor: xQ1 },
    { key: "median", value: data.median, anchor: xMedian },
    { key: "q3", value: data.q3, anchor: xQ3 },
    { key: "max", value: data.max, anchor: xMax },
  ]

  const labelLefts = resolveLabelPositions(
    labels.map((l) => l.anchor),
    labels.map((l) => labelWidths[l.key]),
    LABEL_GAP,
    width,
  )

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
          <View style={[{ left: xMin, width: xQ1 - xMin }, styles.line]} />

          {/* Box to right whisker */}
          <View style={[{ left: xQ3, width: xMax - xQ3 }, styles.line]} />

          {/* Left whisker */}
          <View style={[{ left: xMin - LINE_WIDTH / 2 }, styles.whisker]} />

          {/* Q1 - median */}
          <View
            style={[
              {
                left: xQ1,
                width: xMedian - xQ1,
                borderTopLeftRadius: 10,
                borderBottomLeftRadius: 10,
              },
              styles.box,
            ]}
          />

          {/* Median - Q3 */}
          <View
            style={[
              {
                left: xMedian,
                width: xQ3 - xMedian,
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
          {labels.map((label, i) => {
            const measured = labelWidths[label.key]
            return (
              <Text
                key={label.key}
                onLayout={(e) => handleLabelLayout(label.key, e)}
                style={[
                  styles.text,
                  {
                    left: measured ? labelLefts[i] : label.anchor,
                    opacity: measured ? 1 : 0,
                  },
                ]}>
                {Math.round(label.value)}m
              </Text>
            )
          })}
        </View>
      </View>
    </Visual>
  )
}

/**
 * Centers each label on its anchor point, then resolves overlaps by:
 * 1. Pushing labels right (in order) so each stays at least `gap` from the previous one.
 * 2. Pulling back from the right edge (in reverse) so nothing overflows the container.
 * Assumes anchors are already in ascending order (min <= q1 <= median <= q3 <= max).
 */
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
