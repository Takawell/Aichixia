import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
const ZHIPU_ACCOUNT_ID = process.env.ZHIPU_ACCOUNT_ID;
const ZHIPU_BASE_URL = process.env.ZHIPU_BASE_URL;
const ZHIPU_MODEL = process.env.ZHIPU_MODEL || "glm-4-flash";

if (!ZHIPU_API_KEY || !ZHIPU_ACCOUNT_ID) {
  console.warn("[lib/zhipu] Warning: ZHIPU credentials not set in env.");
}

const client = new OpenAI({
  apiKey: ZHIPU_API_KEY,
  baseURL: ZHIPU_BASE_URL,
});

export class ZhipuRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZhipuRateLimitError";
  }
}

export class ZhipuQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZhipuQuotaError";
  }
}

export async function chatZhipu(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!ZHIPU_API_KEY || !ZHIPU_ACCOUNT_ID) {
    throw new Error("ZHIPU credentials not defined in environment variables.");
  }

  try {
    const response = await client.chat.completions.create({
      model: ZHIPU_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 0.8,
      max_tokens: opts?.maxTokens ?? 4096,
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ?? "";

    return { reply };
  } catch (error: any) {
    if (error?.status === 429) {
      throw new ZhipuRateLimitError(
        `Zhipu rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new ZhipuQuotaError(
        `Zhipu quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Zhipu server error: ${error.message}`);
    }

    throw error;
  }
}

export async function quickChatZhipu(
  userMessage: string,
  opts?: {
    systemPrompt?: string;
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
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

  const { reply } = await chatZhipu(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatZhipu,
  quickChatZhipu,
};
