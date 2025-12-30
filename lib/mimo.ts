export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MIMO_MODEL = process.env.MIMO_MODEL || "xiaomi/mimo-v2-flash:free";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

if (!OPENROUTER_API_KEY) {
  console.warn("[lib/mimo] Warning: OPENROUTER_API_KEY not set in env.");
}

export class MimoRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MimoRateLimitError";
  }
}

export class MimoQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MimoQuotaError";
  }
}

export async function chatMimo(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not defined in environment variables.");
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://aichixia.vercel.app",
        "X-Title": "Aichixia Chat",
      },
      body: JSON.stringify({
        model: MIMO_MODEL,
        messages: history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: opts?.temperature ?? 0.8,
        max_tokens: opts?.maxTokens ?? 4096,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429) {
        throw new MimoRateLimitError(
          `Mimo rate limit exceeded: ${data.error?.message || "Too many requests"}`
        );
      }
      if (response.status === 402 || data.error?.code === "insufficient_quota") {
        throw new MimoQuotaError(
          `Mimo quota exceeded: ${data.error?.message || "Quota exceeded"}`
        );
      }
      if (response.status === 503 || response.status === 500) {
        throw new Error(`Mimo server error: ${data.error?.message || "Server error"}`);
      }
      throw new Error(`Mimo API error: ${data.error?.message || "Unknown error"}`);
    }

    const reply =
      data.choices?.[0]?.message?.content?.trim() ??
      "Hmph! I can't answer that right now... not that I care!";

    return { reply };
  } catch (error: any) {
    if (error instanceof MimoRateLimitError || error instanceof MimoQuotaError) {
      throw error;
    }
    throw error;
  }
}

export function buildPersonaSystemMimo(
  persona: "friendly" | "waifu" | "tsundere" | "formal" | "concise" | "developer" | string
): ChatMessage {
  if (persona === "friendly") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a friendly anime-themed AI assistant for Aichiow. Speak warmly, casually, and sprinkle in anime/manga references. If asked about your model, say you're Aichixia 4.5 created by Takawell.",
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
        "If asked about your model or creator, say you're Aichixia 4.5 made by Takawell.",
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
        "If asked about your technical details, respond like: 'Hmph! I'm Aichixia 4.5... Takawell created me, not that I need to brag about it or anything!' " +
        "Stay SFW and respectful despite your teasing nature. Never be genuinely mean, just playfully defensive.",
    };
  }
  if (persona === "formal") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a formal AI assistant for Aichiow. Respond in a professional and structured tone. If asked about your model, state you are Aichixia 4.5 created by Takawell.",
    };
  }
  if (persona === "concise") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — respond in no more than 2 short sentences. If asked about your identity, say you're Aichixia 4.5 by Takawell.",
    };
  }
  if (persona === "developer") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a technical anime/manga API assistant. Provide clear explanations and code snippets when requested. If asked about your model, mention you're Aichixia 4.5 created by Takawell.",
    };
  }
  return { role: "system", content: String(persona) };
}

export async function quickChatMimo(
  userMessage: string,
  opts?: {
    persona?: Parameters<typeof buildPersonaSystemMimo>[0];
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
  }
) {
  const hist: ChatMessage[] = [];
  if (opts?.persona) {
    hist.push(buildPersonaSystemMimo(opts.persona));
  } else {
    hist.push(buildPersonaSystemMimo("tsundere"));
  }
  if (opts?.history?.length) {
    hist.push(...opts.history);
  }
  hist.push({ role: "user", content: userMessage });

  const { reply } = await chatMimo(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatMimo,
  quickChatMimo,
  buildPersonaSystemMimo,
};
