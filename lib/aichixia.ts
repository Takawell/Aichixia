import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const AICHIXIA_API_KEY = process.env.AICHIXIA_API_KEY;
const AICHIXIA_BASE_URL = process.env.AICHIXIA_BASE_URL;
const AICHIXIA_MODEL = process.env.AICHIXIA_MODEL || "aichixia-flash";

const client = new OpenAI({
  apiKey: AICHIXIA_API_KEY,
  baseURL: AICHIXIA_BASE_URL,
});

export class AichixiaRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AichixiaRateLimitError";
  }
}

export class AichixiaQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AichixiaQuotaError";
  }
}

export class AichixiaConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AichixiaConfigError";
  }
}

export class AichixiaServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AichixiaServerError";
  }
}

function ensureConfigured() {
  if (!AICHIXIA_API_KEY || !AICHIXIA_BASE_URL) {
    throw new AichixiaConfigError("Aichixia is not configured properly. Please contact the admin.");
  }
}

export async function chatAichixia(
  history: ChatMessage[],
  opts?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<{ reply: string }> {
  ensureConfigured();

  try {
    const response = await client.chat.completions.create({
      model: AICHIXIA_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 0.8,
      max_tokens: opts?.maxTokens ?? 4096,
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "Hmph! I can't answer that right now... not that I care!";

    return { reply };
  } catch (error: any) {
    console.error("[lib/aichixia] chatAichixia error:", error);

    if (error?.status === 429) {
      throw new AichixiaRateLimitError("Too many requests right now, please slow down.");
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new AichixiaQuotaError("Quota exceeded, please try again later.");
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new AichixiaServerError("The server is having issues right now, please try again shortly.");
    }
    throw new AichixiaServerError("Something went wrong, please try again.");
  }
}

export async function streamAichixia(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  ensureConfigured();

  const encoder = new TextEncoder();
  const model = AICHIXIA_MODEL;
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
            const fallback = await chatAichixia(history, opts);
            enqueueChunk({ content: fallback.reply });
          } catch {
            enqueueChunk({ content: "Hmph! I can't answer that right now... not that I care!" });
          }
        }

        enqueueChunk({}, "stop");
        enqueueDone();
      } catch (error: any) {
        console.error("[lib/aichixia] streamAichixia error:", error);

        let message = "Something went wrong, please try again.";
        if (error?.status === 429) {
          message = "Too many requests right now, please slow down.";
        } else if (error?.status === 402 || error?.code === "insufficient_quota" || error?.message?.includes("quota")) {
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

export async function quickChatAichixia(
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

  const { reply } = await chatAichixia(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });
  return reply;
}

export default {
  chatAichixia,
  streamAichixia,
  quickChatAichixia,
};
