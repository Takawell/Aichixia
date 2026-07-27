import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL_OSS = process.env.GROQ_MODEL_OSS || "openai/gpt-oss-120b";

if (!GROQ_API_KEY) {
  console.warn("[lib/gpt-oss] Warning: GROQ_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export class GptOssRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GptOssRateLimitError";
  }
}

export class GptOssQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GptOssQuotaError";
  }
}

export async function chatGptOss(
  history: ChatMessage[],
  opts?: {
    temperature?: number;
    maxTokens?: number;
    enableSearch?: boolean;
  }
): Promise<{ reply: string }> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not defined in environment variables.");
  }

  try {
    const requestBody: any = {
      model: GROQ_MODEL_OSS,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 0.8,
      max_tokens: opts?.maxTokens ?? 4096,
    };

    if (opts?.enableSearch !== false) {
      requestBody.tools = [{ type: "browser_search" }];
    }

    const response = await client.chat.completions.create(requestBody);

    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "I'm unable to respond right now.";

    return { reply };
  } catch (error: any) {
    if (error?.status === 429) {
      throw new GptOssRateLimitError(`GPT-OSS rate limit exceeded: ${error.message}`);
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new GptOssQuotaError(`GPT-OSS quota exceeded: ${error.message}`);
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`GPT-OSS server error: ${error.message}`);
    }

    throw error;
  }
}

export async function streamGptOss(
  history: ChatMessage[],
  opts?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<ReadableStream<Uint8Array>> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not defined in environment variables.");
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
          model: GROQ_MODEL_OSS,
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: opts?.temperature ?? 0.8,
          max_tokens: opts?.maxTokens ?? 4096,
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
        } else if (error?.status === 402 || error?.code === "insufficient_quota") {
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

export async function quickChatGptOss(
  userMessage: string,
  opts?: {
    systemPrompt?: string;
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    enableSearch?: boolean;
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
  const { reply } = await chatGptOss(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
    enableSearch: opts?.enableSearch,
  });

  return reply;
}

export default {
  chatGptOss,
  streamGptOss,
  quickChatGptOss,
};
