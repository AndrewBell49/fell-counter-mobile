import ActivityFellsList from "@/components/activities/ActivityFellsList"
import ActivityOverview from "@/components/activities/ActivityOverview"
import HeaderBar from "@/components/utils/HeaderBar"
import { Loading } from "@/components/utils/Loading"
import { Text } from "@/components/utils/Text"
import { Visual } from "@/components/utils/Visual"
import { COLOURS } from "@/constants/colours"
import { useApi } from "@/hooks/useApi"
import { useDatabase } from "@/hooks/useDatabase"
import { IGetActivityInfo } from "@/services/db/types"
import { getDetailDepth } from "@/services/navigation/detailNavigation"
import { Stack, useLocalSearchParams } from "expo-router"
import React, { useEffect, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"

export default function ActivityDetailsScreen() {
  const { id, detailDepth } = useLocalSearchParams<{
    id: string
    detailDepth?: string | string[]
  }>()
  const activityId = Number(id)
  const currentDetailDepth = getDetailDepth(detailDepth)
  const { request } = useApi()

  const database = useDatabase()
  const [activityInfo, setActivityInfo] = useState<
    IGetActivityInfo | undefined | null
  >(null)

  useEffect(() => {
    if (!database || isNaN(activityId)) return

    database.getActivityInfo(activityId).then((info) => {
      setActivityInfo(info)
    })
  }, [database, activityId])

  const handleRemoveBag = async (bagId: number) => {
    if (!database || !activityInfo) return

    // Execute database deletion
    await database.removeBag(bagId, request)

    // Update state locally
    setActivityInfo({
      ...activityInfo,
      baggedFells: activityInfo.baggedFells.filter(
        (bag) => bag.bagId !== bagId,
      ),
    })
  }

  if (activityInfo === null) {
    return (
      <Visual title='Loading Activity'>
        <Loading />
      </Visual>
    )
  }

  if (activityInfo === undefined || isNaN(activityId)) {
    return (
      <View style={styles.container}>
        <Text style={{ color: COLOURS.text }}>
          No activity info for ID: {id}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <HeaderBar text={"Activity Details"} />

      <ScrollView contentContainerStyle={styles.content}>
        <ActivityOverview activityInfo={activityInfo} />

        <ActivityFellsList
          baggedFells={activityInfo.baggedFells}
          onRemoveBag={handleRemoveBag}
          activityId={activityInfo.id}
          detailDepth={currentDetailDepth}
        />
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
})
