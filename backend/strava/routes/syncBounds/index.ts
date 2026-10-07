import { Request, Response } from "express"

export async function getSyncBounds(_req: Request, res: Response) {
  res.json({ upperBound: Date.now() })
}
