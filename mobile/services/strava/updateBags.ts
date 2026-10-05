import { RequestFn } from "@/hooks/useApi"
import { ApiError } from "@/services/errors/apiError"
import { SERVER_URL } from "./constants"

export interface BagUpdateItem {
  fell_id: number
  activity_id: number
  bag_sequence: number
  bag_date: Date
}

export type SyncStatus = "SUCCESS" | "RETRY" | "ERROR"

export async function sendBagUpdates(
  addBags: BagUpdateItem[],
  removeBagIds: number[],
  request: RequestFn,
): Promise<SyncStatus> {
  try {
    await request<{ success: boolean }>({
      url: `${SERVER_URL}/strava/update-bags`,
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addBags: addBags.map((bag) => ({
            ...bag,
            bag_date: bag.bag_date.toISOString(),
          })),
          removeBagIds,
        }),
      },
      retries: 1,
    })

    return "SUCCESS"
  } catch (error) {
    if (error instanceof ApiError) {
      // Retriable / Temporary issues: Network (0), Timeout (408), Auth (401/403), Not Found (404), Rate Limit (429), Server Error (5xx)
      const isRetriable =
        error.status === 0 ||
        error.status === 401 ||
        error.status === 403 ||
        error.status === 404 ||
        error.status === 408 ||
        error.status === 429 ||
        error.status >= 500

      if (isRetriable) {
        return "RETRY"
      }
    }

    // Unrecoverable validation / client bugs (e.g. 400, 422) -> Safe to discard
    return "ERROR"
  }
}
