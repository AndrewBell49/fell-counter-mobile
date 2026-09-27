import { IGetFellLocations } from "@/services/db/types"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Animated, StyleSheet, View } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps"
import Svg, { Circle } from "react-native-svg"
import Supercluster from "supercluster"
import { Text } from "../utils/Text"

interface FellMapProps {
  data: IGetFellLocations[]
}

type BBox = [number, number, number, number]
type IndividualFellProps = {
  cluster: false
  fellId: string | number
  fell: IGetFellLocations
}
type ClusterAggregatedProps = { baggedCount: number }
type ClusterProps = {
  cluster: true
  point_count: number
  cluster_id: number
  baggedCount: number
}
type MapFeatureProps = IndividualFellProps | ClusterProps

const formatDate = (timestamp: string | number) => {
  const date = new Date(Number(timestamp))
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}/${date.getFullYear()}`
}

const getFellDescription = (fell: IGetFellLocations): string => {
  let desc = `${fell.elevation || 0} m`
  const bagDates = fell.bagDates || []

  if (bagDates.length === 0) {
    desc += " (Not Climbed)"
  } else if (bagDates.length === 1) {
    desc += ` • Bagged once, on ${formatDate(bagDates[0])}`
  } else if (bagDates.length === 2) {
    desc += ` • Bagged twice, on ${formatDate(bagDates[0])} & ${formatDate(bagDates[1])}`
  } else if (bagDates.length >= 3) {
    desc += ` • Bagged ${bagDates.length} times, from ${formatDate(bagDates[0])} to ${formatDate(bagDates[bagDates.length - 1])}`
  }

  return desc
}

function getProgressColor(ratio: number, lightness = 42): string {
  const safeRatio = Math.max(0, Math.min(1, ratio))
  const hue = Math.round(safeRatio * 120) // 0° = Red, 60° = Yellow, 120° = Green
  return `hsl(${hue}, 85%, ${lightness}%)`
}

function getRelativeClusterSize(
  count: number,
  minCount: number,
  maxCount: number,
): number {
  const MIN_SIZE = 38
  const MAX_SIZE = 58

  if (minCount === maxCount) {
    return 44
  }

  const scale = (count - minCount) / (maxCount - minCount)
  return Math.round(MIN_SIZE + scale * (MAX_SIZE - MIN_SIZE))
}

export function FellMap({ data }: FellMapProps) {
  const mapRef = useRef<MapView>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  // Calculate exact bounding center across all fells for initial camera render
  const initialRegion: Region = useMemo(() => {
    if (data && data.length > 0) {
      let minLat = data[0].latitude
      let maxLat = data[0].latitude
      let minLng = data[0].longitude
      let maxLng = data[0].longitude

      data.forEach((f) => {
        if (f.latitude < minLat) minLat = f.latitude
        if (f.latitude > maxLat) maxLat = f.latitude
        if (f.longitude < minLng) minLng = f.longitude
        if (f.longitude > maxLng) maxLng = f.longitude
      })

      const centerLat = (minLat + maxLat) / 2
      const centerLng = (minLng + maxLng) / 2
      const latDelta = Math.max(0.15, (maxLat - minLat) * 1.3)
      const lngDelta = Math.max(0.15, (maxLng - minLng) * 1.3)

      return {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      }
    }
    return {
      latitude: 54.45,
      longitude: -3.1,
      latitudeDelta: 0.35,
      longitudeDelta: 0.35,
    }
  }, [data])

  const [region, setRegion] = useState<Region>(initialRegion)
  const [tracksViewChanges, setTracksViewChanges] = useState(true)
  const trackingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fits camera to exact coordinates once native map layout is fully ready
  const fitMapToBounds = useCallback(() => {
    if (data && data.length > 0 && mapRef.current && isMapReady) {
      mapRef.current.fitToCoordinates(
        data.map((f) => ({ latitude: f.latitude, longitude: f.longitude })),
        {
          edgePadding: { top: 140, right: 50, bottom: 50, left: 50 },
          animated: true,
        },
      )
    }
  }, [data, isMapReady])

  useEffect(() => {
    fitMapToBounds()
  }, [fitMapToBounds])

  useEffect(() => {
    return () => {
      if (trackingTimeout.current) clearTimeout(trackingTimeout.current)
    }
  }, [])

  // 1. GeoJSON point mapping
  const points = useMemo(() => {
    return data.map((fell) => ({
      type: "Feature" as const,
      properties: {
        cluster: false,
        fellId: fell.id,
        fell,
      } as IndividualFellProps,
      geometry: {
        type: "Point" as const,
        coordinates: [fell.longitude, fell.latitude],
      },
    }))
  }, [data])

  // 2. Supercluster instance
  const index = useMemo(() => {
    const sc = new Supercluster<IndividualFellProps, ClusterAggregatedProps>({
      radius: 70,
      maxZoom: 15,
      map: (props) => ({
        baggedCount:
          props.fell?.bagDates && props.fell.bagDates.length > 0 ? 1 : 0,
      }),
      reduce: (accumulated, props) => {
        accumulated.baggedCount += props.baggedCount
      },
    })
    sc.load(points)
    return sc
  }, [points])

  // 3. Viewport BBox & zoom calculation
  const zoom = getZoomLevel(region.longitudeDelta)
  const bbox: BBox = [
    region.longitude - region.longitudeDelta / 2,
    region.latitude - region.latitudeDelta / 2,
    region.longitude + region.longitudeDelta / 2,
    region.latitude + region.latitudeDelta / 2,
  ]

  // 4. Retrieve visible clusters
  const { visibleClusters, minClusterCount, maxClusterCount } = useMemo(() => {
    const clusters = index.getClusters(bbox, zoom)
    let min = Infinity
    let max = -Infinity

    clusters.forEach((item) => {
      if (item.properties.cluster) {
        const count = item.properties.point_count
        if (count < min) min = count
        if (count > max) max = count
      }
    })

    return {
      visibleClusters: clusters,
      minClusterCount: min === Infinity ? 1 : min,
      maxClusterCount: max === -Infinity ? 1 : max,
    }
  }, [index, bbox, zoom])

  const handleRegionChangeComplete = (newRegion: Region) => {
    setTracksViewChanges(true)
    setRegion(newRegion)

    if (trackingTimeout.current) clearTimeout(trackingTimeout.current)

    trackingTimeout.current = setTimeout(() => {
      setTracksViewChanges(false)
    }, 350)
  }

  const handleClusterPress = (clusterId: number) => {
    const leaves = index.getLeaves(clusterId, Infinity)
    const coordinates = leaves.map((leaf) => ({
      latitude: leaf.geometry.coordinates[1],
      longitude: leaf.geometry.coordinates[0],
    }))

    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 120, right: 60, bottom: 60, left: 60 },
      animated: true,
    })
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        mapType='terrain'
        style={styles.map}
        initialRegion={initialRegion}
        onMapReady={() => setIsMapReady(true)}
        onRegionChangeComplete={handleRegionChangeComplete}>
        {visibleClusters.map((item) => {
          const [longitude, latitude] = item.geometry.coordinates
          const properties = item.properties as MapFeatureProps

          if (properties.cluster) {
            const baggedCount = properties.baggedCount || 0
            const pointCount = properties.point_count || 1

            const clusterSize = getRelativeClusterSize(
              pointCount,
              minClusterCount,
              maxClusterCount,
            )
            const clusterKey = `cluster-${item.id}-${longitude.toFixed(4)}-${latitude.toFixed(4)}-${pointCount}-${baggedCount}-${clusterSize}`

            return (
              <Marker
                key={clusterKey}
                coordinate={{ latitude, longitude }}
                tracksViewChanges={tracksViewChanges}
                onPress={() => handleClusterPress(properties.cluster_id)}>
                <ClusterMarker
                  count={pointCount}
                  baggedCount={baggedCount}
                  size={clusterSize}
                />
              </Marker>
            )
          }

          const { fell } = properties
          const isClimbed = fell.bagDates && fell.bagDates.length > 0

          return (
            <Marker
              key={`fell-${fell.id}`}
              coordinate={{ latitude, longitude }}
              pinColor={isClimbed ? "green" : "red"}
              title={fell.name}
              description={getFellDescription(fell)}
              tracksViewChanges={tracksViewChanges}
            />
          )
        })}
      </MapView>
    </View>
  )
}

// -----------------------------------------------------------------------------
// Scalable SVG Cluster Marker (With Anti-Aliasing Buffer)
// -----------------------------------------------------------------------------

interface ClusterMarkerProps {
  count: number
  baggedCount: number
  size: number
}

const ClusterMarker = React.memo(
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
    }, [count, baggedCount, size])

    const strokeWidth = 4
    // 2px buffer pulls the stroke away from the canvas edges to prevent clipping
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
          {/* Base Outer Ring (Black) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke='#000000'
            strokeWidth={strokeWidth}
            fill='none'
          />

          {/* Progress Arc (White) */}
          {ratio > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke='#FFFFFF'
              strokeWidth={strokeWidth}
              fill='none'
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap='butt'
              origin={`${size / 2}, ${size / 2}`}
              rotation='-90'
            />
          )}

          {/* Inner Core Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth / 2 + 0.5}
            fill={fillColor}
          />
        </Svg>

        {/* Scaled Text Overlay */}
        <View style={styles.clusterTextOverlay}>
          <Text style={[styles.clusterTextMain, { fontSize }]}>{count}</Text>
        </View>
      </Animated.View>
    )
  },
)

function getZoomLevel(longitudeDelta: number): number {
  return Math.round(Math.log2(360 / (longitudeDelta || 1)))
}

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  clusterContainer: {
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000000",
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
    color: "#FFFFFF",
    fontWeight: "900",
  },
})
