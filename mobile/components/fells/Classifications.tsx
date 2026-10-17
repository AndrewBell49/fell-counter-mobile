import { Text } from "@/components/utils/Text"
import { COLOURS } from "@/constants/colours"
import { IGetFellInfo } from "@/services/db/types"
import React, { useState } from "react"
import { Modal, Pressable, StyleSheet, View } from "react-native"

type ClassificationItem = IGetFellInfo["classifications"][number]

export default function Classifications({
  fellInfo,
}: {
  fellInfo: IGetFellInfo
}) {
  const [selectedClassification, setSelectedClassification] =
    useState<ClassificationItem | null>(null)

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Classifications</Text>
      {fellInfo.classifications && fellInfo.classifications.length > 0 ? (
        <View style={styles.badgeContainer}>
          {fellInfo.classifications.map((classification, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.badge,
                pressed && styles.badgePressed,
              ]}
              onPress={() => setSelectedClassification(classification)}>
              <Text style={styles.badgeText}>{classification.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No classifications</Text>
      )}

      {/* Description Popup Modal */}
      <Modal
        visible={selectedClassification !== null}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setSelectedClassification(null)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedClassification(null)}>
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>
              {selectedClassification?.name}
            </Text>
            <Text style={styles.modalDescription}>
              {selectedClassification?.description}
            </Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => setSelectedClassification(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: COLOURS.textLight,
    fontStyle: "italic",
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    backgroundColor: COLOURS.card,
    borderColor: COLOURS.border,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgePressed: {
    opacity: 0.7,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLOURS.primary,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLOURS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLOURS.border,
    shadowColor: COLOURS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 15,
    color: COLOURS.text,
    lineHeight: 22,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: COLOURS.cardSecondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  closeButtonText: {
    color: COLOURS.text,
    fontWeight: "600",
    fontSize: 14,
  },
})
