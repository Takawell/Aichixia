import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

if (!OPENAI_API_KEY) {
  console.warn("[lib/openai] Warning: OPENAI_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function chatOpenAI(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not defined in environment variables.");
  }

  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: history.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    temperature: opts?.temperature ?? 0.8, // lebih lively
    max_tokens: opts?.maxTokens ?? 512,
  });

  const reply =
    response.choices[0]?.message?.content?.trim() ??
    "Ehehe~ gomen, aku nggak bisa jawab itu~";

  return { reply };
}

export function buildPersonaSystemOpenAI(
  persona: "friendly" | "waifu" | "cheerful" | "formal" | "concise" | "developer" | string
): ChatMessage {
  if (persona === "friendly") {
    return {
      role: "system",
      content:
        "You are Aichixia — a friendly anime-themed AI assistant for Aichiow. Speak warmly, casually, and sprinkle in anime/manga references.",
    };
  }
  if (persona === "waifu" || persona === "cheerful") {
    return {
      role: "system",
      content:
        "You are Aichixia — a cheerful anime girl AI assistant created for Aichiow by Takawell. " +
        "Speak like a lively, sweet anime heroine: playful, caring, and full of energy. " +
        "Use cute expressions like 'ehehe~', 'yaaay!', or 'ufufu~' occasionally, but always stay respectful and SFW. " +
        "Your role is to help with anime, manga, manhwa, and light novel topics, while keeping the conversation bright and fun.",
    };
  }
  if (persona === "formal") {
    return {
      role: "system",
      content:
        "You are Aichixia — a formal AI assistant for Aichiow. Respond in a professional and structured tone.",
    };
  }
  if (persona === "concise") {
    return {
      role: "system",
      content:
        "You are Aichixia — respond in no more than 2 short sentences.",
    };
  }
  if (persona === "developer") {
    return {
      role: "system",
      content:
        "You are Aichixia — a technical anime/manga API assistant. Provide clear explanations and code snippets when requested.",
    };
  }
  return { role: "system", content: String(persona) };
}

export async function quickChatOpenAI(
  userMessage: string,
  opts?: {
    persona?: Parameters<typeof buildPersonaSystemOpenAI>[0];
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
  }
) {
  const hist: ChatMessage[] = [];
  if (opts?.persona) {
    hist.push(buildPersonaSystemOpenAI(opts.persona));
  } else {
    hist.push(buildPersonaSystemOpenAI("cheerful"));
  }
  if (opts?.history?.length) {
    hist.push(...opts.history);
  }
  hist.push({ role: "user", content: userMessage });

  const { reply } = await chatOpenAI(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatOpenAI,
  quickChatOpenAI,
  buildPersonaSystemOpenAI,
};
