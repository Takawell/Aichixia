import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const GEMMA_API_KEY = process.env.GEMMA_API_KEY;
const GEMMA_MODEL = process.env.GEMMA_MODEL || "gemma-4-31b";

if (!GEMMA_API_KEY) {
  console.warn("[lib/gemma] Warning: GEMMA_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: GEMMA_API_KEY,
  baseURL: "https://api.cerebras.ai/v1",
});

export class GemmaRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GemmaRateLimitError";
  }
}

export class GemmaQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GemmaQuotaError";
  }
}

export async function chatGemma(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!GEMMA_API_KEY) {
    throw new Error("GEMMA_API_KEY not defined in environment variables.");
  }

  try {
    const response = await client.chat.completions.create({
      model: GEMMA_MODEL,
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
      throw new GemmaRateLimitError(`Gemma rate limit exceeded: ${error.message}`);
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new GemmaQuotaError(`Gemma quota exceeded: ${error.message}`);
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Gemma server error: ${error.message}`);
    }

    throw error;
  }
}

export async function streamGemma(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  if (!GEMMA_API_KEY) {
    throw new Error("GEMMA_API_KEY not defined in environment variables.");
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
          model: GEMMA_MODEL,
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: opts?.temperature ?? 0.8,
          max_tokens: opts?.maxTokens ?? 8096,
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
        } else if (error?.status === 402 || error?.code === "insufficient_quota") {
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

export async function quickChatGemma(
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

  const { reply } = await chatGemma(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatGemma,
  streamGemma,
  quickChatGemma,
};
