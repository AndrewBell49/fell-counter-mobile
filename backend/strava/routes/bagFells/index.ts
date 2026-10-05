import { Request, Response } from "express"
import { getBagListFromBody, getPositiveIntListFromBody } from "../params"
import { insertBag } from "../../../db/operations/bags/insertBag"
import { User } from "../../../db/schema/users"
import { deactivateBags } from "../../../db/operations/bags/updateBag"

export async function handleUpdateBags(req: Request, res: Response) {
  console.log(req.body)
  const user: User = res.locals.user

  const addBags = getBagListFromBody(req, res, "addBags")
  if (addBags === null) return

  const removeBagIds = getPositiveIntListFromBody(req, res, "removeBagIds")
  if (removeBagIds === null) return

  await insertBag(
    addBags.map((bag) => {
      return {
        fell_id: bag.fell_id,
        user_id: user.id,
        activity_id: bag.activity_id,
        bag_sequence: bag.bag_sequence,
        bag_date: bag.bag_date,
      }
    }),
  )

  await deactivateBags(user.id, removeBagIds)

  res.status(200).json({ success: true })
}
