import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WaterAlertModal({ visible, plant, onClose, onForceWater }) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Ionicons name="warning" size={40} color="#EF4444" style={styles.icon} />
          <Text style={styles.title}>Overwatering Risk!</Text>
          <Text style={styles.body}>
            <Text style={styles.bold}>{plant?.name}</Text> was already watered recently.
            {"\n\n"}Overwatering can cause <Text style={styles.bold}>root rot</Text>, which
            deprives roots of oxygen and can kill your plant. Most plants need to partially
            dry out between waterings.
          </Text>
          <Text style={styles.tip}>
            💡 Tip: Check the soil — if the top inch is still moist, wait before watering.
          </Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Skip Watering</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.forceBtn} onPress={onForceWater}>
              <Text style={styles.forceText}>Water Anyway</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
  },
  modal: {
    backgroundColor: "#fff", borderRadius: 20,
    padding: 24, margin: 20, alignItems: "center",
  },
  icon: { marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "800", color: "#1F2937", marginBottom: 12 },
  body: { fontSize: 14, color: "#4B5563", textAlign: "center", lineHeight: 22, marginBottom: 12 },
  bold: { fontWeight: "700", color: "#1F2937" },
  tip: {
    fontSize: 13, color: "#059669", backgroundColor: "#ECFDF5",
    padding: 12, borderRadius: 10, textAlign: "center", marginBottom: 20,
  },
  buttons: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: "#D1D5DB",
    borderRadius: 12, padding: 12, alignItems: "center",
  },
  cancelText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  forceBtn: {
    flex: 1, backgroundColor: "#EF4444",
    borderRadius: 12, padding: 12, alignItems: "center",
  },
  forceText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});