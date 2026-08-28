import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = process.env.CLAUDE_API_URL;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

if (!CLAUDE_API_KEY) {
  console.warn("Warning: CLAUDE_API_KEY not set in env.");
}

if (!CLAUDE_API_URL) {
  console.warn("Warning: CLAUDE_API_URL not set in env.");
}

const client = new OpenAI({
  apiKey: CLAUDE_API_KEY,
  baseURL: CLAUDE_API_URL,
});

export class ClaudeRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaudeRateLimitError";
  }
}

export class ClaudeQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaudeQuotaError";
  }
}

export class ClaudeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaudeConfigError";
  }
}

export class ClaudeServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaudeServerError";
  }
}

function ensureConfigured() {
  if (!CLAUDE_API_KEY || !CLAUDE_API_URL) {
    throw new ClaudeConfigError("Claude is not configured properly. Please contact the admin.");
  }
}

export async function chatClaude(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!CLAUDE_API_KEY) {
    throw new Error("CLAUDE_API_KEY not defined in environment variables.");
  }

  if (!CLAUDE_API_URL) {
    throw new Error("CLAUDE_API_URL not defined in environment variables.");
  }

  try {
    const response = await client.chat.completions.create({
      model: CLAUDE_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 0.8,
      max_tokens: opts?.maxTokens ?? 8092,
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "Hmph! I can't answer that right now... not that I care!";

    return { reply };
  } catch (error: any) {
    console.error("[lib/claude] chatClaude error:", error);

    if (error?.status === 429) {
      throw new ClaudeRateLimitError(`Claude rate limit exceeded: ${error.message}`);
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new ClaudeQuotaError(`Claude quota exceeded: ${error.message}`);
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Claude server error: ${error.message}`);
    }

    throw error;
  }
}

export async function streamClaude(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  ensureConfigured();

  const encoder = new TextEncoder();
  const model = CLAUDE_MODEL;
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
            const fallback = await chatClaude(history, opts);
            enqueueChunk({ content: fallback.reply });
          } catch (fallbackError: any) {
            console.error("[lib/claude] streamClaude fallback error:", fallbackError);
            enqueueChunk({ content: "Hmph! I can't answer that right now... not that I care!" });
          }
        }

        enqueueChunk({}, "stop");
        enqueueDone();
      } catch (error: any) {
        console.error("[lib/claude] streamClaude error:", error);

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

export async function quickChatClaude(
  userMessage: string,
  opts?: {
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
  }
) {
  const hist: ChatMessage[] = [];
  if (opts?.history?.length) {
    hist.push(...opts.history);
  }
  hist.push({ role: "user", content: userMessage });

  const { reply } = await chatClaude(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatClaude,
  streamClaude,
  quickChatClaude,
};
