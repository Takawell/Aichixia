import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const NEMOTRON_API_KEY = process.env.NEMOTRON_API_KEY;
const NEMOTRON_MODEL = process.env.NEMOTRON_MODEL || "nvidia/nemotron-3-ultra-550b-a55b";

if (!NEMOTRON_API_KEY) {
  console.warn("[lib/nemotron] Warning: NEMOTRON_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: NEMOTRON_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export class NemotronRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NemotronRateLimitError";
  }
}

export class NemotronQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NemotronQuotaError";
  }
}

export async function chatNemotron(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!NEMOTRON_API_KEY) {
    throw new Error("NEMOTRON_API_KEY not defined in environment variables.");
  }

  try {
    const response = await client.chat.completions.create({
      model: NEMOTRON_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 0.8,
      max_tokens: opts?.maxTokens ?? 8096,
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "I'm unable to respond right now.";

    return { reply };
  } catch (error: any) {
    if (error?.status === 429) {
      throw new NemotronRateLimitError(
        `Nemotron rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new NemotronQuotaError(
        `Nemotron quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Nemotron server error: ${error.message}`);
    }

    throw error;
  }
}

export async function* chatNemotronStream(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): AsyncGenerator<string, void, unknown> {
  if (!NEMOTRON_API_KEY) {
    throw new Error("NEMOTRON_API_KEY not defined in environment variables.");
  }

  try {
    const stream = await client.chat.completions.create({
      model: NEMOTRON_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 0.8,
      max_tokens: opts?.maxTokens ?? 4096,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  } catch (error: any) {
    if (error?.status === 429) {
      throw new NemotronRateLimitError(
        `Nemotron rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new NemotronQuotaError(
        `Nemotron quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Nemotron server error: ${error.message}`);
    }

    throw error;
  }
}

export async function quickChatNemotron(
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

  const { reply } = await chatNemotron(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatNemotron,
  chatNemotronStream,
  quickChatNemotron,
};
