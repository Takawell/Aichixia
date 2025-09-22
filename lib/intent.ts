export type IntentType =
  | "smalltalk"
  | "unknown";

export type IntentResult = {
  intent: IntentType;
  query?: string;
  target: "ai";
};

export function detectIntent(message: string): IntentResult {
  const text = message.toLowerCase().trim();

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
  }
) {
  try {
    return await handlers.openaiHandler(message);
  } catch (err) {
    console.warn("[Intent] OpenAI failed, falling back to Gemini:", err);
    return handlers.geminiHandler(message);
  }
}
