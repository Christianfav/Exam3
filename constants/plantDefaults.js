export const PLANT_CATEGORIES = [
  { label: "🍅 Vegetables", value: "vegetable", color: "#E76F51" },
  { label: "🌸 Flowers",    value: "flower",    color: "#E9C46A" },
  { label: "🌿 Herbs",      value: "herb",      color: "#2A9D8F" },
  { label: "🌵 Succulents", value: "succulent", color: "#8AB17D" },
  { label: "🌳 Trees",      value: "tree",      color: "#264653" },
  { label: "🪴 Houseplants",value: "houseplant",color: "#457B9D" },
  { label: "🫐 Fruits",     value: "fruit",     color: "#9B5DE5" },
  { label: "Other",         value: "other",     color: "#6B7280" },
];

export const DEFAULT_CARE = {
  vegetable:  { wateringIntervalDays: 2, fertilizeIntervalDays: 14 },
  flower:     { wateringIntervalDays: 3, fertilizeIntervalDays: 21 },
  herb:       { wateringIntervalDays: 3, fertilizeIntervalDays: 30 },
  succulent:  { wateringIntervalDays: 10, fertilizeIntervalDays: 60 },
  tree:       { wateringIntervalDays: 7, fertilizeIntervalDays: 30 },
  houseplant: { wateringIntervalDays: 5, fertilizeIntervalDays: 30 },
  fruit:      { wateringIntervalDays: 3, fertilizeIntervalDays: 14 },
  other:      { wateringIntervalDays: 5, fertilizeIntervalDays: 21 },
};

export const HEALTH_LEVELS = [
  { label: "Thriving 🌟", value: "thriving", color: "#22C55E" },
  { label: "Good 👍",     value: "good",     color: "#84CC16" },
  { label: "Fair ⚠️",     value: "fair",     color: "#F59E0B" },
  { label: "Struggling 🚨", value: "struggling", color: "#EF4444" },
];

export const GARDEN_ZONES = [
  "Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5",
  "Zone 6", "Zone 7", "Zone 8", "Zone 9", "Zone 10",
  "Zone 11", "Zone 12", "Tropical", "Subtropical",
];