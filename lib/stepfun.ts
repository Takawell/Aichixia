import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const STEPFUN_API_KEY = process.env.STEPFUN_API_KEY;
const STEPFUN_MODEL = process.env.STEPFUN_MODEL || "stepfun-ai/step-3.7-flash";

if (!STEPFUN_API_KEY) {
  console.warn("[lib/stepfun] Warning: STEPFUN_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: STEPFUN_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export class StepfunRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StepfunRateLimitError";
  }
}

export class StepfunQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StepfunQuotaError";
  }
}

export async function chatStepfun(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!STEPFUN_API_KEY) {
    throw new Error("STEPFUN_API_KEY not defined in environment variables.");
  }

  try {
    const response = await client.chat.completions.create({
      model: STEPFUN_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 0.8,
      max_tokens: opts?.maxTokens ?? 4096,
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "I'm unable to respond right now.";

    return { reply };
  } catch (error: any) {
    if (error?.status === 429) {
      throw new StepfunRateLimitError(
        `Stepfun rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new StepfunQuotaError(
        `Stepfun quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Stepfun server error: ${error.message}`);
    }

    throw error;
  }
}

export async function quickChatStepfun(
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

  const { reply } = await chatStepfun(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatStepfun,
  quickChatStepfun,
};
