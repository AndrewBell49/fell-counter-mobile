import { UserContext } from "@/context/UserContext"
import { ApiError } from "@/services/errors/apiError"
import { getError } from "@/services/errors/errorMessage"
import { useContext } from "react"

const RETRIES = 5
const MAX_SLEEP = 10_000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useApi() {
  const { getHeaders } = useContext(UserContext)

  async function request<T>({
    url,
    options,
    allowedCodes = [],
    retries = RETRIES,
  }: {
    url: string
    options?: RequestInit
    allowedCodes?: number[]
    retries?: number
  }): Promise<T> {
    let lastError: ApiError

    for (let i = 1; i <= retries; i++) {
      try {
        const res = await fetch(url, {
          ...options,
          headers: { ...getHeaders(), ...options?.headers },
        })
        if (res.ok || allowedCodes.includes(res.status)) {
          return (await res.json()) as T
        }
        const err = await ApiError.fromResponse(res)
        if (res.status < 500) throw err // bail, no retry
        lastError = err // 5xx, retry
      } catch (err) {
        if (err instanceof ApiError) throw err
        lastError = new ApiError(0, getError(err).message) // network/unknown error
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

  return { request }
}

type ApiHook = ReturnType<typeof useApi>
export type RequestFn = ApiHook["request"]
