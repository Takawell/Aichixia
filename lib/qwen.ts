export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const QWEN_MODEL = process.env.QWEN_MODEL || "qwen/qwen3-coder";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

if (!OPENROUTER_API_KEY) {
  console.warn("[lib/qwen] Warning: OPENROUTER_API_KEY not set in env.");
}

export class QwenRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QwenRateLimitError";
  }
}

export class QwenQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QwenQuotaError";
  }
}

export async function chatQwen(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not defined in environment variables.");
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://aichixia.vercel.app",
        "X-Title": "Aichixia Chat",
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: opts?.temperature ?? 0.8,
        max_tokens: opts?.maxTokens ?? 4096,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429) {
        throw new QwenRateLimitError(
          `Qwen rate limit exceeded: ${data.error?.message || "Too many requests"}`
        );
      }
      if (response.status === 402 || data.error?.code === "insufficient_quota") {
        throw new QwenQuotaError(
          `Qwen quota exceeded: ${data.error?.message || "Quota exceeded"}`
        );
      }
      if (response.status === 503 || response.status === 500) {
        throw new Error(`Qwen server error: ${data.error?.message || "Server error"}`);
      }
      throw new Error(`Qwen API error: ${data.error?.message || "Unknown error"}`);
    }

    const reply =
      data.choices?.[0]?.message?.content?.trim() ??
      "I can't answer that right now.";

    return { reply };
  } catch (error: any) {
    if (error instanceof QwenRateLimitError || error instanceof QwenQuotaError) {
      throw error;
    }
    throw error;
  }
}

export async function quickChatQwen(
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

  const { reply } = await chatQwen(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatQwen,
  quickChatQwen,
};
