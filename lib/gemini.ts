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

export type GeminiOptions = {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
  extraBody?: Record<string, any>;
  returnRaw?: boolean;
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

if (!GEMINI_API_KEY) {
  console.warn("[lib/gemini] Warning: GEMINI_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export function buildImageMessage(
  text: string,
  imageUrls: string[]
): ChatMessage {
  const parts: ContentPart[] = [{ type: "text", text }];

  for (const url of imageUrls) {
    parts.push({
      type: "image_url",
      image_url: { url },
    });
  }

  return {
    role: "user",
    content: parts,
  };
}

export function buildBase64ImageUrl(
  base64Data: string,
  mediaType: string
): string {
  return `data:${mediaType};base64,${base64Data}`;
}

export class GeminiRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiRateLimitError";
  }
}

export class GeminiQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiQuotaError";
  }
}

function normalizeMessages(history: ChatMessage[]) {
  return history.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

function buildExtraBody(opts: GeminiOptions) {
  if (!opts.extraBody && opts.topK === undefined) {
    return undefined;
  }

  return {
    ...(opts.extraBody || {}),
    ...(opts.topK !== undefined
      ? {
          google: {
            ...((opts.extraBody as any)?.google || {}),
            top_k: opts.topK,
          },
        }
      : {}),
  };
}

function handleGeminiError(error: any): never {
  if (error?.status === 429) {
    throw new GeminiRateLimitError(
      `Gemini rate limit exceeded: ${
        error?.message || "Too many requests"
      }`
    );
  }

  if (
    error?.status === 402 ||
    error?.code === "insufficient_quota" ||
    error?.message?.toLowerCase?.().includes("quota") ||
    error?.message?.includes("RESOURCE_EXHAUSTED")
  ) {
    throw new GeminiQuotaError(
      `Gemini quota exceeded: ${
        error?.message || "Quota exceeded"
      }`
    );
  }

  if (error?.status === 503 || error?.status === 500) {
    throw new Error(
      `Gemini server error: ${
        error?.message || "Server error"
      }`
    );
  }

  if (
    error?.message?.includes("<!DOCTYPE") ||
    error?.message?.includes("not valid JSON")
  ) {
    throw new Error(
      "Gemini returned an invalid response. Please try again."
    );
  }

  throw error;
}

export async function chatGemini(
  history: ChatMessage[],
  opts: GeminiOptions = {}
): Promise<{ reply: string; raw?: any }> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY not defined in environment variables."
    );
  }

  try {
    const extraBody = buildExtraBody(opts);

    const response = await client.chat.completions.create({
      model: GEMINI_MODEL,
      messages: normalizeMessages(history),
      temperature: opts.temperature ?? 0.8,
      top_p: opts.topP ?? 0.95,
      max_tokens: opts.maxTokens ?? 8192,
      ...(opts.reasoningEffort !== undefined
        ? { reasoning_effort: opts.reasoningEffort }
        : {}),
      ...(extraBody !== undefined
        ? { extra_body: extraBody }
        : {}),
    } as any);

    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "I'm unable to respond right now.";

    return {
      reply,
      raw: opts.returnRaw ? response : undefined,
    };
  } catch (error: any) {
    handleGeminiError(error);
  }
}

export async function streamGemini(
  history: ChatMessage[],
  opts: GeminiOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY not defined in environment variables."
    );
  }

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (text: string) => {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ text })}\n\n`
          )
        );
      };

      const enqueueError = (message: string) => {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: message })}\n\n`
          )
        );
      };

      const done = () => {
        controller.enqueue(
          encoder.encode("data: [DONE]\n\n")
        );
        controller.close();
      };

      try {
        const extraBody = buildExtraBody(opts);

        const streamResponse =
          await client.chat.completions.create({
            model: GEMINI_MODEL,
            messages: normalizeMessages(history),
            temperature: opts.temperature ?? 0.8,
            top_p: opts.topP ?? 0.95,
            max_tokens: opts.maxTokens ?? 8192,
            ...(opts.reasoningEffort !== undefined
              ? { reasoning_effort: opts.reasoningEffort }
              : {}),
            ...(extraBody !== undefined
              ? { extra_body: extraBody }
              : {}),
            stream: true,
          } as any);

        for await (const chunk of streamResponse as any) {
          const delta =
            chunk?.choices?.[0]?.delta?.content;

          if (delta) {
            enqueue(delta);
          }
        }

        done();
      } catch (error: any) {
        let message = "An unexpected error occurred.";

        if (error?.status === 429) {
          message =
            "Rate limit exceeded. Please wait a moment.";
        } else if (
          error?.status === 402 ||
          error?.code === "insufficient_quota" ||
          error?.message?.toLowerCase?.().includes("quota") ||
          error?.message?.includes("RESOURCE_EXHAUSTED")
        ) {
          message =
            "Quota exceeded. Please try again later.";
        } else if (
          error?.status === 503 ||
          error?.status === 500
        ) {
          message =
            "Gemini server error. Please try again.";
        } else if (
          error?.message?.includes("<!DOCTYPE") ||
          error?.message?.includes("not valid JSON")
        ) {
          message =
            "Gemini returned an invalid response. Please try again.";
        }

        enqueueError(message);

        controller.enqueue(
          encoder.encode("data: [DONE]\n\n")
        );

        controller.close();
      }
    },
  });
}

export async function quickChatGemini(
  userMessage: string,
  opts?: {
    systemPrompt?: string;
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
    extraBody?: Record<string, any>;
    imageUrls?: string[];
  }
) {
  const hist: ChatMessage[] = [];

  if (opts?.systemPrompt) {
    hist.push({
      role: "system",
      content: opts.systemPrompt,
    });
  }

  if (opts?.history?.length) {
    hist.push(...opts.history);
  }

  if (opts?.imageUrls?.length) {
    hist.push(
      buildImageMessage(
        userMessage,
        opts.imageUrls
      )
    );
  } else {
    hist.push({
      role: "user",
      content: userMessage,
    });
  }

  const { reply } = await chatGemini(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
    topP: opts?.topP,
    topK: opts?.topK,
    reasoningEffort: opts?.reasoningEffort,
    extraBody: opts?.extraBody,
  });

  return reply;
}

export default {
  chatGemini,
  streamGemini,
  quickChatGemini,
  buildImageMessage,
  buildBase64ImageUrl,
};
