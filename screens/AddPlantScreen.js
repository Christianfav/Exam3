import React, { useState } from "react";
import {
  SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useGarden } from "../context/GardenContext";
import { identifyPlantFromPhoto } from "../utils/openaiClient";
import { PLANT_CATEGORIES, DEFAULT_CARE, HEALTH_LEVELS } from "../constants/plantDefaults";

export default function AddPlantScreen({ onDone }) {
  const { addPlant } = useGarden();
  const [name, setName]           = useState("");
  const [species, setSpecies]     = useState("");
  const [category, setCategory]   = useState("houseplant");
  const [health, setHealth]       = useState("good");
  const [location, setLocation]   = useState("");
  const [photoUri, setPhotoUri]   = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [waterDays, setWaterDays] = useState(null);
  const [identifying, setIdentifying] = useState(false);
  const [saving, setSaving]       = useState(false);

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission needed", "Allow photo access to identify plants."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7, base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      await identifyFromPhoto(result.assets[0].base64);
    }
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission needed", "Allow camera access to take plant photos."); return; }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7, base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      await identifyFromPhoto(result.assets[0].base64);
    }
  }

  async function identifyFromPhoto(base64) {
    setIdentifying(true);
    setAiAnalysis("");
    try {
      const { text, wateringIntervalDays } = await identifyPlantFromPhoto(base64);
      setAiAnalysis(text);
      setWaterDays(wateringIntervalDays);
      // Try to auto-fill name from AI response
      const nameMatch = text.match(/(?:plant name|common name|it(?:'s| is) (?:a |an )?)[:\s]*([A-Z][a-zA-Z\s]+)/);
      if (nameMatch && !name) setName(nameMatch[1].trim().split("\n")[0]);
    } catch (e) {
      setAiAnalysis("Could not identify plant. Fill in details manually.");
    } finally {
      setIdentifying(false);
    }
  }

  function handleSave() {
    if (!name.trim()) { Alert.alert("Name required", "Please enter a plant name."); return; }
    setSaving(true);
    const defaults = DEFAULT_CARE[category] || DEFAULT_CARE.other;
    addPlant({
      name: name.trim(),
      species: species.trim(),
      category,
      health,
      location: location.trim(),
      photoUri,
      wateringIntervalDays: waterDays || defaults.wateringIntervalDays,
      fertilizeIntervalDays: defaults.fertilizeIntervalDays,
      plantedDate: new Date().toISOString(),
      aiCarePlan: aiAnalysis,
    });
    setSaving(false);
    onDone();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onDone}>
          <Ionicons name="arrow-back" size={24} color="#cbcfd6" />
        </TouchableOpacity>
        <Text style={styles.title}>Add a Plant</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Photo section */}
        <View style={styles.photoSection}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera" size={36} color="#bfc4cd" />
              <Text style={styles.photoPlaceholderText}>Add a photo to identify your plant</Text>
            </View>
          )}
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
              <Ionicons name="camera" size={16} color="#4A7C59" />
              <Text style={styles.photoBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
              <Ionicons name="images" size={16} color="#4A7C59" />
              <Text style={styles.photoBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Analysis */}
        {identifying && (
          <View style={styles.aiBox}>
            <ActivityIndicator color="#4A7C59" />
            <Text style={styles.aiLoading}>AI is identifying your plant…</Text>
          </View>
        )}
        {aiAnalysis !== "" && !identifying && (
          <View style={styles.aiBox}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={16} color="#7C3AED" />
              <Text style={styles.aiTitle}>AI Plant Identification</Text>
            </View>
            <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
              <Text style={styles.aiText}>{aiAnalysis}</Text>
            </ScrollView>
            {waterDays && (
              <Text style={styles.aiWater}>💧 Suggested watering: every {waterDays} days</Text>
            )}
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <Label text="Plant Name *" />
          <TextInput
            style={styles.input} placeholder="e.g. My Tomato Plant"
            value={name} onChangeText={setName} placeholderTextColor="#d2d8e2"
          />

          <Label text="Species / Variety" />
          <TextInput
            style={styles.input} placeholder="e.g. Solanum lycopersicum"
            value={species} onChangeText={setSpecies} placeholderTextColor="#d2d8e2"
          />

          <Label text="Location" />
          <TextInput
            style={styles.input} placeholder="e.g. South-facing windowsill"
            value={location} onChangeText={setLocation} placeholderTextColor="#d2d8e2"
          />

          <Label text="Category" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {PLANT_CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.value}
                style={[styles.chip, category === c.value && { backgroundColor: c.color }]}
                onPress={() => setCategory(c.value)}
              >
                <Text style={[styles.chipText, category === c.value && styles.chipTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Label text="Current Health" />
          <View style={styles.healthRow}>
            {HEALTH_LEVELS.map(h => (
              <TouchableOpacity
                key={h.value}
                style={[styles.healthChip, health === h.value && { backgroundColor: h.color + "33", borderColor: h.color }]}
                onPress={() => setHealth(h.value)}
              >
                <Text style={[styles.healthText, health === h.value && { color: h.color }]}>
                  {h.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Label text={`Watering Interval (days): ${waterDays || DEFAULT_CARE[category]?.wateringIntervalDays || 5}`} />
          <View style={styles.sliderRow}>
            {[1, 2, 3, 5, 7, 10, 14, 21].map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.dayChip, (waterDays || DEFAULT_CARE[category]?.wateringIntervalDays) === d && styles.dayChipActive]}
                onPress={() => setWaterDays(d)}
              >
                <Text style={[(waterDays || DEFAULT_CARE[category]?.wateringIntervalDays) === d ? styles.dayChipTextActive : styles.dayChipText]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Label({ text }) {
  return <Text style={{ fontSize: 13, fontWeight: "600", color: "#ffffff", marginBottom: 6, marginTop: 14 }}>{text}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#262424" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
  },
  title: { fontSize: 18, fontWeight: "800", color: "#f3f8ff" },
  saveBtn: { backgroundColor: "#4A7C59", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  photoSection: { alignItems: "center", paddingVertical: 16 },
  photo: { width: 140, height: 140, borderRadius: 16, marginBottom: 10 },
  photoPlaceholder: {
    width: 140, height: 140, borderRadius: 16, backgroundColor: "#202122",
    alignItems: "center", justifyContent: "center", borderWidth: 2,
    borderColor: "#93a495", borderStyle: "dashed", marginBottom: 10,
  },
  photoPlaceholderText: { fontSize: 11, color: "#cbcfd6", textAlign: "center", marginTop: 8, paddingHorizontal: 10 },
  photoButtons: { flexDirection: "row", gap: 12 },
  photoBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#4A7C59",
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
  },
  photoBtnText: { color: "#4A7C59", fontWeight: "600", fontSize: 13 },
  aiBox: {
    backgroundColor: "#F5F3FF", borderRadius: 14, marginHorizontal: 16,
    padding: 14, marginBottom: 4,
  },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  aiTitle: { fontSize: 14, fontWeight: "700", color: "#7C3AED" },
  aiLoading: { marginLeft: 10, color: "#4A7C59", fontStyle: "italic" },
  aiText: { fontSize: 13, color: "#4B5563", lineHeight: 20 },
  aiWater: { fontSize: 13, fontWeight: "600", color: "#3B82F6", marginTop: 8 },
  form: { paddingHorizontal: 16 },
  input: {
    backgroundColor: "#4a564a", borderRadius: 10, borderWidth: 1, borderColor: "#394539",
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: "#e3e8ef",
  },
  chipScroll: { flexDirection: "row" },
  chip: {
    borderWidth: 1, borderColor: "#394539", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7, marginRight: 8, backgroundColor: "#4a564a",
  },
  chipText: { fontSize: 12, color: "#ebedf1", fontWeight: "500" },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  healthRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  healthChip: {
    borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7, backgroundColor: "#4a564a",
  },
  healthText: { fontSize: 12, color: "#ebedf1", fontWeight: "500" },
  sliderRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dayChip: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: "#4a564a",
    alignItems: "center", justifyContent: "center",
  },
  dayChipActive: { backgroundColor: "#4A7C59" },
  dayChipText: { fontSize: 13, color: "#dfe4ed", fontWeight: "600" },
  dayChipTextActive: { fontSize: 13, color: "#fff", fontWeight: "700" },
});