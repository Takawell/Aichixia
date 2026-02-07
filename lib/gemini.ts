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
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

if (!GEMINI_API_KEY) {
  console.warn("[lib/ai] Warning: GEMINI_API_KEY not set in env.");
}

function mapRoleToGemini(r: Role) {
  if (r === "assistant") return "model";
  return "user";
}

function messagesToContents(history: ChatMessage[]) {
  const systemMessages = history.filter(m => m.role === "system");
  const otherMessages = history.filter(m => m.role !== "system");
  
  const systemPrefix = systemMessages.map(m => m.content).join("\n\n");
  
  if (systemPrefix && otherMessages.length > 0) {
    const firstUserIdx = otherMessages.findIndex(m => m.role === "user");
    if (firstUserIdx >= 0) {
      otherMessages[firstUserIdx] = {
        ...otherMessages[firstUserIdx],
        content: `${systemPrefix}\n\n${otherMessages[firstUserIdx].content}`
      };
    }
  }
  
  return otherMessages.map((m) => ({
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
      maxOutputTokens: opts.maxOutputTokens ?? 4096,
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
    "I couldn't find an answer right now.";

  return { reply, raw: opts.returnRaw ? data : undefined };
}

export async function* chatGeminiStream(
  history: ChatMessage[],
  opts: GeminiOptions = {}
): AsyncGenerator<string, void, unknown> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not defined in environment variables.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    GEMINI_MODEL
  )}:streamGenerateContent?alt=sse`;

  const body: Record<string, any> = {
    contents: messagesToContents(history),
    generationConfig: {
      temperature: opts.temperature ?? 0.8,
      maxOutputTokens: opts.maxOutputTokens ?? 4096,
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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[Gemini] ${res.status} ${res.statusText}: ${text}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("[Gemini] No readable stream available");
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          if (jsonStr.trim()) {
            try {
              const data: GeminiResponse = JSON.parse(jsonStr);
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                yield text;
              }
            } catch (err) {
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export default {
  chatGemini,
  chatGeminiStream,
};
