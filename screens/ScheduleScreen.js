import React, { useState } from "react";
import {
  SafeAreaView, ScrollView, View, Text, TouchableOpacity,
  StyleSheet, TextInput, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGarden } from "../context/GardenContext";
import { PLANT_CATEGORIES } from "../constants/plantDefaults";
import WaterAlertModal from "../components/WaterAlertModal";

const TASK_TYPES = [
  { type: "water",     label: "Watered",     icon: "water",         color: "#3B82F6" },
  { type: "fertilize", label: "Fertilized",  icon: "flask",         color: "#10B981" },
  { type: "prune",     label: "Pruned",       icon: "cut",           color: "#F59E0B" },
  { type: "repot",     label: "Repotted",     icon: "earth",         color: "#8B5CF6" },
  { type: "note",      label: "Note",         icon: "document-text", color: "#6B7280" },
];

export default function ScheduleScreen() {
  const { plants, careLogs, logCareTask, isOverwateringRisk } = useGarden();
  const [logModal, setLogModal]     = useState(null); // { plant }
  const [taskType, setTaskType]     = useState("water");
  const [note, setNote]             = useState("");
  const [alertPlant, setAlertPlant] = useState(null);
  const [viewTab, setViewTab]       = useState("upcoming"); // "upcoming" | "history"

  function openLog(plant) {
    setTaskType("water");
    setNote("");
    setLogModal({ plant });
  }

  function submitLog() {
    if (!logModal) return;
    if (taskType === "water" && isOverwateringRisk(logModal.plant)) {
      setAlertPlant(logModal.plant);
      setLogModal(null);
      return;
    }
    logCareTask(logModal.plant.id, taskType, note);
    setLogModal(null);
  }

  // Build upcoming tasks
  const upcoming = plants.map(plant => {
    const cat = PLANT_CATEGORIES.find(c => c.value === plant.category);
    const waterLogs = (careLogs[plant.id] || []).filter(l => l.type === "water");
    const lastWater = waterLogs[0];
    let dueIn = null;
    if (lastWater) {
      const hoursSince = (Date.now() - new Date(lastWater.date)) / 36e5;
      const hoursUntilDue = (plant.wateringIntervalDays || 3) * 24 - hoursSince;
      dueIn = Math.round(hoursUntilDue / 24 * 10) / 10;
    }
    return { plant, cat, dueIn, lastWater };
  }).sort((a, b) => (a.dueIn ?? -1) - (b.dueIn ?? -1));

  // Build history
  const history = [];
  for (const plant of plants) {
    for (const log of (careLogs[plant.id] || [])) {
      history.push({ plant, log });
    }
  }
  history.sort((a, b) => new Date(b.log.date) - new Date(a.log.date));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Care Schedule 📅</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {["upcoming", "history"].map(tab => (
          <TouchableOpacity
            key={tab} style={[styles.tab, viewTab === tab && styles.tabActive]}
            onPress={() => setViewTab(tab)}
          >
            <Text style={[styles.tabText, viewTab === tab && styles.tabTextActive]}>
              {tab === "upcoming" ? "Upcoming Tasks" : "Care History"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {viewTab === "upcoming" ? (
          upcoming.length === 0 ? (
            <EmptyMsg text="Add plants to see their care schedule." />
          ) : (
            upcoming.map(({ plant, cat, dueIn, lastWater }) => (
              <View key={plant.id} style={styles.taskCard}>
                <View style={[styles.taskColorBar, { backgroundColor: cat?.color || "#4A7C59" }]} />
                <View style={styles.taskBody}>
                  <Text style={styles.taskName}>{cat?.label.split(" ")[0]} {plant.name}</Text>
                  <View style={styles.taskRow}>
                    <Ionicons name="water" size={13} color="#3B82F6" />
                    <Text style={styles.taskDetail}>
                      {dueIn === null
                        ? "Not watered yet — water now!"
                        : dueIn <= 0
                        ? "Needs water now"
                        : `Water in ${dueIn.toFixed(1)} days`}
                    </Text>
                  </View>
                  {lastWater && (
                    <Text style={styles.lastCare}>
                      Last watered: {new Date(lastWater.date).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <TouchableOpacity style={styles.logBtn} onPress={() => openLog(plant)}>
                  <Ionicons name="add-circle" size={18} color="#4A7C59" />
                  <Text style={styles.logBtnText}>Log</Text>
                </TouchableOpacity>
              </View>
            ))
          )
        ) : (
          history.length === 0 ? (
            <EmptyMsg text="No care tasks logged yet." />
          ) : (
            history.map(({ plant, log }, i) => {
              const taskMeta = TASK_TYPES.find(t => t.type === log.type) || TASK_TYPES[4];
              return (
                <View key={i} style={styles.historyItem}>
                  <View style={[styles.historyDot, { backgroundColor: taskMeta.color }]} />
                  <View style={styles.historyBody}>
                    <Text style={styles.historyTitle}>
                      {taskMeta.label} — {plant.name}
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(log.date).toLocaleString()}
                    </Text>
                    {log.note ? <Text style={styles.historyNote}>"{log.note}"</Text> : null}
                  </View>
                  <Ionicons name={taskMeta.icon} size={18} color={taskMeta.color} />
                </View>
              );
            })
          )
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Log Modal */}
      <Modal visible={!!logModal} transparent animationType="slide" onRequestClose={() => setLogModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>
              Log Care for {logModal?.plant?.name}
            </Text>
            <Text style={styles.modalSubtitle}>What did you do?</Text>
            <View style={styles.taskTypeRow}>
              {TASK_TYPES.map(t => (
                <TouchableOpacity
                  key={t.type}
                  style={[styles.taskTypeBtn, taskType === t.type && { backgroundColor: t.color }]}
                  onPress={() => setTaskType(t.type)}
                >
                  <Ionicons name={t.icon} size={18} color={taskType === t.type ? "#fff" : t.color} />
                  <Text style={[styles.taskTypeTxt, taskType === t.type && { color: "#fff" }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalSubtitle}>Notes (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="e.g. Added fertilizer, noticed new growth..."
              placeholderTextColor="#9CA3AF"
              value={note}
              onChangeText={setNote}
              multiline
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setLogModal(null)}>
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitLog}>
                <Text style={styles.submitText}>Log Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <WaterAlertModal
        visible={!!alertPlant}
        plant={alertPlant}
        onClose={() => setAlertPlant(null)}
        onForceWater={() => {
          if (alertPlant) logCareTask(alertPlant.id, "water", note);
          setAlertPlant(null);
        }}
      />
    </SafeAreaView>
  );
}

function EmptyMsg({ text }) {
  return (
    <View style={{ alignItems: "center", paddingTop: 60 }}>
      <Text style={{ fontSize: 40 }}>📋</Text>
      <Text style={{ color: "#6B7280", marginTop: 12, fontSize: 14 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#161615" },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: "800", color: "#d7dde5" },
  tabs: { flexDirection: "row", marginHorizontal: 16, marginBottom: 8, backgroundColor: "#E5E7EB", borderRadius: 12, padding: 3 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  tabActive: { backgroundColor: "#cfdbd2", shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: "600", color: "#222325" },
  tabTextActive: { color: "#1F2937" },
  taskCard: {
    flexDirection: "row", backgroundColor: "#262424", borderRadius: 14,
    marginHorizontal: 16, marginVertical: 5, overflow: "hidden",
    shadowColor: "#ffffff", shadowOpacity: 0.10, shadowRadius: 6, elevation: 2,
  },
  taskColorBar: { width: 5 },
  taskBody: { flex: 1, padding: 12 },
  taskName: { fontSize: 15, fontWeight: "700", color: "#d8dde4", marginBottom: 4 },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  taskDetail: { fontSize: 13, color: "#a2acba" },
  lastCare: { fontSize: 11, color: "#9CA3AF", marginTop: 4 },
  logBtn: { padding: 14, alignItems: "center", justifyContent: "center", gap: 3 },
  logBtnText: { fontSize: 11, color: "#4A7C59", fontWeight: "600" },
  historyItem: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#262424",
    borderRadius: 12, marginHorizontal: 16, marginVertical: 4, padding: 12,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  historyDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  historyBody: { flex: 1 },
  historyTitle: { fontSize: 14, fontWeight: "600", color: "#d9dde3" },
  historyDate: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  historyNote: { fontSize: 12, color: "#6B7280", fontStyle: "italic", marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1F2937", marginBottom: 4 },
  modalSubtitle: { fontSize: 13, fontWeight: "600", color: "#6B7280", marginTop: 14, marginBottom: 8 },
  taskTypeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  taskTypeBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  taskTypeTxt: { fontSize: 13, fontWeight: "600", color: "#4B5563" },
  noteInput: {
    backgroundColor: "#F9FAF7", borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB",
    padding: 12, fontSize: 13, color: "#1F2937", height: 80, textAlignVertical: "top",
  },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 16 },
  cancelModalBtn: {
    flex: 1, borderWidth: 1.5, borderColor: "#E5E7EB",
    borderRadius: 12, padding: 13, alignItems: "center",
  },
  cancelModalText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  submitBtn: { flex: 1, backgroundColor: "#4A7C59", borderRadius: 12, padding: 13, alignItems: "center" },
  submitText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});