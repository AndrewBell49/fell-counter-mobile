import { DatabaseAdapter } from "./databaseAdapter"
import type {
  Activity,
  Bag,
  Classification,
  Fell,
  FellClassification,
} from "./sqlite/schema"
import type {
  IGetBagCount,
  IGetBagHeightBoxPlot,
  IGetBagsInDateOrder,
  IGetCountryBag,
  IGetMaxMinBagDate,
} from "./types"

export class WebAdapter implements DatabaseAdapter {
  // Updating database
  insertFells(fells: Fell[] | Fell): Promise<void> {
    return Promise.resolve()
  }
  removeFells(ids: number[] | number): Promise<void> {
    return Promise.resolve()
  }
  insertClassifications(
    classifications: Classification[] | Classification,
  ): Promise<void> {
    return Promise.resolve()
  }
  removeClassifications(classificationIds: number[] | number): Promise<void> {
    return Promise.resolve()
  }
  insertFellClassifications(
    fellClassifications: FellClassification[] | FellClassification,
  ): Promise<void> {
    return Promise.resolve()
  }
  removeFellClassifications(
    fellClassifications: FellClassification[] | FellClassification,
  ): Promise<void> {
    return Promise.resolve()
  }
  insertActivities(activities: Activity[] | Activity): Promise<void> {
    return Promise.resolve()
  }
  removeActivities(activityIds: number[] | number): Promise<void> {
    return Promise.resolve()
  }
  insertBags(bags: Bag[] | Bag): Promise<void> {
    return Promise.resolve()
  }
  removeBags(bagIds: number[] | number): Promise<void> {
    return Promise.resolve()
  }
  getMaxMinBagDate(): Promise<IGetMaxMinBagDate> {
    return Promise.resolve({
      max: 1782559272000,
      min: 1502788415000,
    })
  }

