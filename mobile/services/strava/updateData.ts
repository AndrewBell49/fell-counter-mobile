import { RequestFn } from "@/hooks/useApi"
import { SERVER_URL } from "./constants"

interface UpdateSchema<T> {
  items: T[]
  removed_items: T[]
  finished: boolean
}

export async function getUpdateData<T>(
  name: string,
  lastUpdated: Date | null,
  currentDate: Date,
  request: RequestFn,
): Promise<{ items: T[]; removedItems: T[] }> {
  const items: T[] = []
  const removedItems: T[] = []

  let page = 0
  let dataToCome = true

  while (dataToCome) {
    const data = await request<UpdateSchema<T>>(
      `${SERVER_URL}/strava/${name}-data/${page}`,
      {
        headers: {
          lastUpdated: lastUpdated?.getTime().toString() || "",
          currentDate: currentDate.getTime().toString(),
        },
      },
    )

    items.push(...data.items)
    removedItems.push(...data.removed_items)

    if (data.finished) {
      break
    }
    page++
  }
  return { items, removedItems }
}
