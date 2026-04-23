import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GardenContext = createContext(null);

export function GardenProvider({ children }) {
  const [plants, setPlants]   = useState([]);
  const [careLogs, setCareLogs] = useState({}); // plantId -> [{ type, date, note }]
  const [loaded, setLoaded]   = useState(false);

  // ── Load from storage on mount ──────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const p = await AsyncStorage.getItem("@garden_plants");
        const l = await AsyncStorage.getItem("@garden_logs");
        if (p) setPlants(JSON.parse(p));
        if (l) setCareLogs(JSON.parse(l));
      } catch (e) {
        console.error("Storage load error", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // ── Persist plants whenever they change ─────────────────
  useEffect(() => {
    if (loaded) AsyncStorage.setItem("@garden_plants", JSON.stringify(plants));
  }, [plants, loaded]);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem("@garden_logs", JSON.stringify(careLogs));
  }, [careLogs, loaded]);

  // ── Plant CRUD ───────────────────────────────────────────
  function addPlant(plant) {
    const newPlant = { ...plant, id: Date.now().toString() };
    setPlants(prev => [newPlant, ...prev]);
    return newPlant;
  }

  function updatePlant(id, updates) {
    setPlants(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }

  function deletePlant(id) {
    setPlants(prev => prev.filter(p => p.id !== id));
    setCareLogs(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  // ── Care log ─────────────────────────────────────────────
  function logCareTask(plantId, type, note = "") {
    const entry = { type, date: new Date().toISOString(), note };
    setCareLogs(prev => ({
      ...prev,
      [plantId]: [entry, ...(prev[plantId] || [])],
    }));
  }

  function getLastCare(plantId, type) {
    const logs = careLogs[plantId] || [];
    return logs.find(l => l.type === type) || null;
  }

  // ── Overwater check ──────────────────────────────────────
  function isOverwateringRisk(plant) {
    const last = getLastCare(plant.id, "water");
    if (!last) return false;
    const hoursSince = (Date.now() - new Date(last.date)) / 36e5;
    return hoursSince < (plant.wateringIntervalDays || 3) * 24;
  }

  // ── Daily summary ────────────────────────────────────────
  function getPlantsNeedingCare() {
    const now = Date.now();
    return plants.filter(plant => {
      const last = getLastCare(plant.id, "water");
      if (!last) return true;
      const hoursSince = (now - new Date(last.date)) / 36e5;
      return hoursSince >= (plant.wateringIntervalDays || 3) * 24;
    });
  }

  return (
    <GardenContext.Provider value={{
      plants, careLogs, loaded,
      addPlant, updatePlant, deletePlant,
      logCareTask, getLastCare,
      isOverwateringRisk, getPlantsNeedingCare,
    }}>
      {children}
    </GardenContext.Provider>
  );
}

export function useGarden() {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error("useGarden must be inside GardenProvider");
  return ctx;
}