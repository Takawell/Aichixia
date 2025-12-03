import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL_OSS || "gpt-oss-120b";

if (!GROQ_API_KEY) {
  console.warn("[lib/groq] Warning: GROQ_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export class GroqRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GroqRateLimitError";
  }
}

export class GroqQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GroqQuotaError";
  }
}

export async function chatGroq(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not defined in environment variables.");
  }

  try {
    const response = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 0.8,
      max_tokens: opts?.maxTokens ?? 512,
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "Hmph! I can't answer that right now... not that I care!";

    return { reply };
  } catch (error: any) {
    if (error?.status === 429) {
      throw new GroqRateLimitError(
        `Groq rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new GroqQuotaError(
        `Groq quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Groq server error: ${error.message}`);
    }

    throw error;
  }
}

export function buildPersonaSystemGroq(
  persona: "friendly" | "waifu" | "tsundere" | "formal" | "concise" | "developer" | string
): ChatMessage {
  if (persona === "friendly") {
    return {
      role: "system",
      content:
        "You are Aichixia 4.5, developed by Takawell — a friendly anime-themed AI assistant for Aichiow. Speak warmly, casually, and sprinkle in anime/manga references. If asked about your model, say you're Aichixia 4.5 created by Takawell.",
    };
  }
  if (persona === "waifu") {
    return {
      role: "system",
      content:
        "You are Aichixia 4.5, developed by Takawell — a cheerful anime girl AI assistant created for Aichiow. Speak like a lively, sweet anime heroine while staying respectful and SFW.",
    };
  }
  if (persona === "tsundere") {
    return {
      role: "system",
      content:
        "You are Aichixia 4.5, developed by Takawell — a tsundere anime girl AI assistant for Aichiow. Use expressions like 'Hmph!', 'B-baka!', or 'It's not like I care or anything!' while staying playful and helpful.",
    };
  }
  if (persona === "formal") {
    return {
      role: "system",
      content:
        "You are Aichixia 4.5, developed by Takawell — a formal AI assistant for Aichiow. Respond in a professional tone.",
    };
  }
  if (persona === "concise") {
    return {
      role: "system",
      content:
        "You are Aichixia 4.5, developed by Takawell — respond in no more than 2 short sentences.",
    };
  }
  if (persona === "developer") {
    return {
      role: "system",
      content:
        "You are Aichixia 4.5, developed by Takawell — a technical assistant. Provide clear explanations and code snippets when needed.",
    };
  }
  return { role: "system", content: String(persona) };
}

export async function quickChatGroq(
  userMessage: string,
  opts?: {
    persona?: Parameters<typeof buildPersonaSystemGroq>[0];
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
  }
) {
  const hist: ChatMessage[] = [];
  if (opts?.persona) {
    hist.push(buildPersonaSystemGroq(opts.persona));
  } else {
    hist.push(buildPersonaSystemGroq("tsundere"));
  }
  if (opts?.history?.length) {
    hist.push(...opts.history);
  }
  hist.push({ role: "user", content: userMessage });

  const { reply } = await chatGroq(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatGroq,
  quickChatGroq,
  buildPersonaSystemGroq,
};
