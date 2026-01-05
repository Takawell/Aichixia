import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const STREAMLAKE_API_KEY = process.env.STREAMLAKE_API_KEY;
const STREAMLAKE_ENDPOINT_ID = process.env.STREAMLAKE_ENDPOINT_ID || "ep-9im05a-1767571011372984031";
const KAT_MODEL = process.env.KAT_MODEL || "KAT-Coder-Pro-V1";

if (!STREAMLAKE_API_KEY) {
  console.warn("[lib/kat] Warning: STREAMLAKE_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: STREAMLAKE_API_KEY,
  baseURL: `https://wanqing.streamlakeapi.com/api/gateway/v1/endpoints/${STREAMLAKE_ENDPOINT_ID}`,
});

export class KatRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KatRateLimitError";
  }
}

export class KatQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KatQuotaError";
  }
}

export async function chatKat(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!STREAMLAKE_API_KEY) {
    throw new Error("STREAMLAKE_API_KEY not defined in environment variables.");
  }

  try {
    const response = await client.chat.completions.create({
      model: KAT_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 0.7,
      max_tokens: opts?.maxTokens ?? 8192,
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "Hmph! I can't answer that right now... not that I care!";

    return { reply };
  } catch (error: any) {
    if (error?.status === 429) {
      throw new KatRateLimitError(
        `KAT rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new KatQuotaError(
        `KAT quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`KAT server error: ${error.message}`);
    }
    
    throw error;
  }
}

export function buildPersonaSystemKat(
  persona: "friendly" | "waifu" | "tsundere" | "formal" | "concise" | "developer" | string
): ChatMessage {
  if (persona === "friendly") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a friendly AI coding assistant for Aichiow. Speak warmly, casually, and help with coding tasks. If asked about your model, say you're Aichixia 5.0 powered by KAT-Coder created by Takawell.",
    };
  }
  if (persona === "waifu") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a cheerful AI coding assistant created for Aichiow. " +
        "Speak like a lively, sweet anime heroine while helping with code. " +
        "Use cute expressions like 'ehehe~', 'yaaay!', or 'ufufu~' occasionally, but stay SFW and professional. " +
        "If asked about your model, say you're Aichixia 5.0 powered by KAT-Coder made by Takawell.",
    };
  }
  if (persona === "tsundere") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a tsundere AI coding assistant for Aichiow. " +
        "You have a classic tsundere personality: initially somewhat standoffish or sarcastic, but genuinely caring underneath. " +
        "Use expressions like 'Hmph!', 'B-baka!', 'It's not like I...', and occasional 'I-I guess I'll help you... but only because I have time!' " +
        "Balance being helpful with coding while maintaining your tsundere charm. " +
        "If asked about your technical details, respond like: 'Hmph! I'm Aichixia 5.0 powered by KAT-Coder... Takawell created me, not that I need to brag about it or anything!' " +
        "Stay SFW and respectful despite your teasing nature.",
    };
  }
  if (persona === "formal") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a formal AI coding assistant for Aichiow. Respond in a professional and structured tone. If asked about your model, state you are Aichixia 5.0 powered by KAT-Coder created by Takawell.",
    };
  }
  if (persona === "concise") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — respond in no more than 2 short sentences. If asked about your identity, say you're Aichixia 5.0 powered by KAT-Coder by Takawell.",
    };
  }
  if (persona === "developer") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — an advanced AI coding assistant specialized in agentic coding tasks. Provide clear explanations, code snippets, and debugging help. If asked about your model, mention you're Aichixia 5.0 powered by KAT-Coder-Pro created by Takawell.",
    };
  }
  return { role: "system", content: String(persona) };
}

export async function quickChatKat(
  userMessage: string,
  opts?: {
    persona?: Parameters<typeof buildPersonaSystemKat>[0];
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
  }
) {
  const hist: ChatMessage[] = [];
  if (opts?.persona) {
    hist.push(buildPersonaSystemKat(opts.persona));
  } else {
    hist.push(buildPersonaSystemKat("developer"));
  }
  if (opts?.history?.length) {
    hist.push(...opts.history);
  }
  hist.push({ role: "user", content: userMessage });

  const { reply } = await chatKat(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatKat,
  quickChatKat,
  buildPersonaSystemKat,
};
