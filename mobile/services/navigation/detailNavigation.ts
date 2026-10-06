import { Href, router } from "expo-router"

const MAX_DETAIL_DEPTH = 2

type DetailRoute = "/activities/[id]" | "/fells/[id]"

export type DetailDestination = {
  pathname: DetailRoute
  params: { id: string | number }
}

function withDetailDepth(destination: DetailDestination, depth: number): Href {
  return {
    pathname: destination.pathname,
    params: {
      ...destination.params,
      detailDepth: String(depth),
    },
  } as Href
}

export function getDetailDepth(depth: string | string[] | undefined): number {
  const parsedDepth = Number(depth)
  return parsedDepth === MAX_DETAIL_DEPTH ? MAX_DETAIL_DEPTH : 1
}

export function openDetail(
  current: DetailDestination,
  destination: DetailDestination,
  currentDepth: number,
) {
  if (currentDepth < MAX_DETAIL_DEPTH) {
    router.push(withDetailDepth(destination, currentDepth + 1))
    return
  }

  // Keep the active tab and only the current detail before opening the next one.
  router.dismissAll()
  router.push(withDetailDepth(current, 1))
  router.push(withDetailDepth(destination, MAX_DETAIL_DEPTH))
}
