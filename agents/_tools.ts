/**
 * Agent Tools — private module (starts with _), not mapped as a route.
 *
 * All tool definitions live here. Each tool's `execute` body is the only
 * thing you need to change when swapping mock data for a real implementation
 * (e.g. calling a weather API, a translation service, etc.).
 */

import { tool } from '@openai/agents';
import { z } from 'zod';

// ========== Tool: Get Weather ==========
const getWeather = tool({
  name: 'get_weather',
  description:
    'Fetch the current weather for one specific city. ' +
    'This tool ONLY returns weather data — it does NOT give clothing advice. ' +
    'When the user asks "what should I wear in <city>", call this tool first to get the ' +
    'weather, then call `get_clothing_advice` separately, passing the JSON returned here.',
  parameters: z.object({
    city: z.string().describe('The city to get weather for'),
  }),
  execute: async ({ city }) => {
    // TODO: Replace with real weather API (e.g. OpenWeatherMap, wttr.in)
    const mockWeather = {
      city,
      condition: 'Sunny',
      temperature: { min: 18, max: 25, unit: '°C' },
      wind: 'Light breeze',
    };
    return JSON.stringify(mockWeather);
  },
});

// ========== Tool: Get Clothing Advice ==========
const getClothingAdvice = tool({
  name: 'get_clothing_advice',
  description:
    'Give clothing advice based on a weather description that the caller already has. ' +
    'This tool does NOT fetch weather itself — call `get_weather` first if the user asks ' +
    'about a specific city, then pass the resulting JSON (or any plain-text weather summary) ' +
    'into this tool\'s `weather` parameter. ' +
    'Important: this is a separate tool from `get_weather`. There is no combined ' +
    '"get_clothing_weather" tool — the two must be invoked one after the other.',
  parameters: z.object({
    weather: z.string().describe('The weather description (JSON or plain text)'),
  }),
  execute: async ({ weather }) => {
    // TODO: Replace with more sophisticated logic or an external service
    // Basic temperature-aware advice based on input
    const cold = /(-\d|[0-9](?=\s*°))/;
    const hot = /(3[0-9]|4[0-9])\s*°/;

    if (hot.test(weather)) {
      return 'Hot weather — wear short sleeves, shorts, and stay hydrated.';
    }
    if (cold.test(weather)) {
      return 'Cold weather — wear a down jacket or heavy coat with scarf and gloves.';
    }
    return 'Moderate weather — a light jacket with casual pants and sneakers works well.';
  },
});

// ========== Tool: Translate Text ==========
const translateText = tool({
  name: 'translate_text',
  description: 'Translate text to the specified language.',
  parameters: z.object({
    text: z.string().describe('The text to translate'),
    target_language: z.string().describe('Target language code, e.g. en, ja, fr, ko, de'),
  }),
  execute: async ({ text, target_language }) => {
    // TODO: Replace with real translation API (e.g. DeepL, Google Translate)
    const languageNames: Record<string, string> = {
      en: 'English',
      ja: '日本語',
      fr: 'Français',
      ko: '한국어',
      de: 'Deutsch',
      es: 'Español',
      ru: 'Русский',
    };
    const langName = languageNames[target_language] ?? target_language;
    return `[Mock translation to ${langName}]: ${text}`;
  },
});

// ========== Tool: Text Statistics ==========
const textStatistics = tool({
  name: 'text_statistics',
  description: 'Analyze text and return statistics like character count and word count.',
  parameters: z.object({
    text: z.string().describe('The text to analyze'),
  }),
  execute: async ({ text }) => {
    const charCount = text.length;
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const lineCount = text.split('\n').length;
    return JSON.stringify({ charCount, wordCount, lineCount });
  },
});

// ========== Export ==========
/**
 * Factory that returns all available tools.
 * Add new tools to this array — the agent will automatically pick them up.
 */
export function createTools() {
  return [getWeather, getClothingAdvice, translateText, textStatistics];
}
