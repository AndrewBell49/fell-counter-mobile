import { Request, Response } from "express"

export function getIntParam(
  req: Request,
  res: Response,
  paramName: string,
): number | null {
  const param = String(req.params[paramName])
  const paramInt = parseInt(param, 10)

  if (Number.isNaN(paramInt)) {
    res.status(422).json({ error: "Unprocessable Content" })
    return null
  }

  return paramInt
}

export function getNullOrDateParam(
  req: Request,
  res: Response,
  paramName: string,
): Date | null {
  const param = req.query[paramName]
  if (!param) {
    return null
  }
  const paramDate = new Date(Number(param))
  if (isNaN(paramDate.getTime())) {
    res.status(422).json({ error: "Unprocessable Content" })
    return null
  }

  return paramDate
}

export function getPositiveIntListFromBody(
  req: Request,
  res: Response,
  fieldName: string,
): number[] | null {
  const value = req.body?.[fieldName]

  if (value === undefined) {
    return []
  }

  if (!Array.isArray(value)) {
    res.status(422).json({ error: "Unprocessable Content" })
    return null
  }

  const isValid = value.every(
    (item) => typeof item === "number" && Number.isInteger(item) && item > 0,
  )

  if (!isValid) {
    res.status(422).json({ error: "Unprocessable Content" })
    return null
  }

  return value
}

export interface BagItem {
  fell_id: number
  activity_id: number
  bag_sequence: number
  bag_date: Date
}

export function getBagListFromBody(
  req: Request,
  res: Response,
  fieldName: string,
): BagItem[] | null {
  const value = req.body?.[fieldName]

  if (value === undefined) {
    return []
  }

  if (!Array.isArray(value)) {
    res.status(422).json({ error: "Unprocessable Content" })
    return null
  }

  const parsedItems: BagItem[] = []

  for (const item of value) {
    if (!item || typeof item !== "object") {
      res.status(422).json({ error: "Unprocessable Content" })
      return null
    }

    const { fell_id, activity_id, bag_sequence, bag_date } = item

    const isFellIdValid =
      typeof fell_id === "number" && Number.isInteger(fell_id) && fell_id > 0
    const isActivityIdValid =
      typeof activity_id === "number" &&
      Number.isInteger(activity_id) &&
      activity_id > 0
    const isSequenceValid =
      typeof bag_sequence === "number" &&
      Number.isInteger(bag_sequence) &&
      bag_sequence > 0

    const parsedDate = new Date(bag_date)
    const isDateValid =
      bag_date !== null &&
      bag_date !== undefined &&
      !isNaN(parsedDate.getTime())

    if (
      !isFellIdValid ||
      !isActivityIdValid ||
      !isSequenceValid ||
      !isDateValid
    ) {
      res.status(422).json({ error: "Unprocessable Content" })
      return null
    }

    parsedItems.push({
      fell_id,
      activity_id,
      bag_sequence,
      bag_date: parsedDate,
    })
  }

  return parsedItems
}
