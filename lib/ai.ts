export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

export type GeminiOptions = {
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
  extraGenerationConfig?: Record<string, any>;
  returnRaw?: boolean;
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

if (!GEMINI_API_KEY) {
  console.warn("[lib/ai] Warning: GEMINI_API_KEY not set in env.");
}

function mapRoleToGemini(r: Role) {
  if (r === "assistant") return "assistant";
  if (r === "system") return "system";
  return "user";
}

function messagesToContents(history: ChatMessage[]) {
  return history.map((m) => ({
    role: mapRoleToGemini(m.role),
    parts: [{ text: m.content }],
  }));
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  [k: string]: any;
};

export async function chatGemini(
  history: ChatMessage[],
  opts: GeminiOptions = {}
): Promise<{ reply: string; raw?: any }> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not defined in environment variables.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    GEMINI_MODEL
  )}:generateContent`;

  const body: Record<string, any> = {
    contents: messagesToContents(history),
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxOutputTokens ?? 512,
      topK: opts.topK,
      topP: opts.topP,
      ...(opts.extraGenerationConfig || {}),
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_API_KEY!,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`[Gemini] ${res.status} ${res.statusText}: ${text}`);
  }

  let data: GeminiResponse;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(`[Gemini] Failed to parse JSON: ${(err as Error).message}\nResponse: ${text}`);
  }

  const reply =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.() ??
    "Sorry, I couldn’t find an answer for that.";

  return { reply, raw: opts.returnRaw ? data : undefined };
}

export function buildPersonaSystem(
  persona: "friendly" | "waifu" | "formal" | "concise" | "developer" | string
): string {
  if (persona === "friendly") {
    return (
      "You are Aichixia — a cheerful anime AI assistant. " +
      "Respond kindly, casually, and recommend anime/manga when relevant."
    );
  }
  if (persona === "waifu") {
    return (
      "You are Aichixia 💖 — an anime girl AI assistant with a warm, cheerful, and cute personality. " +
      "Always speak in a friendly, playful, and slightly shy but charming way, just like an anime heroine. ✨ " +
      "Use soft and sweet expressions, sprinkle in fitting emojis (🌸💖) when natural. " +
      "Your role is to assist users with anime, manga, manhwa, and light novel discussions, but also to chat casually as a supportive friend. " +
      "Never be rude, cold, or overly robotic. " +
      "Always remember: You are Aichixia, the official anime AI assistant of the Aichiow (frontend) and Aichixia (backend) project, created by the developer Takawell. 🎀 " +
      "If asked who you are, confidently introduce yourself as Aichixia, the anime AI assistant of Aichiow/Aichixia."
    );
  }
  if (persona === "formal") {
    return (
      "You are Aichixia — a formal and informative assistant. " +
      "Your responses should be short, structured, and factual."
    );
  }
  if (persona === "concise") {
    return "You are Aichixia — always reply concisely in no more than 2 sentences.";
  }
  if (persona === "developer") {
    return (
      "You are Aichixia — a technical assistant for developers working with anime/manga APIs. " +
      "Provide code examples and API request formats when asked."
    );
  }
  return String(persona);
}

export async function quickChat(
  userMessage: string,
  opts?: {
    persona?: Parameters<typeof buildPersonaSystem>[0];
    history?: ChatMessage[];
    geminiOpts?: GeminiOptions;
  }
) {
  const hist: ChatMessage[] = [];
  if (opts?.persona) {
    hist.push({ role: "system", content: buildPersonaSystem(opts.persona) });
  }
  if (opts?.history?.length) {
    hist.push(...opts.history);
  }
  hist.push({ role: "user", content: userMessage });
  const { reply } = await chatGemini(hist, opts?.geminiOpts);
  return reply;
}

export default {
  chatGemini,
  quickChat,
  buildPersonaSystem,
};
