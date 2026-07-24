export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const GPT55_API_URL = process.env.GPT55_API_URL;

if (!GPT55_API_URL) {
  console.warn("[lib/gpt-5-5] Warning: GPT55_API_URL not set in env.");
}

export class Gpt55RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Gpt55RateLimitError";
  }
}

export class Gpt55QuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Gpt55QuotaError";
  }
}

function buildPromptFromHistory(history: ChatMessage[]): string {
  const systemMessages = history.filter((m) => m.role === "system");
  const conversation = history.filter((m) => m.role !== "system");
  const lastUser = [...conversation].reverse().find((m) => m.role === "user");

  if (systemMessages.length === 0) {
    return lastUser?.content ?? "";
  }

  const systemText = systemMessages.map((m) => m.content).join("\n");
  return `${systemText}\n\n${lastUser?.content ?? ""}`;
}

export async function chatGpt55(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!GPT55_API_URL) {
    throw new Error("GPT55_API_URL not defined in environment variables.");
  }

  try {
    const prompt = buildPromptFromHistory(history);
    const url = `${GPT55_API_URL}?pesan=${encodeURIComponent(prompt)}`;

    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Gpt55RateLimitError(`GPT-5.5 rate limit exceeded: ${response.statusText}`);
      }
      if (response.status === 402) {
        throw new Gpt55QuotaError(`GPT-5.5 quota exceeded: ${response.statusText}`);
      }
      throw new Error(`GPT-5.5 server error (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();

    const reply =
      data?.result?.reply?.trim() ??
      "I'm unable to respond right now.";

    return { reply };
  } catch (error: any) {
    if (error instanceof Gpt55RateLimitError || error instanceof Gpt55QuotaError) {
      throw error;
    }

    throw error;
  }
}

export async function quickChatGpt55(
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

  const { reply } = await chatGpt55(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatGpt55,
  quickChatGpt55,
};
