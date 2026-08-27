import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek/deepseek-v4-pro";

const client = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: "https://api.xkiro.com/v1",
});

export class DeepSeekRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeepSeekRateLimitError";
  }
}

export class DeepSeekQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeepSeekQuotaError";
  }
}

export class DeepSeekConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeepSeekConfigError";
  }
}

export class DeepSeekServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeepSeekServerError";
  }
}

function ensureConfigured() {
  if (!DEEPSEEK_API_KEY) {
    throw new DeepSeekConfigError("DeepSeek is not configured properly. Please contact the admin.");
  }
}

export async function chatDeepSeek(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  ensureConfigured();

  try {
    const response = await client.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 0.8,
      max_tokens: opts?.maxTokens ?? 8092,
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "I'm unable to respond right now.";

    return { reply };
  } catch (error: any) {
    console.error("[lib/deepseek] chatDeepSeek error:", error);

    if (error?.status === 429) {
      throw new DeepSeekRateLimitError("Too many requests right now, please slow down.");
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new DeepSeekQuotaError("Quota exceeded, please try again later.");
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new DeepSeekServerError("The server is having issues right now, please try again shortly.");
    }
    throw new DeepSeekServerError("Something went wrong, please try again.");
  }
}

export async function streamDeepSeek(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  ensureConfigured();

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
          model: DEEPSEEK_MODEL,
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: opts?.temperature ?? 0.8,
          max_tokens: opts?.maxTokens ?? 4092,
          stream: true,
        });

        for await (const chunk of streamResponse) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) enqueue(delta);
        }

        done();
      } catch (error: any) {
        console.error("[lib/deepseek] streamDeepSeek error:", error);

        let message = "Something went wrong, please try again.";
        if (error?.status === 429) {
          message = "Too many requests right now, please slow down.";
        } else if (error?.status === 402 || error?.code === "insufficient_quota") {
          message = "Quota exceeded, please try again later.";
        } else if (error?.status === 503 || error?.status === 500) {
          message = "The server is having issues right now, please try again shortly.";
        } else if (error?.message?.includes("<!DOCTYPE") || error?.message?.includes("not valid JSON")) {
          message = "Received an invalid response, please try again.";
        }
        enqueueError(message);
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });
}

export async function quickChatDeepSeek(
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

  const { reply } = await chatDeepSeek(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatDeepSeek,
  streamDeepSeek,
  quickChatDeepSeek,
};
