import { IGetActivitiesParams } from "@/services/db/types"

export type SortField = NonNullable<IGetActivitiesParams["sortBy"]>
export type SortOrder = "ASC" | "DESC"

export interface FilterState {
  sports: string[] // Changed from sport: string
  minDistance: string
  maxDistance: string
  minElevation: string
  maxElevation: string
  minHours: string
  minMins: string
  maxHours: string
  maxMins: string
  minFells: string
  maxFells: string
}

export const DEFAULT_FILTERS: FilterState = {
  sports: ["All"],
  minDistance: "",
  maxDistance: "",
  minElevation: "",
  maxElevation: "",
  minHours: "",
  minMins: "",
  maxHours: "",
  maxMins: "",
  minFells: "",
  maxFells: "",
}
