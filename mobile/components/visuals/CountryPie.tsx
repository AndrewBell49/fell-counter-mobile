import { useDatabase } from "@/hooks/useDatabase"
import { IGetBagCount, IGetCountryBag } from "@/services/db/types"
import { useEffect, useState } from "react"
import { PieChart } from "../utils/PieChart"

export function CountryPie() {
  const database = useDatabase()
  const [countryData, setCountryData] = useState<IGetCountryBag[] | null>(null)
  const [bagCount, setBagCount] = useState<IGetBagCount | null>(null)

  useEffect(() => {
    if (!database) return

    database.getBagsByCountry().then((countryData) => {
      setCountryData(countryData)
    })
    database.getBagCount().then((bagCount) => {
      setBagCount(bagCount)
    })
  }, [database])

  return (
    <PieChart
      data={
        countryData?.map((data) => {
          return { label: data.country, count: data.count }
        }) || null
      }
      title='Bags per country'
      centerLabel={`${bagCount?.count} bags`}
      centerLabelSub={`${bagCount?.distinctCount} distinct`}
    />
  )
}
