const RADIUS_EARTH = 6378000

interface getMaxMinLatLonParams {
  minLatitude: number
  maxLatitude: number
  minLongitude: number
  maxLongitude: number
}

export function getMaxMinLatLon(
  latitude: number,
  longitude: number,
  distance: number,
): getMaxMinLatLonParams {
  const distanceRadius = distance / RADIUS_EARTH

  const dLatitude = distanceRadius * (180 / Math.PI)
  const minLatitude = latitude - dLatitude
  const maxLatitude = latitude + dLatitude

  const dLongitude =
    (distanceRadius * (180 / Math.PI)) / Math.cos((latitude * Math.PI) / 180)
  const minLongitude = longitude - dLongitude
  const maxLongitude = longitude + dLongitude

  return {
    minLatitude,
    maxLatitude,
    minLongitude,
    maxLongitude,
  }
}
