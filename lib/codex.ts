import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const CODEX_API_KEY = process.env.CODEX_API_KEY;
const CODEX_MODEL = process.env.CODEX_MODEL || "openai/gpt-5.3-codex-spark";

const client = new OpenAI({
  apiKey: CODEX_API_KEY,
  baseURL: "https://api.xkiro.com/v1",
});

export class CodexRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CodexRateLimitError";
  }
}

export class CodexQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CodexQuotaError";
  }
}

export class CodexConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CodexConfigError";
  }
}

export class CodexServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CodexServerError";
  }
}

function ensureConfigured() {
  if (!CODEX_API_KEY) {
    throw new CodexConfigError("Codex is not configured properly. Please contact the admin.");
  }
}

export async function chatCodex(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  ensureConfigured();

  try {
    const response = await client.chat.completions.create({
      model: CODEX_MODEL,
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
    console.error("[lib/codex] chatCodex error:", error);

    if (error?.status === 429) {
      throw new CodexRateLimitError("Too many requests right now, please slow down.");
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new CodexQuotaError("Quota exceeded, please try again later.");
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new CodexServerError("The server is having issues right now, please try again shortly.");
    }
    throw new CodexServerError("Something went wrong, please try again.");
  }
}

export async function streamCodex(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  ensureConfigured();

  const encoder = new TextEncoder();
  const model = CODEX_MODEL;
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
            const fallback = await chatCodex(history, opts);
            enqueueChunk({ content: fallback.reply });
          } catch {
            enqueueChunk({ content: "I'm unable to respond right now." });
          }
        }

        enqueueChunk({}, "stop");
        enqueueDone();
      } catch (error: any) {
        console.error("[lib/codex] streamCodex error:", error);

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

export async function quickChatCodex(
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

  const { reply } = await chatCodex(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatCodex,
  streamCodex,
  quickChatCodex,
};
