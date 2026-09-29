import { IGetFellLocations } from "@/services/db/types"
import * as Location from "expo-location"
import { useFocusEffect, useRouter } from "expo-router"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import MapView, {
  MapMarker,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps"
import Supercluster from "supercluster"
import { ClusterMarker } from "./ClusterMarker"
import { FellCallout } from "./FellCallout"
import { LocationButton } from "./LocationButton"

interface FellMapProps {
  data: IGetFellLocations[]
}

type BBox = [number, number, number, number]

type IndividualFellProps = {
  cluster: false
  fellId: string | number
  fell: IGetFellLocations
}

type ClusterAggregatedProps = {
  baggedCount: number
}

type ClusterProps = {
  cluster: true
  point_count: number
  cluster_id: number
  baggedCount: number
}

type MapFeatureProps = IndividualFellProps | ClusterProps

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

function getZoomLevel(longitudeDelta: number): number {
  return Math.round(Math.log2(360 / (longitudeDelta || 1)))
}

export function FellMap({ data }: FellMapProps) {
  const router = useRouter()
  const mapRef = useRef<MapView>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  // Track marker instances and currently open fell ID
  const markerRefs = useRef<Record<string | number, MapMarker | null>>({})
  const [selectedFellId, setSelectedFellId] = useState<string | number | null>(
    null,
  )

  // Re-open callout when navigating back to map screen
  useFocusEffect(
    useCallback(() => {
      if (selectedFellId && markerRefs.current[selectedFellId]) {
        const timer = setTimeout(() => {
          markerRefs.current[selectedFellId]?.showCallout()
        }, 150)

        return () => clearTimeout(timer)
      }
    }, [selectedFellId]),
  )

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

      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(0.15, (maxLat - minLat) * 1.3),
        longitudeDelta: Math.max(0.15, (maxLng - minLng) * 1.3),
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

  const handleCenterUserLocation = async () => {
    if (isLocating) return
    setIsLocating(true)

    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setIsLocating(false)
        return
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      mapRef.current?.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        },
        1000,
      )
    } catch (error) {
      console.error("Error fetching location:", error)
    } finally {
      setIsLocating(false)
    }
  }

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

  const zoom = getZoomLevel(region.longitudeDelta)
  const bbox: BBox = [
    region.longitude - region.longitudeDelta / 2,
    region.latitude - region.latitudeDelta / 2,
    region.longitude + region.longitudeDelta / 2,
    region.latitude + region.latitudeDelta / 2,
  ]

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
        showsUserLocation={true}
        showsMyLocationButton={false}
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
          const isClimbed = Boolean(fell.bagDates && fell.bagDates.length > 0)

          return (
            <Marker
              key={`fell-${fell.id}`}
              ref={(ref) => {
                markerRefs.current[fell.id] = ref
              }}
              coordinate={{ latitude, longitude }}
              pinColor={isClimbed ? "green" : "red"}
              tracksViewChanges={tracksViewChanges}
              onPress={() => setSelectedFellId(fell.id)}
              onDeselect={() => setSelectedFellId(null)}
              onCalloutPress={() => {
                setSelectedFellId(fell.id)
                router.push({
                  pathname: "/fells/[id]",
                  params: { id: String(fell.id) },
                })
              }}>
              <FellCallout fell={fell} />
            </Marker>
          )
        })}
      </MapView>

      <LocationButton
        onPress={handleCenterUserLocation}
        disabled={isLocating}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
})
