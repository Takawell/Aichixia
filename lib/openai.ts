import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

if (!OPENAI_API_KEY) {
  console.warn("[lib/openai] Warning: OPENAI_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_BASE_URL,
});

export class OpenAIRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIRateLimitError";
  }
}

export class OpenAIQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIQuotaError";
  }
}

export async function chatOpenAI(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not defined in environment variables.");
  }

  try {
    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
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
      throw new OpenAIRateLimitError(
        `OpenAI rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new OpenAIQuotaError(
        `OpenAI quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`OpenAI server error: ${error.message}`);
    }
    
    throw error;
  }
}

export async function quickChatOpenAI(
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

  const { reply } = await chatOpenAI(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatOpenAI,
  quickChatOpenAI,
};
