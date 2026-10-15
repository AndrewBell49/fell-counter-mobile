import { COLOURS } from "@/constants/colours"
import { Polyline } from "react-native-maps"

interface RoutePolylineProps {
  activityId: number
  routeCoords: {
    latitude: number
    longitude: number
  }[]
}

export function RoutePolyline({ activityId, routeCoords }: RoutePolylineProps) {
  if (routeCoords.length > 0) {
    return (
      <Polyline
        coordinates={routeCoords}
        strokeColor={COLOURS.pop}
        strokeWidth={3}
        key={activityId}
      />
    )
  }
}
