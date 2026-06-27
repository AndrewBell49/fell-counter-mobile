import { Request, Response } from "express"
import { User } from "../../../db/schema/users"

export async function getUser(req: Request, res: Response) {
  const user: User = res.locals.user
  res.json({
    firstName: user.first_name,
    lastName: user.last_name,
    city: user.city,
    state: user.state,
    country: user.country,
  })
}
