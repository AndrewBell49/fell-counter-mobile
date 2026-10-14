import SportIcon from "@/components/utils/SportIcon"
import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import { M_TO_FT } from "@/constants/constants"
import { IGetActivityInfo } from "@/services/db/types"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { Linking, Platform, Pressable, StyleSheet, View } from "react-native"
import { MiniRouteMap } from "../maps/MiniRouteMap"

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) {
    return `${h}h ${m}m`
  }
  return `${m}m ${s}s`
}

function formatDateTime(dateValue: string | number): string {
  const num = Number(dateValue)
  const timestamp = !isNaN(num) ? (num < 1e11 ? num * 1000 : num) : dateValue
  const date = new Date(timestamp)

  if (isNaN(date.getTime())) return String(dateValue)

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${day}/${month}/${year} at ${hours}:${minutes}`
}

export default function ActivityOverview({
  activityInfo,
}: {
  activityInfo: IGetActivityInfo
}) {
  const distanceKm = (activityInfo.distance / 1000).toFixed(2)
  const elevationFt = Math.round(activityInfo.elevationGain * M_TO_FT)

  const handleOpenInStrava = async () => {
    const webUrl = `https://www.strava.com/activities/${activityInfo.id}`

    if (Platform.OS === "web") {
      await Linking.openURL(webUrl)
      return
    }

    try {
      await Linking.openURL(`strava://activities/${activityInfo.id}`)
    } catch {
      await Linking.openURL(webUrl)
    }
  }

  return (
    <View style={styles.container}>
      {/* Title & Sport Badge */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{activityInfo.title}</Text>

        <MiniRouteMap summaryPolyline='s_dmI``sQ|Ir^vF`AlLwKrLcIzLyBtItAjIqD`IrBnGiHnF`DvCcExHc@`K|E~N`YfFtAde@[jH}EzTaBjXdOde@~MxFhP|QbS|e@rWnVhSfo@{M~J{[hOoIbIp@vEvLdIpBn]wSta@mEp~@ci@pHyKrFiUpEqGtRzF`SoE|BdT~Uvo@bF|`@zHlIhFnRxKnYfDtBh@kDlBz@zUzo@jHuF`GiUnE|ObC}i@U_[uDqc@dCmk@lLyMjIfMpChPdMlRk@xRxJmNoEaHnG_]_@q_@yQg{@jEeRzH_FtSeB|FbQz@hWdDpNzElKzYjXnOgWdKoc@tHqJ~CcTxKxLu@y^mEmOnQvKvg@vKxXoHfU{Z|DeTvI{TxDcRzb@tW~EwDpJqUpQ_H`EXpHfKv_@iOve@oAvd@jm@`QiHpp@|LvGcHzLgj@xTcFjo@pCtCjCtJeB`H_JjOzBlMuYxAwRhDoIdCvD~DiK|BhF`@_BfD`CdBkLeCiOzGt@`TpU~D`@iGo`@xC{XoBcFpAsXlGaI{@wr@lOsSjDmRhMwEdEyF`Qcc@rTiFl]fKnk@aFt~@xCrNkCvEgHzB`C`EeGbRR|ZoB|GmIbFGdOvKrAkE`FfKHuDvBrA|KiGnKXdNkFdI|@bDfCpD|Oo@_CmD~_@r[dAlBeAp@yHxCf@|HjOnCrZdJxE`AtLpJpOd]~G~JZjEpGjD~O|ALhFwE}AmUzAiJtSm[jHrD~Ko@nEqQnFcIIiTfLqB|OlBdRoWxG~KpJ`@fD`EpDmAhCuGdDo@`DwQdJoJrF}S`GwF|Et@|H`JfFKzNp[fWjKlErFtGWrGqJ`IkAp[|PxWuNpSkc@vHiIzS~@tQkE|IsOtSgNbA_TrTxD`JqFpBkIfQlHxC_NdC?~LpY`AhI|`@jYvFtJlBy@`N~^~AyDhWyA`ByIbCgAfGjGpCYp@oFxFc@~DvDvHwBvE`GdJcCxChBxAzMxS`K`FvPjJzElFhXfFzHjExYnGdItI_FvNie@~U{BDsDpEiCjCoHlD_UnDjB|DwJpBvBfHmBxFjXtKpDb@bD_DlCxJfBbHcFN{CrEShCjDlFkK`KjBvSlNvIbPvGWhWzMjGzJx@rJ|MnIdM`Ub`@rIrRlHtK`RxFWbLpInDeA`BkJtGb@xD}ChFiOt@{JhApB`R_MfTmBjHuErDwOhD^r@uJdFqMfHeN|@kRnIkR}@sM{FoLzAyJ|FwGpJmC~[eCdXsVnR|@b@iLpDcC`A_NvFfA' />

        {/* Updated Sport Badge with Strava-style Icon */}
        <View style={styles.sportBadge}>
          <SportIcon
            sport={activityInfo.sport}
            size={14}
            color={COLOURS.primary}
          />
          <Text style={styles.sportText}>{activityInfo.sport}</Text>
        </View>
      </View>

      {/* Start Date & Time */}
      <View style={styles.dateRow}>
        <Ionicons name='calendar-outline' size={16} color={COLOURS.textLight} />
        <Text style={styles.dateText}>
          {formatDateTime(activityInfo.startDate)}
        </Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name='map-outline' size={20} color={COLOURS.primary} />
          <Text style={styles.statValue}>{distanceKm} km</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name='time-outline' size={20} color={COLOURS.primary} />
          <Text style={styles.statValue}>
            {formatDuration(activityInfo.movingTime)}
          </Text>
          <Text style={styles.statSubValue}>
            ({formatDuration(activityInfo.elapsedTime)})
          </Text>
          <Text style={styles.statLabel}>Moving (Elapsed)</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons
            name='trending-up-outline'
            size={20}
            color={COLOURS.primary}
          />
          <Text style={styles.statValue}>{activityInfo.elevationGain}m</Text>
          <Text style={styles.statSubValue}>({elevationFt} ft)</Text>
          <Text style={styles.statLabel}>Elevation Gain</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.stravaButton,
          pressed && styles.stravaButtonPressed,
        ]}
        onPress={() => void handleOpenInStrava()}>
        <Ionicons name='open-outline' size={18} color='#fff' />
        <Text style={styles.stravaButtonText}>Open in Strava</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLOURS.text,
    flex: 1,
    marginRight: 10,
  },
  sportBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLOURS.card,
    borderColor: COLOURS.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sportText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLOURS.primary,
    textTransform: "capitalize",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 18,
  },
  dateText: {
    fontSize: 14,
    color: COLOURS.textLight,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLOURS.card,
    borderColor: COLOURS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",

    shadowColor: COLOURS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOURS.text,
    marginTop: 6,
  },
  statSubValue: {
    fontSize: 11,
    color: COLOURS.textLight,
    marginTop: 1,
  },
  statLabel: {
    fontSize: 11,
    color: COLOURS.textLight,
    marginTop: 4,
    textAlign: "center",
  },
  stravaButton: {
    alignItems: "center",
    backgroundColor: "#FC4C02",
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stravaButtonPressed: {
    opacity: 0.8,
  },
  stravaButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
})
