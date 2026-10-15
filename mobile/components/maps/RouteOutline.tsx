import { COLOURS } from "@/constants/colours"
import polyline from "@mapbox/polyline"
import React, { useMemo } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Svg, { Path } from "react-native-svg"

export interface Coordinate {
  latitude: number
  longitude: number
}

interface RouteOutlineProps {
  summaryPolyline?: string | null
  routeCoords?: Coordinate[]
  height?: number
  aspectRatio?: number
  strokeColor?: string
  strokeWidth?: number
  padding?: number
  style?: StyleProp<ViewStyle>
}

export const RouteOutline = ({
  summaryPolyline,
  routeCoords: inputCoords,
  height,
  aspectRatio = 16 / 9,
  strokeColor = COLOURS.pop,
  strokeWidth = 3,
  padding = 8,
  style,
}: RouteOutlineProps) => {
  // 1. Resolve coordinates from polyline string or prop input
  const coordinates = useMemo(() => {
    if (inputCoords && inputCoords.length > 0) return inputCoords

    if (summaryPolyline && typeof summaryPolyline === "string") {
      return polyline.decode(summaryPolyline).map(([latitude, longitude]) => ({
        latitude,
        longitude,
      }))
    }

    return []
  }, [summaryPolyline, inputCoords])

  // 2. Convert GPS coordinates to a normalized SVG Path
  const svgPathData = useMemo(() => {
    if (coordinates.length === 0) return ""

    let minLat = coordinates[0].latitude
    let maxLat = coordinates[0].latitude
    let minLng = coordinates[0].longitude
    let maxLng = coordinates[0].longitude

    coordinates.forEach(({ latitude, longitude }) => {
      if (latitude < minLat) minLat = latitude
      if (latitude > maxLat) maxLat = latitude
      if (longitude < minLng) minLng = longitude
      if (longitude > maxLng) maxLng = longitude
    })

    const latSpan = maxLat - minLat || 0.00001
    const lngSpan = maxLng - minLng || 0.00001

    const viewBoxSize = 100
    const drawSize = viewBoxSize - padding * 2

    // Maintain natural geographic aspect ratio
    const scale = Math.min(drawSize / lngSpan, drawSize / latSpan)

    // Center the route within the viewbox
    const xOffset = padding + (drawSize - lngSpan * scale) / 2
    const yOffset = padding + (drawSize - latSpan * scale) / 2

    return coordinates
      .map((point, index) => {
        const x = xOffset + (point.longitude - minLng) * scale
        // Invert Y-axis because SVG Y grows downward while GPS latitude grows upward
        const y = yOffset + (maxLat - point.latitude) * scale
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`
      })
      .join(" ")
  }, [coordinates, padding])

  if (!svgPathData) return null

  return (
    <View
      style={[styles.container, height ? { height } : { aspectRatio }, style]}
      pointerEvents='none'>
      <Svg viewBox='0 0 100 100' style={styles.svg}>
        <Path
          d={svgPathData}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  svg: {
    width: "100%",
    height: "100%",
  },
})
