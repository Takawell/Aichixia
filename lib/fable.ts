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

const XKIRO_API_KEY = process.env.XKIRO_API_KEY;
const FABLE_MODEL = process.env.FABLE_MODEL || "anthropic/claude-fable-5";

if (!XKIRO_API_KEY) {
  console.warn("[lib/fable] Warning: XKIRO_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: XKIRO_API_KEY,
  baseURL: "https://api.xkiro.com/v1",
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

export class FableRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FableRateLimitError";
  }
}

export class FableQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FableQuotaError";
  }
}

export async function chatFable(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!XKIRO_API_KEY) {
    throw new Error("XKIRO_API_KEY not defined in environment variables.");
  }

  try {
    const requestBody: any = {
      model: FABLE_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 1,
      top_p: 0.95,
      max_tokens: opts?.maxTokens ?? 2048,
    };

    const response = await client.chat.completions.create(requestBody);
    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "I'm unable to respond right now.";

    return { reply };
  } catch (error: any) {
    if (error?.status === 429) {
      throw new FableRateLimitError(
        `Fable rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota" || error?.message?.includes("quota")) {
      throw new FableQuotaError(
        `Fable quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Fable server error: ${error.message}`);
    }

    throw error;
  }
}

export async function streamFable(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  if (!XKIRO_API_KEY) {
    throw new Error("XKIRO_API_KEY not defined in environment variables.");
  }

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (text: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      };

      const enqueueError = (message: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
      };

      const done = () => {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      };

      try {
        const streamResponse = await client.chat.completions.create({
          model: FABLE_MODEL,
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
          })) as any,
          temperature: opts?.temperature ?? 1,
          top_p: 0.95,
          max_tokens: opts?.maxTokens ?? 2048,
          stream: true,
        });

        for await (const chunk of streamResponse) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) enqueue(delta);
        }

        done();
      } catch (error: any) {
        let message = "An unexpected error occurred.";
        if (error?.status === 429) {
          message = "Rate limit exceeded. Please wait a moment.";
        } else if (error?.status === 402 || error?.code === "insufficient_quota" || error?.message?.includes("quota")) {
          message = "Quota exceeded. Please try again later.";
        } else if (error?.status === 503 || error?.status === 500) {
          message = "Server error. Please try again.";
        } else if (error?.message?.includes("<!DOCTYPE") || error?.message?.includes("not valid JSON")) {
          message = "Model returned an invalid response. Please try again.";
        }
        enqueueError(message);
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });
}

export async function quickChatFable(
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

  const { reply } = await chatFable(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatFable,
  streamFable,
  quickChatFable,
  buildImageMessage,
  buildBase64ImageUrl,
};
