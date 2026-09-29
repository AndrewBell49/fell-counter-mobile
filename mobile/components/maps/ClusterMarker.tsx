import { COLOURS } from "@/constants/colours"
import React, { useEffect, useRef } from "react"
import { Animated, StyleSheet, View } from "react-native"
import Svg, { Circle } from "react-native-svg"
import { Text } from "../utils/Text"

function getProgressColor(ratio: number, lightness = 42): string {
  const safeRatio = Math.max(0, Math.min(1, ratio))
  const hue = Math.round(safeRatio * 120) // 0° = Red, 60° = Yellow, 120° = Green
  return `hsl(${hue}, 85%, ${lightness}%)`
}

interface ClusterMarkerProps {
  count: number
  baggedCount: number
  size: number
}

export const ClusterMarker = React.memo(
  ({ count, baggedCount, size }: ClusterMarkerProps) => {
    const scaleAnim = useRef(new Animated.Value(0.4)).current
    const ratio = count > 0 ? baggedCount / count : 0
    const fillColor = getProgressColor(ratio, 42)

    useEffect(() => {
      scaleAnim.setValue(0.4)
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start()
    }, [count, baggedCount, size, scaleAnim])

    const strokeWidth = 4
    const paddingBuffer = 2
    const radius = (size - strokeWidth) / 2 - paddingBuffer
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference * (1 - ratio)
    const fontSize = Math.max(11, Math.round(size * 0.32))

    return (
      <Animated.View
        style={[
          styles.clusterContainer,
          { width: size, height: size, transform: [{ scale: scaleAnim }] },
        ]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={COLOURS.shadow}
            strokeWidth={strokeWidth}
            fill='none'
          />

          {ratio > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={COLOURS.background}
              strokeWidth={strokeWidth}
              fill='none'
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap='butt'
              origin={`${size / 2}, ${size / 2}`}
              rotation='-90'
            />
          )}

          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth / 2 + 0.5}
            fill={fillColor}
          />
        </Svg>

        <View style={styles.clusterTextOverlay}>
          <Text style={[styles.clusterTextMain, { fontSize }]}>{count}</Text>
        </View>
      </Animated.View>
    )
  },
)

const styles = StyleSheet.create({
  clusterContainer: {
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: COLOURS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  clusterTextOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  clusterTextMain: {
    color: COLOURS.background,
    fontWeight: "900",
  },
})
