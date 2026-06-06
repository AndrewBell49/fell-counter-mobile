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
  const paramDate = new Date(String(param))
  if (isNaN(paramDate.getTime())) {
    res.status(422).json({ error: "Unprocessable Content" })
    return null
  }

  return paramDate
}
