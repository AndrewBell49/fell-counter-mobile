export interface IGetBagCount {
  count: number
  distinctCount: number
}

export interface IGetBagHeightBoxPlot {
  outliersMin: number[]
  min: number
  q1: number
  median: number
  q3: number
  max: number
  outliersMax: number[]
}

export interface IGetBagsInDateOrder extends Record<string, unknown> {
  bags: number
  month: string
}

export interface IGetMaxMinBagDate {
  max: number
  min: number
}

export interface IGetCountryBag {
  country: string
  count: number
}

export interface IGetFellLocations {
  id: number
  name: string
  elevation: number
  latitude: number
  longitude: number
  bagDates: string[]
}

export interface IGetPopularFells {
  id: number
  name: string
  elevation: number
  count: number
}

export interface IGetSportCount {
  sport: string
  count: number
}

export interface IGetActivityDistanceInDateOrder extends Record<
  string,
  unknown
> {
  kms: number
  month: string
}

export interface IBagInfo {
  date: string | number
  activityName: string
  activityId: number
  sport: string
}

export interface IClassificationInfo {
  name: string
  description: string
}

export interface IGetFellInfo {
  name: string
  elevation: number
  latitude: number
  longitude: number
  bags: IBagInfo[]
  classifications: IClassificationInfo[]
}

export interface IActivityBaggedFell {
  bagId: number
  fellId: number
  fellName: string
  elevation: number
  bagOccurrence: number
}

export interface IGetActivityInfo {
  id: number
  title: string
  description: string
  sport: string
  distance: number
  movingTime: number
  elapsedTime: number
  elevationGain: number
  startDate: number
  averageSpeed: number
  maxSpeed: number
  summaryPolyline: string
  baggedFells: IActivityBaggedFell[]
}

export interface IActivityListItem {
  id: number
  title: string
  distance: number
  elapsedTime: number
  movingTime: number
  elevationGain: number
  sport: string
  startDate: number
  fellsCount: number
}

export interface IGetActivitiesParams {
  page?: number
  limit?: number
  sortBy?:
    | "startDate"
    | "distance"
    | "elevationGain"
    | "movingTime"
    | "sport"
    | "fellsCount"
  sortOrder?: "ASC" | "DESC"
  search?: string
  sport?: string | string[]
  minDate?: number
  maxDate?: number
  minDistance?: number
  maxDistance?: number
  minElevation?: number
  maxElevation?: number
  minTime?: number
  maxTime?: number
  minFells?: number
  maxFells?: number
}
