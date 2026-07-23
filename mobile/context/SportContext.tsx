import { IGetSportCount } from "@/services/db/types"
import { createContext, useState } from "react"

export const SportContext = createContext<{
  selectedSportIdx: number
  setSelectedSportIdx: React.Dispatch<React.SetStateAction<number>>
  allSports: IGetSportCount[]
  setAllSports: React.Dispatch<React.SetStateAction<IGetSportCount[]>>
}>({
  selectedSportIdx: -1,
  setSelectedSportIdx: () => {},
  allSports: [],
  setAllSports: () => {},
})

export function SportProvider({
  children,
  defaultSport,
  defaultAllSports,
}: {
  children: React.ReactNode
  defaultSport: number
  defaultAllSports: IGetSportCount[]
}) {
  const [selectedSportIdx, setSelectedSportIdx] = useState(defaultSport)
  const [allSports, setAllSports] = useState(defaultAllSports)

  return (
    <SportContext.Provider
      value={{
        selectedSportIdx,
        setSelectedSportIdx,
        allSports,
        setAllSports,
      }}>
      {children}
    </SportContext.Provider>
  )
}
