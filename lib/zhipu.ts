import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
const ZHIPU_ACCOUNT_ID = process.env.ZHIPU_ACCOUNT_ID;
const ZHIPU_MODEL = process.env.ZHIPU_MODEL;

if (!ZHIPU_API_KEY || !ZHIPU_ACCOUNT_ID) {
  console.warn("[lib/zhipu] Warning: ZHIPU credentials not set in env.");
}

const client = new OpenAI({
  apiKey: ZHIPU_API_KEY,
  baseURL: `https://api.cloudflare.com/client/v4/accounts/${ZHIPU_ACCOUNT_ID}/ai/v1`,
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
      max_tokens: opts?.maxTokens ?? 8096,
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

export async function streamZhipu(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  if (!ZHIPU_API_KEY || !ZHIPU_ACCOUNT_ID) {
    throw new Error("ZHIPU credentials not defined in environment variables.");
  }

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
        const streamResponse = await client.chat.completions.create({
          model: ZHIPU_MODEL,
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
          })) as any,
          temperature: opts?.temperature ?? 0.8,
          max_tokens: opts?.maxTokens ?? 4096,
          stream: true,
        });

        for await (const chunk of streamResponse) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) enqueue(delta);
        }

        done();
      } catch (error: any) {
        let message = "An unexpected error occurred.";
        if (error?.status === 429) {
          message = "Rate limit exceeded. Please wait a moment.";
        } else if (error?.status === 402 || error?.code === "insufficient_quota" || error?.message?.includes("quota")) {
          message = "Quota exceeded. Please try again later.";
        } else if (error?.status === 503 || error?.status === 500) {
          message = "Server error. Please try again.";
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
  streamZhipu,
  quickChatZhipu,
};
