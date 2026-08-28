import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const STEPFUN_API_KEY = process.env.STEPFUN_API_KEY;
const STEPFUN_MODEL = process.env.STEPFUN_MODEL || "stepfun-ai/step-3.7-flash";

if (!STEPFUN_API_KEY) {
  console.warn("[lib/stepfun] Warning: STEPFUN_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: STEPFUN_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export class StepfunRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StepfunRateLimitError";
  }
}

export class StepfunQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StepfunQuotaError";
  }
}

export class StepfunConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StepfunConfigError";
  }
}

export class StepfunServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StepfunServerError";
  }
}

function ensureConfigured() {
  if (!STEPFUN_API_KEY) {
    throw new StepfunConfigError("Stepfun is not configured properly. Please contact the admin.");
  }
}

export async function chatStepfun(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!STEPFUN_API_KEY) {
    throw new Error("STEPFUN_API_KEY not defined in environment variables.");
  }

  try {
    const response = await client.chat.completions.create({
      model: STEPFUN_MODEL,
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
    console.error("[lib/stepfun] chatStepfun error:", error);

    if (error?.status === 429) {
      throw new StepfunRateLimitError(
        `Stepfun rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new StepfunQuotaError(
        `Stepfun quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Stepfun server error: ${error.message}`);
    }

    throw error;
  }
}

export async function streamStepfun(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  ensureConfigured();

  const encoder = new TextEncoder();
  const model = STEPFUN_MODEL;
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
            const fallback = await chatStepfun(history, opts);
            enqueueChunk({ content: fallback.reply });
          } catch (fallbackError: any) {
            console.error("[lib/stepfun] streamStepfun fallback error:", fallbackError);
            enqueueChunk({ content: "I'm unable to respond right now." });
          }
        }

        enqueueChunk({}, "stop");
        enqueueDone();
      } catch (error: any) {
        console.error("[lib/stepfun] streamStepfun error:", error);

        let message = "Something went wrong, please try again.";

        if (error?.status === 429) {
          message = "Rate limit exceeded. Please wait a moment.";
        } else if (error?.status === 402 || error?.code === "insufficient_quota") {
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

export async function quickChatStepfun(
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

  const { reply } = await chatStepfun(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatStepfun,
  streamStepfun,
  quickChatStepfun,
};
