import { FellMap } from "@/components/maps/FellMap"
import { Loading } from "@/components/utils/Loading"
import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import { useDatabase } from "@/hooks/useDatabase"
import { Classification } from "@/services/db/sqlite/schema"
import { IGetFellLocations } from "@/services/db/types"
import { Picker } from "@react-native-picker/picker"
import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"

export default function MapScreen() {
  const database = useDatabase()
  const [fellLocations, setFellLocations] = useState<
    IGetFellLocations[] | null
  >(null)
  const [classifications, setClassifications] = useState<
    Classification[] | null
  >(null)
  const [selectedClassification, setSelectedClassification] = useState(8)
  const [pickerContentHeight, setPickerContentHeight] = useState(64)

  // Fetch classifications on mount
  useEffect(() => {
    if (!database) return
    database.getAllClassifications().then((data) => {
      setClassifications(data)
    })
  }, [database])

  // Fetch fells when classification changes
  useEffect(() => {
    if (!database) return
    database
      .getBagLocationsByClassification(selectedClassification)
      .then((data) => {
        setFellLocations(data)
      })
  }, [database, selectedClassification])

  const getClassificationText = (classificationId: number) => {
    if (!classifications) return { title: "", subtitle: "" }

    if (classificationId === -1) {
      return {
        title: "All bagged fells",
        subtitle: "All of the fells in the world that you have climbed",
      }
    }

    const classification = classifications.filter(
      (c) => c.id === selectedClassification,
    )
    if (classification.length === 0 || !fellLocations) {
      return {
        title: `Classification ID: ${classificationId}`,
        subtitle: "",
      }
    }

    const fellsBagged = fellLocations.filter(
      (f) => f.bagDates && f.bagDates.length > 0,
    ).length
    const percentBagged =
      fellLocations.length > 0
        ? Math.round((fellsBagged / fellLocations.length) * 100)
        : 0

    let percentBaggedText = `${percentBagged}%`
    if (percentBagged === 0 && fellsBagged > 0) {
      percentBaggedText = "<1%"
    } else if (percentBagged === 100 && fellsBagged < fellLocations.length) {
      percentBaggedText = ">99%"
    }

    return {
      title: `${classification[0].name} (${percentBaggedText})`,
      subtitle: classification[0].description,
    }
  }

  if (!fellLocations || !classifications) {
    return (
      <View style={styles.container}>
        <Loading />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      {fellLocations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No fells found for this classification
          </Text>
        </View>
      ) : (
        <FellMap data={fellLocations} />
      )}

      {/* Floating Classification Picker Bar */}
      <View
        style={[styles.pickerContainer, { minHeight: pickerContentHeight }]}>
        <View
          style={styles.pickerTextWrap}
          pointerEvents='none'
          onLayout={(e) => {
            const measuredHeight = e.nativeEvent.layout.height
            setPickerContentHeight(Math.max(64, measuredHeight + 16))
          }}>
          <Text style={styles.pickerText}>
            {getClassificationText(selectedClassification).title}
          </Text>
          <Text style={styles.pickerTextSub}>
            {getClassificationText(selectedClassification).subtitle}
          </Text>
        </View>

        <Picker
          selectedValue={selectedClassification}
          onValueChange={(value) => setSelectedClassification(value)}
          style={[styles.picker, { height: pickerContentHeight }]}
          dropdownIconColor={COLOURS.text}>
          <Picker.Item label='All bagged fells' value={-1} />
          {classifications.map((classification) => (
            <Picker.Item
              key={classification.id}
              label={classification.name}
              value={classification.id}
            />
          ))}
        </Picker>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOURS.background || "#F3F4F6",
  },
  emptyText: {
    fontSize: 16,
    color: COLOURS.text,
  },
  pickerContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: COLOURS.card || "#FFFFFF",
    borderRadius: 12,
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  pickerTextWrap: {
    position: "absolute",
    left: 15,
    right: 35,
    top: 8,
  },
  pickerText: {
    color: COLOURS.text,
    fontSize: 16,
    fontWeight: "600",
  },
  pickerTextSub: {
    color: COLOURS.text,
    fontSize: 11,
    marginTop: 2,
    opacity: 0.7,
  },
  picker: {
    color: "transparent",
    backgroundColor: "transparent",
  },
})
