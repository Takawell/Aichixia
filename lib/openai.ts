import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn("[lib/openai] Warning: OPENAI_API_KEY not set in env.");
}

const client = new OpenAI({ apiKey: OPENAI_API_KEY! });

async function chatModel(
  model: string,
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
) {
  const response = await client.chat.completions.create({
    model,
    messages: history.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    temperature: opts?.temperature ?? 0.8,
    max_tokens: opts?.maxTokens ?? 512,
  });

  return response.choices[0]?.message?.content?.trim() ??
    "Ehehe~ gomen, aku nggak bisa jawab itu~";
}

export async function quickChatOpenAI(
  userMessage: string,
  opts?: {
    persona?: "friendly" | "waifu" | "cheerful" | "formal" | "concise" | "developer" | string;
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

  if (opts?.history?.length) hist.push(...opts.history);

  hist.push({ role: "user", content: userMessage });

  try {
    return await chatModel("gpt-5", hist, {
      temperature: opts?.temperature,
      maxTokens: opts?.maxTokens,
    });
  } catch (err: any) {
    if (err?.code === "rate_limit_exceeded" || err?.status === 429) {
      console.warn("[quickChatOpenAI] GPT-5 rate limit exceeded, fallback to GPT-4o-mini");
      return await chatModel("gpt-4o-mini", hist, {
        temperature: opts?.temperature,
        maxTokens: opts?.maxTokens,
      });
    }
    throw err; 
  }
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
      content: "You are Aichixia — respond in no more than 2 short sentences.",
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

export default {
  quickChatOpenAI,
  buildPersonaSystemOpenAI,
};
