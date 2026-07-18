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
