import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type TextPart = {
  type: "text";
  text: string;
};

export type ImagePart = {
  type: "image_url";
  image_url: { url: string };
};

export type ContentPart = TextPart | ImagePart;

export type ChatMessage = {
  role: Role;
  content: string | ContentPart[];
};

const KIMI_API_KEY = process.env.KIMI_API_KEY;
const KIMI_MODEL = process.env.KIMI_MODEL || "moonshotai/kimi-k2.6";

if (!KIMI_API_KEY) {
  console.warn("[lib/kimi] Warning: KIMI_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: KIMI_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export function buildImageMessage(
  text: string,
  imageUrls: string[]
): ChatMessage {
  const parts: ContentPart[] = [{ type: "text", text }];
  for (const url of imageUrls) {
    parts.push({ type: "image_url", image_url: { url } });
  }
  return { role: "user", content: parts };
}

export function buildBase64ImageUrl(
  base64Data: string,
  mediaType: string
): string {
  return `data:${mediaType};base64,${base64Data}`;
}

export class KimiRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KimiRateLimitError";
  }
}

export class KimiQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KimiQuotaError";
  }
}

export class KimiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KimiConfigError";
  }
}

export class KimiServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KimiServerError";
  }
}

function ensureConfigured() {
  if (!KIMI_API_KEY) {
    throw new KimiConfigError("Kimi is not configured properly. Please contact the admin.");
  }
}

export async function chatKimi(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!KIMI_API_KEY) {
    throw new Error("KIMI_API_KEY not defined in environment variables.");
  }

  try {
    const response = await client.chat.completions.create({
      model: KIMI_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })) as any,
      temperature: opts?.temperature ?? 1.0,
      max_tokens: opts?.maxTokens ?? 8092,
      top_p: 1.0,
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "I'm unable to respond right now.";

    return { reply };
  } catch (error: any) {
    console.error("[lib/kimi] chatKimi error:", error);

    if (error?.status === 429) {
      throw new KimiRateLimitError(`Kimi rate limit exceeded: ${error.message}`);
    }
    if (error?.status === 402 || error?.code === "insufficient_quota" || error?.message?.includes("quota")) {
      throw new KimiQuotaError(`Kimi quota exceeded: ${error.message}`);
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Kimi server error: ${error.message}`);
    }

    throw error;
  }
}

export async function streamKimi(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  ensureConfigured();

  const encoder = new TextEncoder();
  const model = KIMI_MODEL;
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
          })) as any,
          temperature: opts?.temperature ?? 1.0,
          max_tokens: opts?.maxTokens ?? 4092,
          top_p: 1.0,
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
            const fallback = await chatKimi(history, opts);
            enqueueChunk({ content: fallback.reply });
          } catch (fallbackError: any) {
            console.error("[lib/kimi] streamKimi fallback error:", fallbackError);
            enqueueChunk({ content: "I'm unable to respond right now." });
          }
        }

        enqueueChunk({}, "stop");
        enqueueDone();
      } catch (error: any) {
        console.error("[lib/kimi] streamKimi error:", error);

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

export async function quickChatKimi(
  userMessage: string,
  opts?: {
    systemPrompt?: string;
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    imageUrls?: string[];
  }
) {
  const hist: ChatMessage[] = [];

  if (opts?.systemPrompt) {
    hist.push({ role: "system", content: opts.systemPrompt });
  }

  if (opts?.history?.length) {
    hist.push(...opts.history);
  }

  if (opts?.imageUrls?.length) {
    hist.push(buildImageMessage(userMessage, opts.imageUrls));
  } else {
    hist.push({ role: "user", content: userMessage });
  }

  const { reply } = await chatKimi(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatKimi,
  streamKimi,
  quickChatKimi,
  buildImageMessage,
  buildBase64ImageUrl,
};
