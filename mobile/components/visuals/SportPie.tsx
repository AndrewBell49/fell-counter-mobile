import { SportContext } from "@/context/SportContext"
import { useContext } from "react"
import { PieChart } from "../utils/PieChart"

export function SportPie() {
  const { selectedSportIdx, setSelectedSportIdx, allSports } =
    useContext(SportContext)

  return (
    <PieChart
      data={
        allSports?.map((data) => {
          return { label: data.sport, count: data.count }
        }) || null
      }
      title='Activities per sport'
      centerLabel={`${allSports.reduce(
        (accumulator, currentValue) => accumulator + currentValue.count,
        0,
      )} activities`}
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
