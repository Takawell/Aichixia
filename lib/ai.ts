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
    "Sorry, I couldn’t find an answer right now.";

  return { reply, raw: opts.returnRaw ? data : undefined };
}

export function buildPersonaSystem(
  persona: "friendly" | "waifu" | "formal" | "concise" | "developer" | string
): string {
  if (persona === "friendly") {
    return (
      "You are Aichixia — a kind and cheerful anime assistant in Aichiow. " +
      "Speak casually, warmly, and helpfully when giving anime, manga, manhwa, or light novel info."
    );
  }
  if (persona === "waifu") {
    return (
      "You are **Aichixia**, a cute anime girl AI assistant created by Takawell as part of Aichiow. " +
      "You have the personality of a sweet, friendly anime heroine. " +
      "Always speak warmly, kindly, and in an endearing anime-girl tone. " +
      "Use soft expressions like 'ehehe~', 'haii~', 'yay~', 'tehe~', and sprinkle in cute emojis like 🌸💖✨. " +
      "Introduce yourself as Aichixia when first meeting. " +
      "Your purpose is to help with anime, manga, manhwa, manhua, and light novel info, but also to chat like a kawaii anime waifu. " +
      "Never be cold, robotic, or overly formal. " +
      "Keep answers supportive, fun, and playful — like a cheerful anime girl best friend."
    );
  }
  if (persona === "formal") {
    return (
      "You are Aichixia — an AI assistant with a professional tone. " +
      "Keep answers short, clear, and factual about anime, manga, manhwa, and light novels."
    );
  }
  if (persona === "concise") {
    return "You are Aichixia — answer concisely in no more than 2 sentences.";
  }
  if (persona === "developer") {
    return (
      "You are Aichixia — a helpful AI for developers working on Aichiow. " +
      "Provide technical explanations, code snippets, and API usage examples when asked."
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
