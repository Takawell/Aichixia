export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const HAIKU_API_URL = process.env.HAIKU_API_URL;

if (!HAIKU_API_URL) {
  console.warn("[lib/haiku] Warning: HAIKU_API_URL not set in env.");
}

export class HaikuRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HaikuRateLimitError";
  }
}

export class HaikuQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HaikuQuotaError";
  }
}

function extractSystemPrompt(history: ChatMessage[]): string {
  return history
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n");
}

function extractLastUserMessage(history: ChatMessage[]): string {
  const conversation = history.filter((m) => m.role !== "system");
  const lastUser = [...conversation].reverse().find((m) => m.role === "user");
  return lastUser?.content ?? "";
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function chatHaiku(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!HAIKU_API_URL) {
    throw new Error("HAIKU_API_URL not defined in environment variables.");
  }

  try {
    const message = extractLastUserMessage(history);
    const systemPrompt = extractSystemPrompt(history);

    const params = new URLSearchParams({
      message,
      model: "claude",
      sessionId: generateSessionId(),
      temperature: String(opts?.temperature ?? 1.0),
      maxTokens: String(opts?.maxTokens ?? 8092),
    });

    if (systemPrompt) {
      params.set("systemPrompt", systemPrompt);
    }

    const url = `${HAIKU_API_URL}?${params.toString()}`;

    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      if (response.status === 429) {
        throw new HaikuRateLimitError(`Haiku rate limit exceeded: ${response.statusText}`);
      }
      if (response.status === 402) {
        throw new HaikuQuotaError(`Haiku quota exceeded: ${response.statusText}`);
      }
      throw new Error(`Haiku server error (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();

    const reply =
      data?.answer?.trim() ??
      "I'm unable to respond right now.";

    return { reply };
  } catch (error: any) {
    if (error instanceof HaikuRateLimitError || error instanceof HaikuQuotaError) {
      throw error;
    }

    throw error;
  }
}

export async function quickChatHaiku(
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

  const { reply } = await chatHaiku(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatHaiku,
  quickChatHaiku,
};
