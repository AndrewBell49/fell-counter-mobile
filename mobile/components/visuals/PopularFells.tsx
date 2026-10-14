import { useDatabase } from "@/hooks/useDatabase"
import { IGetPopularFells } from "@/services/db/types"
import { useEffect, useState } from "react"
import { Text } from "../utils/Text"

export function PopularFells() {
  const database = useDatabase()
  const [nFells, setNFells] = useState(5)
  const [popularFells, setPopularFells] = useState<IGetPopularFells[] | null>(
    null,
  )

  useEffect(() => {
    if (!database) return

    database.getPopularFells(nFells).then((data) => {
      setPopularFells(data)
    })
  }, [database])

  useEffect(() => {
    console.log(popularFells)
  }, [popularFells])

  return (
    // <List title={"Most popular fells"}/>
    <Text>PopularFells</Text>
  )
}
