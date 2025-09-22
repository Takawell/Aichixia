export type IntentType =
  | "search_anime"
  | "search_manga"
  | "search_manhwa"
  | "search_lightnovel"
  | "recommendation"
  | "character_info"
  | "genre_search"
  | "seasonal_search"
  | "smalltalk"
  | "unknown";

export type IntentResult = {
  intent: IntentType;
  query?: string;
  target?: "anilist" | "ai";
};

export function detectIntent(message: string): IntentResult {
  const text = message.toLowerCase().trim();

  if (/\banime\b|\btonton\b|\bnonton\b/.test(text)) {
    return { intent: "search_anime", query: message, target: "anilist" };
  }
  if (/\bmanga\b/.test(text)) {
    return { intent: "search_manga", query: message, target: "anilist" };
  }
  if (/\bmanhwa\b/.test(text)) {
    return { intent: "search_manhwa", query: message, target: "anilist" };
  }
  if (/\bnovel\b|\blight novel\b|\bln\b/.test(text)) {
    return { intent: "search_lightnovel", query: message, target: "anilist" };
  }
  if (/\brekomendasi\b|\brecommend\b|\bsaran\b/.test(text)) {
    return { intent: "recommendation", query: message, target: "anilist" };
  }
  if (/\bkarakter\b|\bcharacter\b/.test(text)) {
    return { intent: "character_info", query: message, target: "anilist" };
  }
  if (/\baction\b|\bromance\b|\bcomedy\b|\bdrama\b|\bfantasy\b|\bisekai\b/.test(text)) {
    return { intent: "genre_search", query: message, target: "anilist" };
  }
  if (/\bwinter\b|\bspring\b|\bsummer\b|\bfall\b|\bmusim\b/.test(text)) {
    return { intent: "seasonal_search", query: message, target: "anilist" };
  }
  if (/\bhalo\b|\bhai\b|\bapa kabar\b|\bhello\b|\bhi\b|\bmakasih\b|\bthanks\b/.test(text)) {
    return { intent: "smalltalk", target: "ai" };
  }
  return { intent: "unknown", query: message, target: "ai" };
}

export async function routeByIntent(
  message: string,
  handlers: {
    openaiHandler: (msg: string) => Promise<any>;
    geminiHandler: (msg: string) => Promise<any>;
    anilistHandler: (query: string, type: IntentType) => Promise<any>;
  }
) {
  const intent = detectIntent(message);

  if (intent.target === "anilist" && intent.query) {
    return handlers.anilistHandler(intent.query, intent.intent);
  }

  // Prioritize OpenAI, fallback to Gemini
  try {
    return await handlers.openaiHandler(message);
  } catch (err) {
    console.warn("[Intent] OpenAI failed, falling back to Gemini:", err);
    return handlers.geminiHandler(message);
  }
}
