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
  fellId: number
  classificationId: number
}
export interface Activity {
  id: number
  name: string
  distance: number | null
  elapsedTime: number | null
  movingTime: number | null
  elevation: number | null
  sport: string | null
  startDate: number
}

export interface Bag {
  id: number
  fellId: number
  activityId: number
  bagDate: number
}
