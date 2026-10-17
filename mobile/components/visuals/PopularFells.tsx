import { useDatabase } from "@/hooks/useDatabase"
import { IGetPopularFells } from "@/services/db/types"
import React, { useEffect, useState } from "react"
import { View, ViewStyle } from "react-native"
import { FellCard } from "../fells/FellCard"
import { List } from "../utils/List"
import { Loading } from "../utils/Loading"
import { Slider } from "../utils/Slider"
import { Visual } from "../utils/Visual"

const MIN_POPULAR_FELLS = 3
const MAX_POPULAR_FELLS = 20

interface PopularFellsProps {
  style?: ViewStyle
  sliderStyle?: ViewStyle
}

export function PopularFells({ style, sliderStyle }: PopularFellsProps) {
  const database = useDatabase()
  const [nFells, setNFells] = useState(5)
  const [popularFells, setPopularFells] = useState<IGetPopularFells[] | null>(
    null,
  )

  const title = `Most popular fells (${nFells})`

  useEffect(() => {
    if (!database) return

    database.getPopularFells(MAX_POPULAR_FELLS).then((data) => {
      setPopularFells(data)
    })
  }, [database])

  if (!popularFells) {
    return (
      <View style={style}>
        <Visual title={title}>
          <Loading />
        </Visual>
      </View>
    )
  }

  // Pre-calculate ranks handling ties across the list
  let currentRank = 1
  const rankedFells = popularFells.map((fell, index, array) => {
    if (index > 0 && fell.count < array[index - 1].count) {
      currentRank = index + 1
    }

    const isTied =
      (index > 0 && fell.count === array[index - 1].count) ||
      (index < array.length - 1 && fell.count === array[index + 1].count)

    return {
      fell,
      rank: currentRank,
      isTied,
    }
  })

  // Standalone slider component directly below the title
  const sliderControl = (
    <Slider
      key='popular-fells-slider'
      style={sliderStyle}
      minimumValue={MIN_POPULAR_FELLS}
      maximumValue={MAX_POPULAR_FELLS}
      step={1}
      value={nFells}
      onValueChange={setNFells}
    />
  )

  const fellCards = rankedFells
    .slice(0, nFells)
    .map(({ fell, rank, isTied }) => (
      <FellCard key={fell.id} item={fell} rank={rank} isTied={isTied} />
    ))

  const components = [sliderControl, ...fellCards]

  return (
    <View style={style}>
      <List title={title} components={components} />
    </View>
  )
}
