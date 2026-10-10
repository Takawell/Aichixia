import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const ASTRA_API_KEY = process.env.ASTRA_API_KEY;
const ASTRA_MODEL = process.env.ASTRA_MODEL || "gpt-6-astra";

const client = new OpenAI({
  apiKey: ASTRA_API_KEY,
  baseURL: "https://router.clouvia.id/v1",
});

export class AstraRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AstraRateLimitError";
  }
}

export class AstraQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AstraQuotaError";
  }
}

export class AstraConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AstraConfigError";
  }
}

export class AstraServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AstraServerError";
  }
}

function ensureConfigured() {
  if (!ASTRA_API_KEY) {
    throw new AstraConfigError("Astra is not configured properly. Please contact the admin.");
  }
}

export async function chatAstra(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  ensureConfigured();

  try {
    const response = await client.chat.completions.create({
      model: ASTRA_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 0.8,
      max_tokens: opts?.maxTokens ?? 8192,
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "I'm unable to respond right now.";

    return { reply };
  } catch (error: any) {
    console.error("[lib/astra] chatAstra error:", error);

    if (error?.status === 429) {
      throw new AstraRateLimitError("Too many requests right now, please slow down.");
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new AstraQuotaError("Quota exceeded, please try again later.");
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new AstraServerError("The server is having issues right now, please try again shortly.");
    }
    throw new AstraServerError("Something went wrong, please try again.");
  }
}

export async function streamAstra(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  ensureConfigured();

  const encoder = new TextEncoder();
  const model = ASTRA_MODEL;
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
          temperature: opts?.temperature ?? 0.8,
          max_tokens: opts?.maxTokens ?? 4096,
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
            const fallback = await chatAstra(history, opts);
            enqueueChunk({ content: fallback.reply });
          } catch {
            enqueueChunk({ content: "I'm unable to respond right now." });
          }
        }

        enqueueChunk({}, "stop");
        enqueueDone();
      } catch (error: any) {
        console.error("[lib/astra] streamAstra error:", error);

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

        enqueueChunk({ content: message });
        enqueueChunk({}, "stop");
        enqueueDone();
      }
    },
  });
}

export async function quickChatAstra(
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

  const { reply } = await chatAstra(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatAstra,
  streamAstra,
  quickChatAstra,
};
