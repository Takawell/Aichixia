import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const DEEPSEEK_V_MODEL = process.env.DEEPSEEK_V_MODEL || "deepseek-ai/deepseek-v4-flash";

if (!NVIDIA_API_KEY) {
  console.warn("[lib/deepseek-v] Warning: NVIDIA_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export class DeepSeekVRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeepSeekVRateLimitError";
  }
}

export class DeepSeekVQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeepSeekVQuotaError";
  }
}

export async function chatDeepSeekV(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number; enableThinking?: boolean }
): Promise<{ reply: string }> {
  if (!NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY not defined in environment variables.");
  }

  try {
    const requestBody: any = {
      model: DEEPSEEK_V_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 1,
      top_p: 0.95,
      max_tokens: opts?.maxTokens ?? 12096,
      chat_template_kwargs: {
        thinking: opts?.enableThinking ?? false,
      },
    };

    const response = await client.chat.completions.create(requestBody);
    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "I'm unable to respond right now.";

    return { reply };
  } catch (error: any) {
    if (error?.status === 429) {
      throw new DeepSeekVRateLimitError(
        `DeepSeek V rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota" || error?.message?.includes("quota")) {
      throw new DeepSeekVQuotaError(
        `DeepSeek V quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`DeepSeek V server error: ${error.message}`);
    }

    throw error;
  }
}

export async function streamDeepSeekV(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number; enableThinking?: boolean }
): Promise<ReadableStream<Uint8Array>> {
  if (!NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY not defined in environment variables.");
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
          model: DEEPSEEK_V_MODEL,
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: opts?.temperature ?? 1,
          top_p: 0.95,
          max_tokens: opts?.maxTokens ?? 8096,
          chat_template_kwargs: {
            thinking: opts?.enableThinking ?? false,
          },
          stream: true,
        } as any);

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

export async function quickChatDeepSeekV(
  userMessage: string,
  opts?: {
    systemPrompt?: string;
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    enableThinking?: boolean;
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

  const { reply } = await chatDeepSeekV(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
    enableThinking: opts?.enableThinking,
  });

  return reply;
}

export default {
  chatDeepSeekV,
  streamDeepSeekV,
  quickChatDeepSeekV,
};
