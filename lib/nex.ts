import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const NEX_API_KEY = process.env.OPENROUTER_API_KEY;
const NEX_MODEL = process.env.NEX_MODEL || "nex-agi/nex-n2.5-pro";

const client = new OpenAI({
  apiKey: NEX_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export class NexRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NexRateLimitError";
  }
}

export class NexQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NexQuotaError";
  }
}

export class NexConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NexConfigError";
  }
}

export class NexServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NexServerError";
  }
}

function ensureConfigured() {
  if (!NEX_API_KEY) {
    throw new NexConfigError("Nex is not configured properly. Please contact the admin.");
  }
}

export async function chatNex(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  ensureConfigured();

  try {
    const response = await client.chat.completions.create({
      model: NEX_MODEL,
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
    console.error("[lib/nex] chatNex error:", error);

    if (error?.status === 429) {
      throw new NexRateLimitError("Too many requests right now, please slow down.");
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new NexQuotaError("Quota exceeded, please try again later.");
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new NexServerError("The server is having issues right now, please try again shortly.");
    }
    throw new NexServerError("Something went wrong, please try again.");
  }
}

export async function streamNex(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  ensureConfigured();

  const encoder = new TextEncoder();
  const model = NEX_MODEL;
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
          max_tokens: opts?.maxTokens ?? 4092,
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
            const fallback = await chatNex(history, opts);
            enqueueChunk({ content: fallback.reply });
          } catch {
            enqueueChunk({ content: "I'm unable to respond right now." });
          }
        }

        enqueueChunk({}, "stop");
        enqueueDone();
      } catch (error: any) {
        console.error("[lib/nex] streamNex error:", error);

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

export async function quickChatNex(
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

  const { reply } = await chatNex(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatNex,
  streamNex,
  quickChatNex,
};
