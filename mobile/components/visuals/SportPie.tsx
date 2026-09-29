import SportIcon from "@/components/utils/SportIcon"
import { SportContext } from "@/context/SportContext"
import { useContext } from "react"
import { PieChart } from "../utils/PieChart"

export function SportPie() {
  const { selectedSportIdx, setSelectedSportIdx, allSports } =
    useContext(SportContext)

  // Retrieve selected sport object from allSports array
  const selectedSport =
    selectedSportIdx !== null && selectedSportIdx >= 0
      ? allSports?.[selectedSportIdx]
      : null

  return (
    <PieChart
      data={
        allSports?.map((data) => ({
          label: data.sport,
          count: data.count,
        })) || null
      }
      title='Activities per sport'
      centerIcon={
        selectedSport ? (
          <SportIcon sport={selectedSport.sport} size={24} />
        ) : null
      }
      centerLabel={
        selectedSport
          ? `${selectedSport.count}`
          : `${allSports?.reduce((acc, curr) => acc + curr.count, 0) ?? 0}`
      }
      centerLabelSub={
        selectedSport ? `${selectedSport.sport} activities` : "activities"
      }
      selectedIndex={selectedSportIdx}
      setSelectedIndex={(value) =>
        setSelectedSportIdx((prev) => {
          const resolved = typeof value === "function" ? value(prev) : value
          return resolved === null ? -1 : resolved
        })
      }
    />
  )
}
