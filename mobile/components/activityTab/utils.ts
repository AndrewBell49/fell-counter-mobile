import type { FilterState } from "./types"

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function formatDate(dateValue: string | number): string {
  const num = Number(dateValue)
  const timestamp = !isNaN(num) ? (num < 1e11 ? num * 1000 : num) : dateValue
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return String(dateValue)

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function hasValue(value: string): boolean {
  return value.trim() !== ""
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-GB", { maximumFractionDigits: 2 })
}

function formatDurationFilter(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0 && minutes > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ${minutes} ${
      minutes === 1 ? "minute" : "minutes"
    }`
  }
  if (hours > 0) return `${hours} ${hours === 1 ? "hour" : "hours"}`
  return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`
}

function getSportDescription(sports: string[]): string {
  const selectedSports = sports.filter((sport) => sport.toLowerCase() !== "all")

  if (selectedSports.length === 0) return "activities"

  const sportNames = selectedSports.map((selectedSport) => {
    const sport = selectedSport.toLowerCase()
    switch (sport) {
      case "run":
        return "runs"
      case "ride":
        return "rides"
      case "walk":
        return "walks"
      case "hike":
        return "hikes"
      default:
        return `${sport} activities`
    }
  })

  if (sportNames.length === 1) return sportNames[0]
  if (sportNames.length === 2) return `${sportNames[0]} or ${sportNames[1]}`

  return `${sportNames.slice(0, -1).join(", ")}, or ${
    sportNames[sportNames.length - 1]
  }`
}

export function getActivityEmptyMessage(filters: FilterState): string {
  const descriptions: string[] = []

  if (hasValue(filters.search)) {
    descriptions.push(`matching "${filters.search.trim()}"`)
  }

  const addDistanceDescription = (min: string, max: string) => {
    if (hasValue(min) && hasValue(max)) {
      descriptions.push(
        `${formatNumber(Number(min))}–${formatNumber(Number(max))} km`,
      )
    } else if (hasValue(min)) {
      descriptions.push(`over ${formatNumber(Number(min))} km`)
    } else if (hasValue(max)) {
      descriptions.push(`under ${formatNumber(Number(max))} km`)
    }
  }

  addDistanceDescription(filters.minDistance, filters.maxDistance)

  const hasMinDuration = hasValue(filters.minHours) || hasValue(filters.minMins)
  const hasMaxDuration = hasValue(filters.maxHours) || hasValue(filters.maxMins)
  const minMinutes =
    Number(filters.minHours || 0) * 60 + Number(filters.minMins || 0)
  const maxMinutes =
    Number(filters.maxHours || 0) * 60 + Number(filters.maxMins || 0)
  if (hasMinDuration && hasMaxDuration) {
    descriptions.push(
      `${formatDurationFilter(minMinutes)}–${formatDurationFilter(maxMinutes)}`,
    )
  } else if (hasMinDuration) {
    descriptions.push(`over ${formatDurationFilter(minMinutes)}`)
  } else if (hasMaxDuration) {
    descriptions.push(`under ${formatDurationFilter(maxMinutes)}`)
  }

  if (hasValue(filters.minElevation) && hasValue(filters.maxElevation)) {
    descriptions.push(
      `with ${formatNumber(Number(filters.minElevation))}–${formatNumber(
        Number(filters.maxElevation),
      )} m of ascent`,
    )
  } else if (hasValue(filters.minElevation)) {
    descriptions.push(
      `with more than ${formatNumber(Number(filters.minElevation))} m of ascent`,
    )
  } else if (hasValue(filters.maxElevation)) {
    descriptions.push(
      `with less than ${formatNumber(Number(filters.maxElevation))} m of ascent`,
    )
  }

  if (hasValue(filters.minFells) && hasValue(filters.maxFells)) {
    descriptions.push(
      `with ${formatNumber(Number(filters.minFells))}–${formatNumber(
        Number(filters.maxFells),
      )} fells bagged`,
    )
  } else if (hasValue(filters.minFells)) {
    descriptions.push(
      `with at least ${formatNumber(Number(filters.minFells))} fells bagged`,
    )
  } else if (hasValue(filters.maxFells)) {
    descriptions.push(
      `with no more than ${formatNumber(Number(filters.maxFells))} fells bagged`,
    )
  }

  const sportDescription = getSportDescription(filters.sports)
  if (descriptions.length === 0) return `No ${sportDescription} found`

  return `No ${sportDescription} found ${descriptions.join(", ")}`
}
