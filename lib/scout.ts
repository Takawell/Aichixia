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

const SCOUT_API_KEY = process.env.SCOUT_API_KEY;
const SCOUT_ACCOUNT_ID = process.env.SCOUT_ACCOUNT_ID;
const SCOUT_MODEL = process.env.SCOUT_MODEL || "@cf/meta/llama-4-scout-17b-16e-instruct";

if (!SCOUT_API_KEY) {
  console.warn("[lib/scout] Warning: SCOUT_API_KEY not set in env.");
}

if (!SCOUT_ACCOUNT_ID) {
  console.warn("[lib/scout] Warning: SCOUT_ACCOUNT_ID not set in env.");
}

const client = new OpenAI({
  apiKey: SCOUT_API_KEY,
  baseURL: `https://api.cloudflare.com/client/v4/accounts/${SCOUT_ACCOUNT_ID}/ai/v1`,
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

export class ScoutRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScoutRateLimitError";
  }
}

export class ScoutQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScoutQuotaError";
  }
}

export class ScoutConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScoutConfigError";
  }
}

export class ScoutServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScoutServerError";
  }
}

function ensureConfigured() {
  if (!SCOUT_API_KEY || !SCOUT_ACCOUNT_ID) {
    throw new ScoutConfigError("Scout is not configured properly. Please contact the admin.");
  }
}

export async function chatScout(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!SCOUT_API_KEY) {
    throw new Error("SCOUT_API_KEY not defined in environment variables.");
  }

  if (!SCOUT_ACCOUNT_ID) {
    throw new Error("SCOUT_ACCOUNT_ID not defined in environment variables.");
  }

  try {
    const requestBody: any = {
      model: SCOUT_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 1,
      max_tokens: opts?.maxTokens ?? 8096,
    };

    const response = await client.chat.completions.create(requestBody);
    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "I'm unable to respond right now.";

    return { reply };
  } catch (error: any) {
    console.error("[lib/scout] chatScout error:", error);

    if (error?.status === 429) {
      throw new ScoutRateLimitError(
        `Scout rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota" || error?.message?.includes("quota")) {
      throw new ScoutQuotaError(
        `Scout quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Scout server error: ${error.message}`);
    }

    throw error;
  }
}

export async function streamScout(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  ensureConfigured();

  const encoder = new TextEncoder();
  const model = SCOUT_MODEL;
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
          temperature: opts?.temperature ?? 1,
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
            const fallback = await chatScout(history, opts);
            enqueueChunk({ content: fallback.reply });
          } catch (fallbackError: any) {
            console.error("[lib/scout] streamScout fallback error:", fallbackError);
            enqueueChunk({ content: "I'm unable to respond right now." });
          }
        }

        enqueueChunk({}, "stop");
        enqueueDone();
      } catch (error: any) {
        console.error("[lib/scout] streamScout error:", error);

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

export async function quickChatScout(
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

  const { reply } = await chatScout(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatScout,
  streamScout,
  quickChatScout,
  buildImageMessage,
  buildBase64ImageUrl,
};
