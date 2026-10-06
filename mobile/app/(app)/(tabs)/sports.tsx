import SportPage from "@/components/SportPage"
import { useCollapsibleHeader } from "@/components/utils/CollapsibleHeaderContext"
import { Loading } from "@/components/utils/Loading"
import { Visual } from "@/components/utils/Visual"
import { SportProvider } from "@/context/SportContext"
import { useDatabase } from "@/hooks/useDatabase"
import { IGetSportCount } from "@/services/db/types"
import { useEffect, useState } from "react"
import { View } from "react-native"

export default function SportsScreen() {
  const database = useDatabase()
  const { headerHeightWithInsets } = useCollapsibleHeader()
  const [allSports, setAllSports] = useState<IGetSportCount[] | null>(null)

  useEffect(() => {
    if (!database) return

    database.getSportCounts().then((sportData) => {
      setAllSports(sportData)
    })
  }, [database])

  if (!allSports) {
    return (
      <View style={{ flex: 1, paddingTop: headerHeightWithInsets }}>
        <Visual title='Loading Sports'>
          <Loading />
        </Visual>
      </View>
    )
  }

  const maxIndex = allSports.reduce(
    (maxIdx, item, idx, arr) => (item.count > arr[maxIdx].count ? idx : maxIdx),
    0,
  )

  return (
    <View style={{ flex: 1 }}>
      <SportProvider defaultSport={maxIndex} defaultAllSports={allSports}>
        <SportPage />
      </SportProvider>
    </View>
  )
}
