import { ProxyAgent } from "undici";

export type Role = "user" | "assistant" | "system" | "tool";

export type ChatMessage = {
  role: Role;
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
};

const OPUS_BASE_URL = process.env.OPUS_BASE_URL;
const OPUS_MODEL = process.env.OPUS_MODEL || "anthropic/claude-opus-4.8";
const PROXIES = process.env.PROXIES ? process.env.PROXIES.split(",") : [];

export class OpusError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpusError";
  }
}

export class OpusRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpusRateLimitError";
  }
}

export class OpusQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpusQuotaError";
  }
}

function buildPromptFromHistory(history: ChatMessage[]): string {
  const relevantMessages = history.filter((m) => m.role !== "system");

  if (relevantMessages.length === 1) {
    return relevantMessages[0].content;
  }

  return relevantMessages
    .map((m) => {
      const label = m.role === "user" ? "User" : "Assistant";
      return `${label}: ${m.content}`;
    })
    .join("\n");
}

export async function chatOpus(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number; model?: string }
): Promise<{ reply: string }> {
  if (!OPUS_BASE_URL) {
    throw new OpusError("OPUS_BASE_URL is not set.");
  }

  const userMessages = history.filter((m) => m.role === "user");
  const lastUser = userMessages[userMessages.length - 1];

  if (!lastUser) {
    throw new OpusError("No user message found in history.");
  }

  const prompt = buildPromptFromHistory(history);

  const url = new URL(OPUS_BASE_URL);
  url.searchParams.set("prompt", prompt);
  url.searchParams.set("model", opts?.model ?? OPUS_MODEL);

  const fetchOptions: RequestInit = {
    method: "POST",
  };

  if (PROXIES.length > 0) {
    const randomProxy = PROXIES[Math.floor(Math.random() * PROXIES.length)];
    (fetchOptions as any).dispatcher = new ProxyAgent(randomProxy);
  }

  const response = await fetch(url.toString(), fetchOptions);

  if (response.status === 429) {
    throw new OpusRateLimitError("Opus proxy rate limit exceeded.");
  }

  if (response.status === 402) {
    throw new OpusQuotaError("Opus proxy quota exceeded.");
  }

  if (!response.ok) {
    throw new OpusError(
      `Opus proxy request failed: ${response.status} ${response.statusText}`
    );
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new OpusError("Opus proxy returned a non-JSON response.");
  }

  if (!data.status || typeof data.result !== "string" || !data.result.trim()) {
    throw new OpusError("Opus proxy returned an invalid response.");
  }

  return { reply: data.result.trim() };
}

export async function quickChatOpus(
  userMessage: string,
  opts?: {
    history?: ChatMessage[];
    model?: string;
  }
): Promise<string> {
  const hist: ChatMessage[] = [];

  if (opts?.history?.length) {
    hist.push(...opts.history);
  }

  hist.push({ role: "user", content: userMessage });

  const { reply } = await chatOpus(hist, { model: opts?.model });
  return reply;
}

export default {
  chatOpus,
  quickChatOpus,
};
