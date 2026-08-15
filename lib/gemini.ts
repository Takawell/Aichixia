export type Role = "user" | "assistant" | "system";

export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type ChatMessage = {
  role: Role;
  content: string | ContentBlock[];
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
  console.warn("[lib/gemini] Warning: GEMINI_API_KEY not set in env.");
}

export class GeminiRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiRateLimitError";
  }
}

export class GeminiQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiQuotaError";
  }
}

function mapRoleToGemini(r: Role) {
  if (r === "assistant") return "model";
  return "user";
}

function parseImageUrl(url: string): { mimeType: string; data: string } | null {
  const match = url.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return null;
}

function contentToGeminiParts(content: string | ContentBlock[]): any[] {
  if (typeof content === "string") {
    return [{ text: content }];
  }

  return content.map((block) => {
    if (block.type === "text") {
      return { text: block.text };
    }
    if (block.type === "image_url") {
      const parsed = parseImageUrl(block.image_url.url);
      if (parsed) {
        return {
          inlineData: {
            mimeType: parsed.mimeType,
            data: parsed.data,
          },
        };
      }
      return {
        fileData: {
          fileUri: block.image_url.url,
        },
      };
    }
    return { text: "" };
  });
}

function messagesToContents(history: ChatMessage[]) {
  const systemMessages = history.filter((m) => m.role === "system");
  const otherMessages = history.filter((m) => m.role !== "system");

  const systemPrefix = systemMessages
    .map((m) => (typeof m.content === "string" ? m.content : ""))
    .join("\n\n");

  if (systemPrefix && otherMessages.length > 0) {
    const firstUserIdx = otherMessages.findIndex((m) => m.role === "user");
    if (firstUserIdx >= 0) {
      const firstMsg = otherMessages[firstUserIdx];
      if (typeof firstMsg.content === "string") {
        otherMessages[firstUserIdx] = {
          ...firstMsg,
          content: `${systemPrefix}\n\n${firstMsg.content}`,
        };
      } else {
        otherMessages[firstUserIdx] = {
          ...firstMsg,
          content: [{ type: "text", text: systemPrefix }, ...firstMsg.content],
        };
      }
    }
  }

  return otherMessages.map((m) => ({
    role: mapRoleToGemini(m.role),
    parts: contentToGeminiParts(m.content),
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

function buildGenerationConfig(opts: GeminiOptions) {
  return {
    temperature: opts.temperature ?? 0.8,
    maxOutputTokens: opts.maxOutputTokens ?? 4096,
    topK: opts.topK,
    topP: opts.topP,
    ...(opts.extraGenerationConfig || {}),
  };
}

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
    generationConfig: buildGenerationConfig(opts),
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
    if (res.status === 429) {
      throw new GeminiRateLimitError(`Gemini rate limit exceeded: ${text}`);
    }
    if (res.status === 402 || text.includes("insufficient_quota") || text.includes("RESOURCE_EXHAUSTED")) {
      throw new GeminiQuotaError(`Gemini quota exceeded: ${text}`);
    }
    throw new Error(`[Gemini] ${res.status} ${res.statusText}: ${text}`);
  }

  let data: GeminiResponse;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(
      `[Gemini] Failed to parse JSON: ${(err as Error).message}\nResponse: ${text}`
    );
  }

  const reply =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.() ??
    "I'm unable to respond right now.";

  return { reply, raw: opts.returnRaw ? data : undefined };
}

export async function streamGemini(
  history: ChatMessage[],
  opts: GeminiOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not defined in environment variables.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    GEMINI_MODEL
  )}:streamGenerateContent?alt=sse`;

  const body: Record<string, any> = {
    contents: messagesToContents(history),
    generationConfig: buildGenerationConfig(opts),
  };

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (text: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      };

      const enqueueError = (message: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
      };

      const done = () => {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      };

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": GEMINI_API_KEY!,
          },
          body: JSON.stringify(body),
        });

        if (!res.ok || !res.body) {
          const errText = await res.text();
          if (res.status === 429) throw new GeminiRateLimitError(`Gemini rate limit exceeded: ${errText}`);
          if (res.status === 402 || errText.includes("RESOURCE_EXHAUSTED")) throw new GeminiQuotaError(`Gemini quota exceeded: ${errText}`);
          throw new Error(`[Gemini] ${res.status} ${res.statusText}: ${errText}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done: readerDone, value } = await reader.read();
          if (readerDone) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (!part.startsWith("data: ")) continue;
            const payload = part.slice(6).trim();
            if (!payload) continue;
            try {
              const parsed = JSON.parse(payload);
              const delta = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (delta) enqueue(delta);
            } catch {
              continue;
            }
          }
        }

        done();
      } catch (error: any) {
        let message = "An unexpected error occurred.";
        if (error instanceof GeminiRateLimitError) {
          message = "Rate limit exceeded. Please wait a moment.";
        } else if (error instanceof GeminiQuotaError) {
          message = "Quota exceeded. Please try again later.";
        } else if (error?.message?.includes("<!DOCTYPE") || error?.message?.includes("not valid JSON")) {
          message = "Model returned an invalid response. Please try again.";
        }
        enqueueError(message);
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });
}

export async function quickChat(
  userMessage: string,
  opts?: {
    systemPrompt?: string;
    history?: ChatMessage[];
    geminiOpts?: GeminiOptions;
  }
) {
  const hist: ChatMessage[] = [];
  if (opts?.systemPrompt) {
    hist.push({ role: "system", content: opts.systemPrompt });
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
  streamGemini,
  quickChat,
};
