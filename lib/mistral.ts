import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || "mistral-large-latest";

if (!MISTRAL_API_KEY) {
  console.warn("[lib/mistral] Warning: MISTRAL_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: MISTRAL_API_KEY,
  baseURL: "https://api.mistral.ai/v1",
});

export class MistralRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MistralRateLimitError";
  }
}

export class MistralQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MistralQuotaError";
  }
}

export class MistralConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MistralConfigError";
  }
}

export class MistralServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MistralServerError";
  }
}

function ensureConfigured() {
  if (!MISTRAL_API_KEY) {
    throw new MistralConfigError("Mistral is not configured properly. Please contact the admin.");
  }
}

export async function chatMistral(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY not defined in environment variables.");
  }

  try {
    const response = await client.chat.completions.create({
      model: MISTRAL_MODEL,
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
    console.error("[lib/mistral] chatMistral error:", error);

    if (error?.status === 429) {
      throw new MistralRateLimitError(
        `Mistral rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota" || error?.message?.includes("quota")) {
      throw new MistralQuotaError(
        `Mistral quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Mistral server error: ${error.message}`);
    }

    throw error;
  }
}

export async function streamMistral(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  ensureConfigured();

  const encoder = new TextEncoder();
  const model = MISTRAL_MODEL;
  const id = `chatcmpl-${Date.now()}`;
  const created = Math.floor(Date.now() / 1000);

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueueChunk = (
        delta: Record<string, any>,
        finishReason: string | null = null
      ) => {
        const chunk = {
          id,
          object: "chat.completion.chunk",
          created,
          model,
          choices: [
            {
              index: 0,
              delta,
              finish_reason: finishReason,
            },
          ],
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
        );
      };

      const enqueueDone = () => {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      };

      try {
        const streamResponse = await client.chat.completions.create({
          model,
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: opts?.temperature ?? 0.8,
          max_tokens: opts?.maxTokens ?? 8096,
          stream: true,
        });

        enqueueChunk({ role: "assistant", content: "" });

        let receivedAny = false;

        for await (const chunk of streamResponse) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            receivedAny = true;
            enqueueChunk({ content: delta });
          }
        }

        if (!receivedAny) {
          try {
            const fallback = await chatMistral(history, opts);
            enqueueChunk({ content: fallback.reply });
          } catch (fallbackError: any) {
            console.error("[lib/mistral] streamMistral fallback error:", fallbackError);
            enqueueChunk({ content: "I'm unable to respond right now." });
          }
        }

        enqueueChunk({}, "stop");
        enqueueDone();
      } catch (error: any) {
        console.error("[lib/mistral] streamMistral error:", error);

        let message = "Something went wrong, please try again.";

        if (error?.status === 429) {
          message = "Rate limit exceeded. Please wait a moment.";
        } else if (error?.status === 402 || error?.code === "insufficient_quota" || error?.message?.includes("quota")) {
          message = "Quota exceeded. Please try again later.";
        } else if (error?.status === 503 || error?.status === 500) {
          message = "Server error. Please try again.";
        } else if (
          error?.message?.includes("<!DOCTYPE") ||
          error?.message?.includes("not valid JSON")
        ) {
          message = "Model returned an invalid response. Please try again.";
        }

        enqueueChunk({ content: message });
        enqueueChunk({}, "stop");
        enqueueDone();
      }
    },
  });
}

export async function quickChatMistral(
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

  const { reply } = await chatMistral(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatMistral,
  streamMistral,
  quickChatMistral,
};
