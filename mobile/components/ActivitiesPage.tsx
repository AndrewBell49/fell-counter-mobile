import { useCollapsibleHeader } from "@/components/utils/CollapsibleHeaderContext"
import { Loading } from "@/components/utils/Loading"
import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import { useDatabase } from "@/hooks/useDatabase"
import { IActivityListItem, IGetActivitiesParams } from "@/services/db/types"
import React, { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native"
import Animated from "react-native-reanimated"

import { ActivityCard } from "@/components/activityTab/ActivityCard"
import { FilterModal } from "@/components/activityTab/FilterModal"
import { SearchFilterBar } from "@/components/activityTab/SearchFilterBar"
import {
  DEFAULT_FILTERS,
  FilterState,
  SortField,
  SortOrder,
} from "@/components/activityTab/types"
import { getActivityEmptyMessage } from "@/components/activityTab/utils"

const PAGE_SIZE = 15

export default function ActivitiesPage() {
  const database = useDatabase()
  const { scrollHandler, headerHeightWithInsets } = useCollapsibleHeader()

  const [activities, setActivities] = useState<IActivityListItem[]>([])
  const [sportOptions, setSportOptions] = useState<string[]>(["All"])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [filterModalVisible, setFilterModalVisible] = useState(false)

  // Sort State
  const [sortBy, setSortBy] = useState<SortField>("startDate")
  const [sortOrder, setSortOrder] = useState<SortOrder>("DESC")

  // Filter & Search State
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(DEFAULT_FILTERS)

  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.search.trim().length > 0) count++

    const isSportFiltered =
      appliedFilters.sports.length > 0 &&
      !appliedFilters.sports.some((s) => s.toLowerCase() === "all")

    if (isSportFiltered) count++
    if (appliedFilters.minDistance || appliedFilters.maxDistance) count++
    if (appliedFilters.minElevation || appliedFilters.maxElevation) count++
    if (
      appliedFilters.minHours ||
      appliedFilters.minMins ||
      appliedFilters.maxHours ||
      appliedFilters.maxMins
    )
      count++
    if (appliedFilters.minFells || appliedFilters.maxFells) count++
    return count
  }

  const buildQueryParams = (pageToLoad: number): IGetActivitiesParams => {
    const params: IGetActivitiesParams & { search?: string } = {
      page: pageToLoad,
      limit: PAGE_SIZE,
      sortBy,
      sortOrder,
    }

    if (appliedFilters.search.trim()) {
      params.search = appliedFilters.search.trim()
    }

    const selectedSports = appliedFilters.sports.filter(
      (s) => s.toLowerCase() !== "all",
    )

    if (selectedSports.length > 0) {
      params.sport =
        selectedSports.length === 1
          ? selectedSports[0]
          : (selectedSports as any)
    }

    if (appliedFilters.minDistance)
      params.minDistance = Number(appliedFilters.minDistance) * 1000
    if (appliedFilters.maxDistance)
      params.maxDistance = Number(appliedFilters.maxDistance) * 1000
    if (appliedFilters.minElevation)
      params.minElevation = Number(appliedFilters.minElevation)
    if (appliedFilters.maxElevation)
      params.maxElevation = Number(appliedFilters.maxElevation)

    const minSecs =
      Number(appliedFilters.minHours || 0) * 3600 +
      Number(appliedFilters.minMins || 0) * 60
    if (minSecs > 0) params.minTime = minSecs

    const maxSecs =
      Number(appliedFilters.maxHours || 0) * 3600 +
      Number(appliedFilters.maxMins || 0) * 60
    if (maxSecs > 0) params.maxTime = maxSecs

    if (appliedFilters.minFells)
      params.minFells = Number(appliedFilters.minFells)
    if (appliedFilters.maxFells)
      params.maxFells = Number(appliedFilters.maxFells)

    return params
  }

  const loadActivities = useCallback(
    async (pageToLoad: number, isRefresh = false) => {
      if (!database) return

      try {
        if (isRefresh) {
          setRefreshing(true)
        } else if (pageToLoad > 1) {
          setLoadingMore(true)
        }

        const queryParams = buildQueryParams(pageToLoad)
        const data = await database.getActivities(queryParams)

        if (isRefresh || pageToLoad === 1) {
          setActivities(data)
          setPage(1)
        } else {
          setActivities((prev) => [...prev, ...data])
          setPage(pageToLoad)
        }
        setHasMore(data.length >= PAGE_SIZE)
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setInitialLoading(false)
        setLoadingMore(false)
        setRefreshing(false)
      }
    },
    [database, sortBy, sortOrder, appliedFilters],
  )

  useEffect(() => {
    if (database) {
      loadActivities(1)

      database
        .getSportCounts()
        .then((sportData) => {
          if (Array.isArray(sportData)) {
            const fetchedSports = sportData
              .map((item) => item.sport)
              .filter(Boolean)
            setSportOptions(["All", ...fetchedSports])
          }
        })
        .catch((error) => console.error("Error fetching sports:", error))
    }
  }, [database, loadActivities])

  const handleApplyFilters = () => {
    setAppliedFilters(filters)
    setFilterModalVisible(false)
  }

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
    setSortBy("startDate")
    setSortOrder("DESC")
    setFilterModalVisible(false)
  }

  const handleEndReached = () => {
    if (!loadingMore && hasMore && !initialLoading && !refreshing) {
      loadActivities(page + 1)
    }
  }

  const handleRefresh = () => {
    loadActivities(1, true)
  }

  const activeFilterCount = getActiveFilterCount()

  if (initialLoading) {
    return (
      <View style={[styles.container, { paddingTop: headerHeightWithInsets }]}>
        <View style={styles.centered}>
          <Loading />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={activities}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ActivityCard item={item} />}
        onScroll={scrollHandler}
        scrollEventThrottle={5}
        ListHeaderComponent={
          <SearchFilterBar
            onPress={() => setFilterModalVisible(true)}
            activeFilterCount={activeFilterCount}
            hasActiveSearch={Boolean(appliedFilters.search.trim())}
            searchTerm={appliedFilters.search.trim()}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: headerHeightWithInsets + 10 },
        ]}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLOURS.primary}
            colors={[COLOURS.primary]}
            progressViewOffset={headerHeightWithInsets}
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size='small' color={COLOURS.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {getActivityEmptyMessage(appliedFilters)}
          </Text>
        }
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        setFilters={setFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        sportOptions={sportOptions}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOURS.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 16,
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: COLOURS.textLight,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 40,
  },
})
