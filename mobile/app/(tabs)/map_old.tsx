// import { Loading } from "@/components/utils/Loading"
// import { Text } from "@/components/utils/Text"
// import { COLOURS } from "@/constants/colours"
// import { useDatabase } from "@/hooks/useDatabase"
// import { Classification } from "@/services/db/sqlite/schema"
// import { IGetFellLocations } from "@/services/db/types"
// import { Picker } from "@react-native-picker/picker"
// import { useEffect, useRef, useState } from "react"
// import { StyleSheet, View } from "react-native"
// import ClusteredMapView from "react-native-map-clustering"
// import MapView, { Marker } from "react-native-maps"

// const formatDate = (timestamp: string | number) => {
//   const date = new Date(Number(timestamp))

//   return `${String(date.getDate()).padStart(2, "0")}/${String(
//     date.getMonth() + 1,
//   ).padStart(2, "0")}/${date.getFullYear()}`
// }

// export default function MapScreenOld() {
//   const database = useDatabase()
//   const [fellLocations, setFellLocations] = useState<
//     IGetFellLocations[] | null
//   >(null)
//   const [classifications, setClassifications] = useState<
//     Classification[] | null
//   >(null)
//   const [selectedClassification, setSelectedClassification] = useState(8)
//   const [mapReady, setMapReady] = useState(false)
//   const mapRef = useRef<MapView>(null)
//   const [pickerContentHeight, setPickerContentHeight] = useState(64)

//   useEffect(() => {
//     if (!database) return
//     database.getAllClassifications().then((data) => {
//       setClassifications(data)
//     })
//   }, [database])

//   useEffect(() => {
//     if (!database) return
//     database
//       .getBagLocationsByClassification(selectedClassification)
//       .then((data) => {
//         setFellLocations(data)
//       })
//   }, [selectedClassification])

//   useEffect(() => {
//     if (!mapReady || !fellLocations || fellLocations.length === 0) return

//     mapRef.current?.fitToCoordinates(
//       fellLocations.map((fell) => ({
//         latitude: fell.latitude,
//         longitude: fell.longitude,
//       })),
//       {
//         edgePadding: {
//           top: 100,
//           right: 50,
//           bottom: 50,
//           left: 50,
//         },
//         animated: false,
//       },
//     )
//   }, [mapReady, fellLocations])

//   if (!fellLocations || !classifications) {
//     return (
//       <View style={styles.container}>
//         <Loading />
//       </View>
//     )
//   }

//   if (fellLocations.length === 0) {
//     return (
//       <View style={styles.container}>
//         <Text>No fells found</Text>
//       </View>
//     )
//   }

//   const getClassificationText = (classificationId: number) => {
//     if (classificationId === -1) {
//       return {
//         title: "All bagged fells",
//         subtitle: "All of the fells in the world that you have climbed",
//       }
//     }
//     const classification = classifications.filter(
//       (c) => c.id === selectedClassification,
//     )
//     if (classification.length === 0) {
//       return {
//         title: `Error - no classification ID: ${classificationId}`,
//         subtitle: "",
//       }
//     }
//     const fellsBagged = fellLocations.filter(
//       (f) => f.bagDates.length > 0,
//     ).length
//     const percentBagged = Math.round((fellsBagged / fellLocations.length) * 100)
//     let percentBaggedText = `${percentBagged}%`
//     if (percentBagged === 0 && fellsBagged > 0) {
//       percentBaggedText = "<1%"
//     } else if (percentBagged === 100 && fellsBagged < fellLocations.length) {
//       percentBaggedText = ">99%"
//     }
//     return {
//       title: `${classification[0].name} (${percentBaggedText})`,
//       subtitle: classification[0].description,
//     }
//   }

//   return (
//     <View style={styles.container}>
//       <ClusteredMapView
//         style={styles.map}
//         ref={mapRef}
//         onMapReady={() => setMapReady(true)}
//         tracksViewChanges={true}
//         initialRegion={{
//           latitude: fellLocations[0].latitude,
//           longitude: fellLocations[0].longitude,
//           latitudeDelta: 5,
//           longitudeDelta: 5,
//         }}
//         radius={17} // pixel radius within which markers cluster
//         minPoints={2} // minimum markers to form a cluster
//         extent={512}
//         nodeSize={64}>
//         {fellLocations.map((fell) => {
//           let description = `${fell.elevation} m`

//           if (fell.bagDates.length === 1) {
//             description += ` Bagged once, on ${formatDate(fell.bagDates[0])}`
//           } else if (fell.bagDates.length === 2) {
//             description += ` Bagged twice, on ${formatDate(fell.bagDates[0])} and ${formatDate(fell.bagDates[1])}`
//           } else if (fell.bagDates.length >= 3) {
//             description += ` Bagged ${fell.bagDates.length} times, from ${formatDate(
//               fell.bagDates[0],
//             )} to ${formatDate(fell.bagDates[fell.bagDates.length - 1])}`
//           }

//           return (
//             <Marker
//               key={fell.id}
//               coordinate={{
//                 latitude: fell.latitude,
//                 longitude: fell.longitude,
//               }}
//               title={fell.name}
//               description={description}
//               image={
//                 fell.bagDates.length === 0
//                   ? require("@/assets/images/mountainRed.png")
//                   : require("@/assets/images/mountainGreen.png")
//               }
//             />
//           )
//         })}
//       </ClusteredMapView>
//       <View
//         style={[styles.pickerContainer, { minHeight: pickerContentHeight }]}>
//         <View
//           style={styles.pickerTextWrap}
//           pointerEvents='none'
//           onLayout={(e) => {
//             const measuredHeight = e.nativeEvent.layout.height
//             setPickerContentHeight(Math.max(64, measuredHeight + 16)) // 16 = top/bottom padding
//           }}>
//           <Text style={styles.pickerText}>
//             {getClassificationText(selectedClassification).title}
//           </Text>
//           <Text style={styles.pickerTextSub}>
//             {getClassificationText(selectedClassification).subtitle}
//           </Text>
//         </View>

//         <Picker
//           selectedValue={selectedClassification}
//           onValueChange={(value) => setSelectedClassification(value)}
//           style={[styles.picker, { height: pickerContentHeight }]}
//           dropdownIconColor={COLOURS.text}>
//           <Picker.Item label='All bagged fells' value={-1} />
//           {classifications.map((classification) => (
//             <Picker.Item
//               key={classification.id}
//               label={classification.name}
//               value={classification.id}
//             />
//           ))}
//         </Picker>
//       </View>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },

//   map: {
//     flex: 1,
//   },

//   pickerContainer: {
//     position: "absolute",
//     top: 40,
//     left: 20,
//     right: 20,
//     backgroundColor: COLOURS.card,
//     borderRadius: 10,
//     justifyContent: "center",
//   },

//   pickerTextWrap: {
//     position: "absolute",
//     left: 15,
//     right: 15,
//     top: 8,
//   },

//   pickerText: {
//     color: COLOURS.text,
//     fontSize: 16,
//   },

//   pickerTextSub: {
//     color: COLOURS.text,
//     fontSize: 10,
//     marginTop: 2,
//   },

//   picker: {
//     color: "transparent",
//     backgroundColor: "transparent",
//   },

//   pickerItem: {
//     color: COLOURS.text,
//     backgroundColor: COLOURS.card,
//   },
// })
