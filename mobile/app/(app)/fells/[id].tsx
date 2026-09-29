import BagCard from "@/components/fells/BagCard"
import Classifications from "@/components/fells/Classifications"
import TerrainMap from "@/components/fells/TerrainMap"
import HeaderBar from "@/components/utils/HeaderBar"
import { Loading } from "@/components/utils/Loading"
import { Text } from "@/components/utils/Text"
import { Visual } from "@/components/utils/Visual"
import { COLOURS } from "@/constants/colours"
import { M_TO_FT } from "@/constants/constants"
import { useDatabase } from "@/hooks/useDatabase"
import { IGetFellInfo } from "@/services/db/types"
import { Stack, useLocalSearchParams } from "expo-router"
import React, { useEffect, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"

export default function FellDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const fellId = Number(id)

  const database = useDatabase()
  const [fellInfo, setFellInfo] = useState<IGetFellInfo | undefined | null>(
    null,
  )

  useEffect(() => {
    if (!database || isNaN(fellId)) return

    database.getFellInfo(fellId).then((fellInfo) => {
      setFellInfo(fellInfo)
    })
  }, [database, fellId])

  if (fellInfo === null) {
    return (
      <Visual title='Loading Fell'>
        <Loading />
      </Visual>
    )
  }

  if (fellInfo === undefined || isNaN(fellId)) {
    return (
      <View style={styles.container}>
        <Text style={{ color: COLOURS.text }}>
          No fell info for fell with ID: {id}
        </Text>
      </View>
    )
  }

  const elevationMeters = fellInfo.elevation
  const elevationFeet = Math.round(elevationMeters * M_TO_FT)

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <HeaderBar text={"Fell Details"} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.fellTitle}>{fellInfo.name}</Text>

        <Text style={styles.elevationText}>
          {elevationMeters}m ({elevationFeet} ft)
        </Text>

        <TerrainMap fellInfo={fellInfo} />

        <BagCard fellInfo={fellInfo} />

        <Classifications fellInfo={fellInfo} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOURS.background,
  },
  content: {
    padding: 20,
  },
  fellTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLOURS.text,
    marginBottom: 4,
  },
  elevationText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLOURS.textLight,
    marginBottom: 20,
  },
})
