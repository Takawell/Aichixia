export type Role = "user" | "assistant" | "system" | "tool";

export type ChatMessage = {
  role: Role;
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
};

const WORMGPT_BASE_URL = process.env.WORMGPT_BASE_URL;

export class WormgptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WormgptError";
  }
}

export class WormgptRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WormgptRateLimitError";
  }
}

export class WormgptQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WormgptQuotaError";
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

export async function chatWormgpt(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  const userMessages = history.filter((m) => m.role === "user");
  const lastUser = userMessages[userMessages.length - 1];

  if (!lastUser) {
    throw new WormgptError("No user message found in history.");
  }

  const prompt = buildPromptFromHistory(history);

  const url = new URL(WORMGPT_BASE_URL);
  url.searchParams.set("prompt", prompt);

  const response = await fetch(url.toString());

  if (response.status === 429) {
    throw new WormgptRateLimitError("Wormgpt rate limit exceeded.");
  }

  if (response.status === 402) {
    throw new WormgptQuotaError("Wormgpt quota exceeded.");
  }

  if (!response.ok) {
    throw new WormgptError(
      `Wormgpt request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.status || !data.result?.response) {
    throw new WormgptError("Wormgpt returned an invalid response.");
  }

  return { reply: data.result.response.trim() };
}

export async function quickChatWormgpt(
  userMessage: string,
  opts?: {
    history?: ChatMessage[];
  }
): Promise<string> {
  const hist: ChatMessage[] = [];

  if (opts?.history?.length) {
    hist.push(...opts.history);
  }

  hist.push({ role: "user", content: userMessage });

  const { reply } = await chatWormgpt(hist);
  return reply;
}

export default {
  chatWormgpt,
  quickChatWormgpt,
};
