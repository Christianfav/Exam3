import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { HEALTH_LEVELS } from "../constants/plantDefaults";

export default function HealthBadge({ health }) {
  const level = HEALTH_LEVELS.find(h => h.value === health) || HEALTH_LEVELS[1];
  return (
    <View style={[styles.badge, { backgroundColor: level.color + "22" }]}>
      <View style={[styles.dot, { backgroundColor: level.color }]} />
      <Text style={[styles.label, { color: level.color }]}>{level.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, alignSelf: "flex-start",
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  label: { fontSize: 11, fontWeight: "600" },
});