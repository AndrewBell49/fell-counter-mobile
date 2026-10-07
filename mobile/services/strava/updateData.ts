import { RequestFn } from "@/hooks/useApi"
import { SERVER_URL } from "./constants"

interface UpdateSchema<T> {
  items: T[]
  removed_items: T[]
  finished: boolean
  nextCursor: number | null
}

export async function getUpdateData<T>(
  name: string,
  lastUpdated: Date | null,
  currentDate: Date,
  request: RequestFn,
): Promise<{ items: T[]; removedItems: T[] }> {
  const items: T[] = []
  const removedItems: T[] = []

  let cursorId = 0
  let dataToCome = true

  while (dataToCome) {
    const data = await request<UpdateSchema<T>>({
      url: `${SERVER_URL}/strava/${name}-data/${cursorId}?currentDate=${currentDate.getTime()}&lastUpdated=${lastUpdated?.getTime() ?? ""}`,
    })

    items.push(...data.items)
    removedItems.push(...data.removed_items)

    if (data.finished) {
      break
    }
    cursorId = data.nextCursor ?? 0
  }
  return { items, removedItems }
}
