import OpenAI from "openai";
import { OPENAI_API_KEY } from "@env";

const client = new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true });

const SYSTEM_PROMPT = `You are GardenBot, an expert horticultural AI assistant for home gardeners.
You help with:
- Plant identification from photos
- Diagnosing plant problems (yellowing leaves, pests, disease)
- Personalized care plans (watering, fertilizing, pruning schedules)
- Seasonal gardening advice
- Overwatering and root rot prevention

Keep answers friendly, practical, and concise. Use simple language suitable for beginners.
When diagnosing problems, list: 1) Most likely cause, 2) What to do now, 3) How to prevent it.
When creating care plans, always include: watering frequency, light needs, fertilizer schedule, and common mistakes.`;

/**
 * Ask a plain text plant care question.
 * @param {string} userMessage
 * @param {Array}  history  - [{role, content}] previous messages
 */
export async function askPlantQuestion(userMessage, history = []) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userMessage },
  ];

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 600,
  });

  return response.choices[0].message.content;
}

/**
 * Identify a plant from a base64 image and get a care plan.
 * @param {string} base64Image  - base64-encoded JPEG/PNG
 */
export async function identifyPlantFromPhoto(base64Image) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
          {
            type: "text",
            text: `Please identify this plant and provide:
1. Plant name (common and scientific)
2. Brief description
3. Care plan:
   - Watering: how often (in days)?
   - Light requirements
   - Fertilizing schedule
   - Common problems to watch for
4. Recommended watering interval in days (just the number at the end, e.g. "WATERING_DAYS: 7")`,
          },
        ],
      },
    ],
    max_tokens: 700,
  });

  const text = response.choices[0].message.content;

  // Parse out the watering interval if the model included it
  const match = text.match(/WATERING_DAYS:\s*(\d+)/i);
  const wateringIntervalDays = match ? parseInt(match[1]) : 7;

  return { text: text.replace(/WATERING_DAYS:\s*\d+/i, "").trim(), wateringIntervalDays };
}

/**
 * Get a daily garden summary based on plant list.
 * @param {Array} plantsNeedingCare
 */
export async function getDailySummary(plantsNeedingCare) {
  if (plantsNeedingCare.length === 0) {
    return "🌿 All your plants are well cared for today! Nothing needs attention right now.";
  }

  const names = plantsNeedingCare.map(p => p.name).join(", ");
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `My garden daily check: these plants need watering today: ${names}. 
Give me a friendly, encouraging 2-3 sentence summary with any quick tips.`,
      },
    ],
    max_tokens: 200,
  });

  return response.choices[0].message.content;
}