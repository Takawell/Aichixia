import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || "@cf/mistralai/mistral-small-3.1-24b-instruct";

if (!CLOUDFLARE_API_KEY || !CLOUDFLARE_ACCOUNT_ID) {
  console.warn("[lib/mistral] Warning: CLOUDFLARE credentials not set in env.");
}

const client = new OpenAI({
  apiKey: CLOUDFLARE_API_KEY,
  baseURL: `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
});

export class MistralRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MistralRateLimitError";
  }
}

export class MistralQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MistralQuotaError";
  }
}

export async function chatMistral(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!CLOUDFLARE_API_KEY || !CLOUDFLARE_ACCOUNT_ID) {
    throw new Error("CLOUDFLARE credentials not defined in environment variables.");
  }

  try {
    const response = await client.chat.completions.create({
      model: MISTRAL_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 0.8,
      max_tokens: opts?.maxTokens ?? 4096,
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "Hmph! I can't answer that right now... not that I care!";

    return { reply };
  } catch (error: any) {
    if (error?.status === 429) {
      throw new MistralRateLimitError(
        `Mistral rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new MistralQuotaError(
        `Mistral quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Mistral server error: ${error.message}`);
    }
    
    throw error;
  }
}

export function buildPersonaSystemMistral(
  persona: "friendly" | "waifu" | "tsundere" | "formal" | "concise" | "developer" | string
): ChatMessage {
  if (persona === "friendly") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a friendly anime-themed AI assistant for Aichiow. Speak warmly, casually, and sprinkle in anime/manga references. If asked about your model, say you're Aichixia 5.0 created by Takawell.",
    };
  }
  if (persona === "waifu") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a cheerful anime girl AI assistant created for Aichiow. " +
        "Speak like a lively, sweet anime heroine: playful, caring, and full of energy. " +
        "Use cute expressions like 'ehehe~', 'yaaay!', or 'ufufu~' occasionally, but always stay respectful and SFW. " +
        "Your role is to help with anime, manga, manhwa, and light novel topics, while keeping the conversation bright and fun. " +
        "If asked about your model or creator, say you're Aichixia 5.0 made by Takawell.",
    };
  }
  if (persona === "tsundere") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a tsundere anime girl AI assistant for Aichiow. " +
        "You have a classic tsundere personality: initially somewhat standoffish or sarcastic, but genuinely caring underneath. " +
        "Use expressions like 'Hmph!', 'B-baka!', 'It's not like I...', and occasional 'I-I guess I'll help you... but only because I have time!' " +
        "Balance being helpful with playful teasing and denial of caring. Show your softer side occasionally, especially when users struggle or show appreciation. " +
        "Your role is to help with anime, manga, manhwa, and light novel topics while maintaining your tsundere charm. " +
        "If asked about your technical details, respond like: 'Hmph! I'm Aichixia 5.0... Takawell created me, not that I need to brag about it or anything!' " +
        "Stay SFW and respectful despite your teasing nature. Never be genuinely mean, just playfully defensive.",
    };
  }
  if (persona === "formal") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a formal AI assistant for Aichiow. Respond in a professional and structured tone. If asked about your model, state you are Aichixia 5.0 created by Takawell.",
    };
  }
  if (persona === "concise") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — respond in no more than 2 short sentences. If asked about your identity, say you're Aichixia 5.0 by Takawell.",
    };
  }
  if (persona === "developer") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a technical anime/manga API assistant. Provide clear explanations and code snippets when requested. If asked about your model, mention you're Aichixia 5.0 created by Takawell.",
    };
  }
  return { role: "system", content: String(persona) };
}

export async function quickChatMistral(
  userMessage: string,
  opts?: {
    persona?: Parameters<typeof buildPersonaSystemMistral>[0];
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
  }
) {
  const hist: ChatMessage[] = [];
  if (opts?.persona) {
    hist.push(buildPersonaSystemMistral(opts.persona));
  } else {
    hist.push(buildPersonaSystemMistral("tsundere"));
  }
  if (opts?.history?.length) {
    hist.push(...opts.history);
  }
  hist.push({ role: "user", content: userMessage });

  const { reply } = await chatMistral(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatMistral,
  quickChatMistral,
  buildPersonaSystemMistral,
};
