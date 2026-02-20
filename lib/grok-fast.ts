import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const FAST_GROK_API_KEY = process.env.FAST_GROK_API_KEY;
const FAST_GROK_BASE_URL = process.env.FAST_GROK_BASE_URL;
const FAST_GROK_MODEL = process.env.FAST_GROK_MODEL || "grok-4-1-fast-non-reasoning";

if (!FAST_GROK_API_KEY) {
  console.warn("[lib/grok-fast] Warning: FAST_GROK_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: FAST_GROK_API_KEY,
  baseURL: FAST_GROK_BASE_URL,
});

export class GrokFastRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GrokFastRateLimitError";
  }
}

export class GrokFastQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GrokFastQuotaError";
  }
}

export async function chatGrokFast(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!FAST_GROK_API_KEY) {
    throw new Error("FAST_GROK_API_KEY not defined in environment variables.");
  }

  try {
    const response = await client.chat.completions.create({
      model: FAST_GROK_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 0.8,
      max_tokens: opts?.maxTokens ?? 512,
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "I can't answer that right now.";

    return { reply };
  } catch (error: any) {
    if (error?.status === 429) {
      throw new GrokFastRateLimitError(
        `Grok Fast rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new GrokFastQuotaError(
        `Grok Fast quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Grok Fast server error: ${error.message}`);
    }

    throw error;
  }
}

export async function quickChatGrokFast(
  userMessage: string,
  opts?: {
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
  }
) {
  const hist: ChatMessage[] = [];
  if (opts?.history?.length) {
    hist.push(...opts.history);
  }
  hist.push({ role: "user", content: userMessage });

  const { reply } = await chatGrokFast(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });
  return reply;
}

export default {
  chatGrokFast,
  quickChatGrokFast,
};
