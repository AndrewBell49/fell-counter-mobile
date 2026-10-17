import { COLOURS, THEME } from "@/constants/colours"
import polyline from "@mapbox/polyline"
import React, { useMemo, useRef } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import MapView, { Marker } from "react-native-maps"
import { RoutePolyline } from "./RoutePolyline"

export interface PeakCoordinate {
  latitude: number
  longitude: number
  id?: string | number
}

interface MiniRouteMapProps {
  activityId: number
  summaryPolyline?: string | null
  peaks?: PeakCoordinate[] // Array of peak locations
  height?: number
  aspectRatio?: number
  style?: StyleProp<ViewStyle>
}

export const MiniRouteMap = ({
  activityId,
  summaryPolyline,
  peaks = [],
  height,
  aspectRatio = 9 / 16,
  style,
}: MiniRouteMapProps) => {
  const mapRef = useRef<MapView>(null)

  const mapData = useMemo(() => {
    // 1. Decode polyline coordinates if available
    const routeCoords = summaryPolyline
      ? polyline.decode(summaryPolyline).map(([latitude, longitude]) => ({
          latitude,
          longitude,
        }))
      : []

    // Combine route and peak points to calculate overall map bounds
    const allCoords = [...routeCoords, ...peaks]
    if (allCoords.length === 0) return null

    let minLat = allCoords[0].latitude,
      maxLat = allCoords[0].latitude
    let minLng = allCoords[0].longitude,
      maxLng = allCoords[0].longitude

    allCoords.forEach(({ latitude, longitude }) => {
      if (latitude < minLat) minLat = latitude
      if (latitude > maxLat) maxLat = latitude
      if (longitude < minLng) minLng = longitude
      if (longitude > maxLng) maxLng = longitude
    })

    const latitude = (minLat + maxLat) / 2
    const longitude = (minLng + maxLng) / 2

    const latSpan = maxLat - minLat
    const lngSpan = maxLng - minLng

    const currentAspectRatio = height ? 1 : aspectRatio
    const adjustedLatSpan = Math.max(latSpan, lngSpan / currentAspectRatio)
    const adjustedLngSpan = Math.max(lngSpan, latSpan * currentAspectRatio)

    const paddingFactor = 1.3

    return {
      routeCoords,
      allCoords,
      initialRegion: {
        latitude,
        longitude,
        latitudeDelta: Math.max(adjustedLatSpan * paddingFactor, 0.003),
        longitudeDelta: Math.max(adjustedLngSpan * paddingFactor, 0.003),
      },
    }
  }, [summaryPolyline, peaks, height, aspectRatio])

  // Zoom to fit both polyline and peaks once map loads
  const handleMapReady = () => {
    if (mapData?.allCoords && mapRef.current) {
      mapRef.current.fitToCoordinates(mapData.allCoords, {
        edgePadding: { top: 30, right: 30, bottom: 30, left: 30 },
        animated: false,
      })
    }
  }

  if (!mapData) return null

  return (
    <View
      style={[styles.container, height ? { height } : { aspectRatio }, style]}
      pointerEvents='none'>
      <MapView
        ref={mapRef}
        style={styles.map}
        userInterfaceStyle={THEME}
        initialRegion={mapData.initialRegion}
        onMapReady={handleMapReady}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        cacheEnabled={true}>
        <RoutePolyline
          activityId={activityId}
          routeCoords={mapData.routeCoords}
        />

        {/* Peak Markers */}
        {peaks.map((peak, index) => (
          <Marker
            key={peak.id ?? index}
            coordinate={{ latitude: peak.latitude, longitude: peak.longitude }}
            // Anchor {x: 0.5, y: 1.0} places the triangle tip directly on the coordinate
            anchor={{ x: 0.5, y: 1.0 }}
            tracksViewChanges={false} // Performance optimization for static markers
          >
            {/* Custom CSS Triangle Peak View */}
            <View style={styles.peakTriangle} />
          </Marker>
        ))}
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  // CSS Triangle shape
  peakTriangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: COLOURS.graph,
  },
})
