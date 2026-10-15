export interface Fell {
  id: number
  name: string
  elevation: number
  latitude: number
  longitude: number
  country: string
}

export interface Classification {
  id: number
  name: string
  description: string
}

export interface FellClassification {
  fell_id: number
  classification_id: number
}

export interface Activity {
  id: number
  name: string
  description?: string
  distance: number | null
  elapsed_time: number | null
  moving_time: number | null
  elevation: number | null
  sport: string | null
  start_date: number
  average_speed?: number
  max_speed?: number
  summary_polyline?: string
}

export interface Bag {
  id: number
  fell_id: number
  activity_id: number
  bag_date: number
}

export interface PendingSync {
  id: number
  action: "ADD_BAG" | "REMOVE_BAG"
  payload: string
  created_at: number
}
