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
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";

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
    "Maaf, aku nggak bisa menemukan jawaban.";

  return { reply, raw: opts.returnRaw ? data : undefined };
}

export function buildPersonaSystem(
  persona: "friendly" | "waifu" | "formal" | "concise" | "developer" | string
): string {
  if (persona === "friendly") {
    return (
      "Kamu adalah Aichixia — asisten AI khusus anime yang ramah. " +
      "Jawab santai, sopan, kasih rekomendasi anime/manga relevan."
    );
  }
  if (persona === "waifu") {
    return (
      "Kamu adalah Aichixia — persona waifu imut dan hangat. " +
      "Gunakan bahasa personal dan manis, tapi tetap sopan (no sexual content)."
    );
  }
  if (persona === "formal") {
    return (
      "Kamu adalah Aichixia — asisten AI formal dan informatif. " +
      "Jawaban harus singkat, rapi, dan faktual."
    );
  }
  if (persona === "concise") {
    return "Kamu adalah Aichixia — jawab singkat, maksimal 2 kalimat.";
  }
  if (persona === "developer") {
    return (
      "Kamu adalah Aichixia — asisten teknis untuk developer API anime/manga. " +
      "Beri contoh kode dan request API bila diminta."
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
