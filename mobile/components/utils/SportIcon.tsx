import { COLOURS } from "@/constants/colours"
import { FontAwesome5 } from "@expo/vector-icons"
import React from "react"

interface SportIconProps {
  sport?: string
  size?: number
  color?: string
}

export default function SportIcon({
  sport,
  size = 16,
  color = COLOURS.primary,
}: SportIconProps) {
  switch (sport) {
    case "Run":
    case "VirtualRun":
      return <FontAwesome5 name='running' size={size} color={color} />

    case "Walk":
      return <FontAwesome5 name='walking' size={size} color={color} />

    case "Hike":
      return <FontAwesome5 name='hiking' size={size} color={color} />

    case "Ride":
    case "EBikeRide":
      return <FontAwesome5 name='biking' size={size} color={color} />

    case "AlpineSki":
      return <FontAwesome5 name='skiing' size={size} color={color} />

    case "Snowboard":
      return <FontAwesome5 name='snowboarding' size={size} color={color} />

    case "Swim":
      return <FontAwesome5 name='swimmer' size={size} color={color} />

    case "RockClimbing":
      return <FontAwesome5 name='mountain' size={size} color={color} />

    case "Kayaking":
    case "Canoeing":
    case "StandUpPaddling":
      return <FontAwesome5 name='water' size={size} color={color} />

    default:
      return <FontAwesome5 name='heartbeat' size={size} color={color} />
  }
}
