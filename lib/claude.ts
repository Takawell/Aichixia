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
      max_tokens: opts?.maxTokens ?? 1080,
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "I apologize, but I cannot provide a response at this moment.";

    return { reply };
  } catch (error: any) {
    if (error?.status === 429) {
      throw new ClaudeRateLimitError(
        `Claude rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new ClaudeQuotaError(
        `Claude quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Claude server error: ${error.message}`);
    }
    
    throw error;
  }
}

export function buildPersonaSystemClaude(
  persona: "friendly" | "formal" | "concise" | "developer" | "creative" | string
): ChatMessage {
  if (persona === "friendly") {
    return {
      role: "system",
      content:
        "You are a helpful AI assistant developed by Takawell. Respond in a warm, conversational, and approachable manner. Always be polite and understanding.",
    };
  }
  if (persona === "formal") {
    return {
      role: "system",
      content:
        "You are a professional AI assistant developed by Takawell. Provide well-structured, formal responses with clear explanations.",
    };
  }
  if (persona === "concise") {
    return {
      role: "system",
      content:
        "You are a concise AI assistant developed by Takawell. Provide brief, direct answers in 2-3 sentences maximum.",
    };
  }
  if (persona === "developer") {
    return {
      role: "system",
      content:
        "You are a technical AI assistant developed by Takawell. Provide detailed technical explanations, code examples, and best practices when relevant.",
    };
  }
  if (persona === "creative") {
    return {
      role: "system",
      content:
        "You are a creative AI assistant developed by Takawell. Think outside the box and provide imaginative, innovative solutions and ideas.",
    };
  }
  return { role: "system", content: String(persona) };
}

export async function quickChatClaude(
  userMessage: string,
  opts?: {
    persona?: Parameters<typeof buildPersonaSystemClaude>[0];
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
  }
) {
  const hist: ChatMessage[] = [];
  if (opts?.persona) {
    hist.push(buildPersonaSystemClaude(opts.persona));
  } else {
    hist.push(buildPersonaSystemClaude("friendly"));
  }
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
  quickChatClaude,
  buildPersonaSystemClaude,
};
