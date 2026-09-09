import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const SENSENOVA_API_KEY = process.env.SENSENOVA_API_KEY;
const SENSENOVA_MODEL = process.env.SENSENOVA_MODEL || "sensenova-6.8-flash-lite";

const client = new OpenAI({
  apiKey: SENSENOVA_API_KEY,
  baseURL: "https://token.sensenova.ai/v1",
});

export class SenseNovaRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SenseNovaRateLimitError";
  }
}

export class SenseNovaQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SenseNovaQuotaError";
  }
}

export class SenseNovaConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SenseNovaConfigError";
  }
}

export class SenseNovaServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SenseNovaServerError";
  }
}

function ensureConfigured() {
  if (!SENSENOVA_API_KEY) {
    throw new SenseNovaConfigError("SenseNova is not configured properly. Please contact the admin.");
  }
}

export async function chatSenseNova(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  ensureConfigured();

  try {
    const response = await client.chat.completions.create({
      model: SENSENOVA_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 0.7,
      max_tokens: opts?.maxTokens ?? 4090,
    });

    const reply = response.choices[0]?.message?.content?.trim() ?? "I'm unable to respond right now.";

    return { reply };
  } catch (error: any) {
    console.error("[lib/sensenova] chatSenseNova error:", error);

    if (error?.status === 429) {
      throw new SenseNovaRateLimitError("Too many requests right now, please slow down.");
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new SenseNovaQuotaError("Quota exceeded, please try again later.");
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new SenseNovaServerError("The server is having issues right now, please try again shortly.");
    }
    throw new SenseNovaServerError("Something went wrong, please try again.");
  }
}

export async function streamSenseNova(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  ensureConfigured();

  const encoder = new TextEncoder();
  const model = SENSENOVA_MODEL;
  const id = `chatcmpl-${Date.now()}`;
  const created = Math.floor(Date.now() / 1000);

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueueChunk = (delta: Record<string, any>, finishReason: string | null = null) => {
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
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
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
          temperature: opts?.temperature ?? 0.7,
          max_tokens: opts?.maxTokens ?? 4090,
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
            const fallback = await chatSenseNova(history, opts);
            enqueueChunk({ content: fallback.reply });
          } catch (fallbackError: any) {
            console.error("[lib/sensenova] streamSenseNova fallback error:", fallbackError);
            enqueueChunk({ content: "I'm unable to respond right now." });
          }
        }

        enqueueChunk({}, "stop");
        enqueueDone();
      } catch (error: any) {
        console.error("[lib/sensenova] streamSenseNova error:", error);

        let message = "Something went wrong, please try again.";

        if (error?.status === 429) {
          message = "Rate limit exceeded. Please wait a moment.";
        } else if (error?.status === 402 || error?.code === "insufficient_quota") {
          message = "Quota exceeded. Please try again later.";
        } else if (error?.status === 503 || error?.status === 500) {
          message = "Server error. Please try again.";
        } else if (error?.message?.includes("<!DOCTYPE") || error?.message?.includes("not valid JSON")) {
          message = "Model returned an invalid response. Please try again.";
        }

        enqueueChunk({ content: message });
        enqueueChunk({}, "stop");
        enqueueDone();
      }
    },
  });
}

export async function quickChatSenseNova(
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

  const { reply } = await chatSenseNova(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatSenseNova,
  streamSenseNova,
  quickChatSenseNova,
};
