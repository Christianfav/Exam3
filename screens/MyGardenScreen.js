import React, { useState } from "react";
import {
  SafeAreaView, ScrollView, View, Text, TouchableOpacity,
  StyleSheet, Alert, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGarden } from "../context/GardenContext";
import PlantCard from "../components/PlantCard";
import WaterAlertModal from "../components/WaterAlertModal";
import AddPlantScreen from "./AddPlantScreen";

export default function MyGardenScreen() {
  const { plants, logCareTask, deletePlant, isOverwateringRisk } = useGarden();
  const [search, setSearch]         = useState("");
  const [showAdd, setShowAdd]       = useState(false);
  const [alertPlant, setAlertPlant] = useState(null);

  const filtered = plants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.species || "").toLowerCase().includes(search.toLowerCase())
  );

  function handleWater(plant) {
    if (isOverwateringRisk(plant)) {
      setAlertPlant(plant);
    } else {
      logCareTask(plant.id, "water");
    }
  }

  function handleDelete(plant) {
    Alert.alert("Remove Plant", `Remove ${plant.name} from your garden?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => deletePlant(plant.id) },
    ]);
  }

  if (showAdd) {
    return <AddPlantScreen onDone={() => setShowAdd(false)} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Garden 🌿</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.addText}>Add Plant</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search plants..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9CA3AF"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>
              {plants.length === 0 ? "No plants yet" : "No results found"}
            </Text>
            {plants.length === 0 && (
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAdd(true)}>
                <Text style={styles.emptyBtnText}>Add Your First Plant</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filtered.map(plant => (
            <View key={plant.id}>
              <PlantCard
                plant={plant}
                onPress={() => {}}
                onWater={() => handleWater(plant)}
              />
              {/* Swipe-like delete hint */}
              <TouchableOpacity
                style={styles.deleteHint}
                onPress={() => handleDelete(plant)}
              >
                <Ionicons name="trash-outline" size={12} color="#9CA3AF" />
                <Text style={styles.deleteHintText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      <WaterAlertModal
        visible={!!alertPlant}
        plant={alertPlant}
        onClose={() => setAlertPlant(null)}
        onForceWater={() => {
          if (alertPlant) logCareTask(alertPlant.id, "water");
          setAlertPlant(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#161615" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  title: { fontSize: 24, fontWeight: "800", color: "rgb(225, 228, 232)" },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#4A7C59", paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 12,
  },
  addText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  searchRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#201f1f", borderRadius: 12, marginHorizontal: 16,
    marginBottom: 8, paddingHorizontal: 12, paddingVertical: 8,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#1F2937" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937", marginTop: 12 },
  emptyBtn: {
    marginTop: 16, backgroundColor: "#4A7C59",
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  deleteHint: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-end", paddingRight: 24, marginBottom: 4,
  },
  deleteHintText: { fontSize: 11, color: "#b5bdc9" },
});