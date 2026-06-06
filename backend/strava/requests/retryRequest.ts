import axios, { AxiosRequestConfig, AxiosResponse, isAxiosError } from "axios"
import { getError } from "../../lib/errors/errorMessage"

const RETRIES = 5
const MAX_SLEEP = 10_000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function makeRequest<T>(
  url: string,
  options: AxiosRequestConfig,
): Promise<{ ok: true; data: T } | { ok: false; response: AxiosResponse }> {
  let lastError: Error

  for (let i = 1; i <= RETRIES; i++) {
    try {
      const res = await axios({ url, ...options })
      return { ok: true, data: res.data as T }
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        if (err.response.status < 500) {
          return { ok: false, response: err.response } // 4xx, bail immediately
        }
        lastError = new Error(`Request failed: ${err.response.status}`)
      } else {
        lastError = getError(err)
      }
      console.log(lastError.message)
    }
    if (i < RETRIES) {
      await sleep(
        Math.min(MAX_SLEEP, 1000 * Math.pow(2, i)) + 1000 * Math.random(),
      )
    }
  }

  throw lastError!
}
