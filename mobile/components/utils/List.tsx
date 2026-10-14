import { ReactNode } from "react"
import { Loading } from "./Loading"
import { Visual } from "./Visual"

interface ListProps<T> {
  title: string
  components: ReactNode[] | null
}

export function List<T>({ title, components }: ListProps<T>) {
  if (!components) {
    return (
      <Visual title={title}>
        <Loading />
      </Visual>
    )
  }

  return (
    <Visual title={title}>{components.map((component) => component)}</Visual>
  )
}
