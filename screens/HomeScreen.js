import React, { useState, useEffect } from "react";
import {
  SafeAreaView, ScrollView, View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGarden } from "../context/GardenContext";
import { getDailySummary } from "../utils/openaiClient";
import PlantCard from "../components/PlantCard";
import WaterAlertModal from "../components/WaterAlertModal";

export default function HomeScreen({ navigation }) {
  const { plants, getPlantsNeedingCare, logCareTask, isOverwateringRisk } = useGarden();

  const [summary, setSummary]       = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alertPlant, setAlertPlant] = useState(null);

  const needingCare = getPlantsNeedingCare();

  async function loadSummary() {
    setSummaryLoading(true);
    try {
      const text = await getDailySummary(needingCare);
      setSummary(text);
    } catch {
      setSummary("🌿 Check on your garden today!");
    } finally {
      setSummaryLoading(false);
    }
  }

  useEffect(() => { loadSummary(); }, [plants.length]);

  function handleWater(plant) {
    if (isOverwateringRisk(plant)) {
      setAlertPlant(plant);
    } else {
      logCareTask(plant.id, "water");
    }
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadSummary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning! 🌱</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate("My Garden")}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBox label="Total Plants" value={plants.length} icon="leaf" color="#4A7C59" />
          <StatBox label="Need Water"   value={needingCare.length} icon="water" color="#3B82F6" />
          <StatBox label="All Good"     value={plants.length - needingCare.length} icon="checkmark-circle" color="#22C55E" />
        </View>

        {/* Daily AI Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="sunny" size={18} color="#F59E0B" />
            <Text style={styles.summaryTitle}>Today's Garden Check</Text>
          </View>
          {summaryLoading ? (
            <ActivityIndicator color="#4A7C59" style={{ marginVertical: 8 }} />
          ) : (
            <Text style={styles.summaryText}>{summary}</Text>
          )}
          <TouchableOpacity style={styles.refreshBtn} onPress={loadSummary}>
            <Ionicons name="refresh" size={14} color="#4A7C59" />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Plants needing care */}
        {needingCare.length > 0 && (
          <>
            <SectionTitle icon="water" color="#3B82F6" title={`Needs Water (${needingCare.length})`} />
            {needingCare.map(plant => (
              <PlantCard
                key={plant.id}
                plant={plant}
                onPress={() => {}}
                onWater={() => handleWater(plant)}
              />
            ))}
          </>
        )}

        {/* All plants */}
        <SectionTitle icon="leaf" color="#cde0d3" title={`All Plants (${plants.length})`} />
        {plants.length === 0 ? (
          <EmptyState navigation={navigation} />
        ) : (
          plants.map(plant => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onPress={() => {}}
              onWater={() => handleWater(plant)}
            />
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

function StatBox({ label, value, icon, color }) {
  return (
    <View style={[styles.statBox, { borderTopColor: color }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({ icon, color, title }) {
  return (
    <View style={styles.sectionRow}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function EmptyState({ navigation }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🌱</Text>
      <Text style={styles.emptyTitle}>Your garden is empty</Text>
      <Text style={styles.emptyText}>Add your first plant to get started!</Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => navigation.navigate("My Garden")}
      >
        <Text style={styles.emptyBtnText}>Add a Plant</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#161615" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  greeting: { fontSize: 24, fontWeight: "800", color: "#d0d5db" },
  date: { fontSize: 13, color: "#c6c9ce", marginTop: 2 },
  addBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: "#4A7C59",
    alignItems: "center", justifyContent: "center",
  },
  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginVertical: 12 },
  statBox: {
    flex: 1, backgroundColor: "#262424", borderRadius: 12, padding: 12,
    alignItems: "center", borderTopWidth: 3,
    shadowColor: "#dbe6db", shadowOpacity: 0.02, shadowRadius: 6, elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: "800", marginTop: 4 },
  statLabel: { fontSize: 10, color: "#dae0ea", marginTop: 2, textAlign: "center" },
  summaryCard: {
    backgroundColor: "#262424", marginHorizontal: 16, borderRadius: 16,
    padding: 16, marginBottom: 8,
    shadowColor: "#fdfbfb", shadowOpacity: 0.02, shadowRadius: 8, elevation: 2,
  },
  summaryHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  summaryTitle: { fontSize: 15, fontWeight: "700", color: "#d4d9df" },
  summaryText: { fontSize: 14, color: "#d4d9df", lineHeight: 21 },
  refreshBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 },
  refreshText: { fontSize: 12, color: "#7f9586", fontWeight: "600" },
  sectionRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, marginTop: 16, marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#d4d7dc" },
  empty: { alignItems: "center", paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  emptyText: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  emptyBtn: {
    marginTop: 16, backgroundColor: "#4A7C59",
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
  },
  emptyBtnText: { color: "#262424", fontWeight: "700", fontSize: 15 },
});