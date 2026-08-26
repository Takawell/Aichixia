import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = process.env.CLAUDE_API_URL;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-5-20251101";

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
  if (!CLAUDE_API_KEY) {
    throw new Error("CLAUDE_API_KEY not defined in environment variables.");
  }

  if (!CLAUDE_API_URL) {
    throw new Error("CLAUDE_API_URL not defined in environment variables.");
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
          model: CLAUDE_MODEL,
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: opts?.temperature ?? 0.8,
          max_tokens: opts?.maxTokens ?? 4092,
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
