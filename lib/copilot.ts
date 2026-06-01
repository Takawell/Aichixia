export type Role = "user" | "assistant" | "system" | "tool";

export type ChatMessage = {
  role: Role;
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
};

const COPILOT_BASE_URL =
  process.env.COPILOT_BASE_URL;

export class CopilotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CopilotError";
  }
}

export class CopilotRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CopilotRateLimitError";
  }
}

export class CopilotQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CopilotQuotaError";
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

export async function chatCopilot(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  const userMessages = history.filter((m) => m.role === "user");
  const lastUser = userMessages[userMessages.length - 1];

  if (!lastUser) {
    throw new CopilotError("No user message found in history.");
  }

  const prompt = buildPromptFromHistory(history);

  const url = new URL(COPILOT_BASE_URL);
  url.searchParams.set("q", prompt);

  const response = await fetch(url.toString());

  if (response.status === 429) {
    throw new CopilotRateLimitError("Copilot rate limit exceeded.");
  }

  if (response.status === 402) {
    throw new CopilotQuotaError("Copilot quota exceeded.");
  }

  if (!response.ok) {
    throw new CopilotError(
      `Copilot request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.status || !data.result?.text) {
    throw new CopilotError("Copilot returned an invalid response.");
  }

  return { reply: data.result.text.trim() };
}

export async function quickChatCopilot(
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

  const { reply } = await chatCopilot(hist);
  return reply;
}

export default {
  chatCopilot,
  quickChatCopilot,
};
