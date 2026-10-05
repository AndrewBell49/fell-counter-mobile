import SportIcon from "@/components/utils/SportIcon"
import { SportContext } from "@/context/SportContext"
import { useContext } from "react"
import { PieChart } from "../utils/PieChart"

export function SportPie() {
  const { selectedSportIdx, setSelectedSportIdx, allSports } =
    useContext(SportContext)

  const selectedSport = allSports[selectedSportIdx]

  return (
    <PieChart
      data={
        allSports?.map((data) => ({
          label: data.sport,
          count: data.count,
        })) || null
      }
      title='Activities per sport'
      centerIcon={<SportIcon sport={selectedSport.sport} size={24} />}
      centerLabel={`${selectedSport.count}`}
      centerLabelSub={`${selectedSport.sport} activities`}
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
