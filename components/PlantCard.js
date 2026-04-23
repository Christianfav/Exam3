import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGarden } from "../context/GardenContext";
import { PLANT_CATEGORIES, HEALTH_LEVELS } from "../constants/plantDefaults";
import HealthBadge from "./HealthBadge";

export default function PlantCard({ plant, onPress, onWater }) {
  const { getLastCare, isOverwateringRisk } = useGarden();

  const category = PLANT_CATEGORIES.find(c => c.value === plant.category) || PLANT_CATEGORIES[7];
  const lastWater = getLastCare(plant.id, "water");
  const overRisk  = isOverwateringRisk(plant);

  const hoursSinceWater = lastWater
    ? Math.round((Date.now() - new Date(lastWater.date)) / 36e5)
    : null;

  const needsWater = !lastWater || hoursSinceWater >= (plant.wateringIntervalDays || 3) * 24;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Category color bar */}
      <View style={[styles.colorBar, { backgroundColor: category.color }]} />

      <View style={styles.body}>
        {/* Photo or emoji placeholder */}
        {plant.photoUri ? (
          <Image source={{ uri: plant.photoUri }} style={styles.photo} />
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: category.color + "22" }]}>
            <Text style={styles.categoryEmoji}>{category.label.split(" ")[0]}</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{plant.name}</Text>
          <Text style={styles.species} numberOfLines={1}>{plant.species || category.label}</Text>

          <View style={styles.row}>
            <HealthBadge health={plant.health || "good"} />
          </View>

          {/* Water status */}
          {overRisk ? (
            <View style={styles.alertRow}>
              <Ionicons name="warning" size={12} color="#EF4444" />
              <Text style={styles.alertText}>Overwatering risk!</Text>
            </View>
          ) : needsWater ? (
            <View style={styles.alertRow}>
              <Ionicons name="water" size={12} color="#3B82F6" />
              <Text style={[styles.alertText, { color: "#3B82F6" }]}>Needs water</Text>
            </View>
          ) : (
            <View style={styles.alertRow}>
              <Ionicons name="checkmark-circle" size={12} color="#22C55E" />
              <Text style={[styles.alertText, { color: "#22C55E" }]}>
                Watered {hoursSinceWater}h ago
              </Text>
            </View>
          )}
        </View>

        {/* Quick water button */}
        <TouchableOpacity
          style={[styles.waterBtn, overRisk && styles.waterBtnDisabled]}
          onPress={onWater}
          disabled={overRisk}
        >
          <Ionicons name="water" size={20} color={overRisk ? "#3b4b57" : "#3B82F6"} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#272f29",
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: "hidden",
  },
  colorBar: { width: 5 },
  body: { flex: 1, flexDirection: "row", padding: 12, alignItems: "center" },
  photo: { width: 56, height: 56, borderRadius: 10, marginRight: 12 },
  photoPlaceholder: {
    width: 56, height: 56, borderRadius: 10, marginRight: 12,
    alignItems: "center", justifyContent: "center",
  },
  categoryEmoji: { fontSize: 26 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: "#ffffff", marginBottom: 1 },
  species: { fontSize: 12, color: "#c9ced8", marginBottom: 5 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  alertRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  alertText: { fontSize: 11, color: "#EF4444", fontWeight: "600" },
  waterBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center",
    marginLeft: 8,
  },
  waterBtnDisabled: { backgroundColor: "#7bceea" },
});