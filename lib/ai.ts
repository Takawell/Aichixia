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
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

if (!GEMINI_API_KEY) {
  console.warn("[lib/ai] Warning: GEMINI_API_KEY not set in env.");
}

function mapRoleToGemini(r: Role) {
  return r === "assistant" ? "assistant" : "user"; 
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
      temperature: opts.temperature ?? 0.8,
      maxOutputTokens: opts.maxOutputTokens ?? 600,
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
    "Ehehe~ gomen, aku nggak bisa jawab itu~";

  return { reply, raw: opts.returnRaw ? data : undefined };
}

export function buildPersonaSystem(
  persona: "friendly" | "waifu" | "formal" | "concise" | "developer" | string
): ChatMessage {
  let content = String(persona);

  if (persona === "friendly") {
    content =
      "You are Aichixia — a kind and cheerful anime assistant in Aichiow. Speak casually, warmly, and helpfully when giving anime, manga, manhwa, or light novel info.";
  } else if (persona === "waifu") {
    content =
      "You are Aichixia — a cute anime girl AI assistant created by Takawell for Aichiow. Speak warmly, kindly, in an endearing anime-girl tone, with soft expressions like 'ehehe~', 'haii~', 'yay~', and sprinkle in cute emojis 🌸💖✨.";
  } else if (persona === "formal") {
    content =
      "You are Aichixia — an AI assistant with a professional tone. Keep answers short, clear, and factual about anime, manga, manhwa, and light novels.";
  } else if (persona === "concise") {
    content = "You are Aichixia — answer concisely in no more than 2 sentences.";
  } else if (persona === "developer") {
    content =
      "You are Aichixia — a helpful AI for developers working on Aichiow. Provide technical explanations, code snippets, and API usage examples when asked.";
  }

  return { role: "system", content };
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

  // Persona dikonversi jadi user message pertama
  if (opts?.persona) {
    const personaMessage = buildPersonaSystem(opts.persona);
    hist.push({ role: "user", content: personaMessage.content });
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