  // Visuals
  getBagCount(): Promise<IGetBagCount> {
    return Promise.resolve({ count: 1066, distinctCount: 462 })
  }
  getBagHeightBoxPlot(): Promise<IGetBagHeightBoxPlot> {
    return Promise.resolve({
      max: 1224,
      median: 633,
      min: 53,
      outliersMax: [
        1287, 1417, 1472, 1475, 1517, 1588, 1607, 1638, 1730, 1743, 1758, 1776,
        1832, 1844, 1858, 1869, 1876, 1894.5, 1979, 1987, 2005, 2012, 2026,
        2096, 2096, 2097, 2100, 2112, 2122, 2128, 2258, 2272, 2298, 2302, 2345,
        2355, 2368, 2452, 2469, 2472, 2540, 2680, 2684, 2738, 2864, 2973,
      ],
      outliersMin: [],
      q1: 481.6,
      q3: 790.8499999999999,
    })
  }
  getBagsInDateOrder(): Promise<IGetBagsInDateOrder[]> {
    return Promise.resolve([
      { bags: 4, month: "08/17" },
      { bags: 0, month: "09/17" },
      { bags: 11, month: "10/17" },
      { bags: 2, month: "11/17" },
      { bags: 4, month: "12/17" },
      { bags: 0, month: "01/18" },
      { bags: 1, month: "02/18" },
      { bags: 2, month: "03/18" },
      { bags: 4, month: "04/18" },
      { bags: 2, month: "05/18" },
      { bags: 0, month: "06/18" },
      { bags: 1, month: "07/18" },
      { bags: 5, month: "08/18" },
      { bags: 0, month: "09/18" },
      { bags: 0, month: "10/18" },
      { bags: 3, month: "11/18" },
      { bags: 3, month: "12/18" },
      { bags: 1, month: "01/19" },
      { bags: 0, month: "02/19" },
      { bags: 1, month: "03/19" },
      { bags: 5, month: "04/19" },
      { bags: 0, month: "05/19" },
      { bags: 1, month: "06/19" },
      { bags: 1, month: "07/19" },
      { bags: 2, month: "08/19" },
      { bags: 2, month: "09/19" },
      { bags: 1, month: "10/19" },
      { bags: 2, month: "11/19" },
      { bags: 2, month: "12/19" },
      { bags: 21, month: "01/20" },
      { bags: 0, month: "02/20" },
      { bags: 9, month: "03/20" },
      { bags: 9, month: "04/20" },
      { bags: 15, month: "05/20" },
      { bags: 45, month: "06/20" },
      { bags: 37, month: "07/20" },
      { bags: 27, month: "08/20" },
      { bags: 8, month: "09/20" },
      { bags: 7, month: "10/20" },
      { bags: 12, month: "11/20" },
      { bags: 5, month: "12/20" },
      { bags: 4, month: "01/21" },
      { bags: 4, month: "02/21" },
      { bags: 10, month: "03/21" },
      { bags: 59, month: "04/21" },
      { bags: 5, month: "05/21" },
      { bags: 21, month: "06/21" },
      { bags: 12, month: "07/21" },
      { bags: 9, month: "08/21" },
      { bags: 4, month: "09/21" },
      { bags: 5, month: "10/21" },
      { bags: 3, month: "11/21" },
      { bags: 4, month: "12/21" },
      { bags: 3, month: "01/22" },
      { bags: 1, month: "02/22" },
      { bags: 7, month: "03/22" },
      { bags: 3, month: "04/22" },
      { bags: 3, month: "05/22" },
      { bags: 3, month: "06/22" },
      { bags: 2, month: "07/22" },
      { bags: 8, month: "08/22" },
      { bags: 23, month: "09/22" },
      { bags: 18, month: "10/22" },
      { bags: 5, month: "11/22" },
      { bags: 0, month: "12/22" },
      { bags: 0, month: "01/23" },
      { bags: 0, month: "02/23" },
      { bags: 0, month: "03/23" },
      { bags: 0, month: "04/23" },
      { bags: 18, month: "05/23" },
      { bags: 5, month: "06/23" },
      { bags: 17, month: "07/23" },
      { bags: 16, month: "08/23" },
      { bags: 17, month: "09/23" },
      { bags: 7, month: "10/23" },
      { bags: 10, month: "11/23" },
      { bags: 21, month: "12/23" },
      { bags: 32, month: "01/24" },
      { bags: 6, month: "02/24" },
      { bags: 17, month: "03/24" },
      { bags: 13, month: "04/24" },
      { bags: 12, month: "05/24" },
      { bags: 44, month: "06/24" },
      { bags: 10, month: "07/24" },
      { bags: 52, month: "08/24" },
      { bags: 21, month: "09/24" },
      { bags: 10, month: "10/24" },
      { bags: 6, month: "11/24" },
      { bags: 16, month: "12/24" },
      { bags: 8, month: "01/25" },
      { bags: 14, month: "02/25" },
      { bags: 9, month: "03/25" },
      { bags: 13, month: "04/25" },
      { bags: 4, month: "05/25" },
      { bags: 18, month: "06/25" },
      { bags: 41, month: "07/25" },
      { bags: 3, month: "08/25" },
      { bags: 6, month: "09/25" },
      { bags: 8, month: "10/25" },
      { bags: 0, month: "11/25" },
      { bags: 1, month: "12/25" },
      { bags: 6, month: "01/26" },
      { bags: 9, month: "02/26" },
      { bags: 9, month: "03/26" },
      { bags: 35, month: "04/26" },
      { bags: 14, month: "05/26" },
      { bags: 34, month: "06/26" },
      { bags: 8, month: "07/26" },
    ])
  }

  getBagsByCountry(): Promise<IGetCountryBag[]> {
    return Promise.resolve([
      { count: 1, country: "Canada" },
      { count: 15, country: "Norway" },
      { count: 37, country: "Poland" },
      { count: 3, country: "Slovenia" },
      { count: 1, country: "Spain" },
      { count: 8, country: "Switzerland" },
      { count: 397, country: "UK" },
    ])
  }
}
