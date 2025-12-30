import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const SAMBANOVA_API_KEY = process.env.SAMBANOVA_API_KEY;
const DEEPSEEK_V_MODEL = process.env.DEEPSEEK_V_MODEL || "DeepSeek-V3.1";

if (!SAMBANOVA_API_KEY) {
  console.warn("[lib/deepseek-v] Warning: SAMBANOVA_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: SAMBANOVA_API_KEY,
  baseURL: "https://api.sambanova.ai/v1",
});

export class DeepSeekVRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeepSeekVRateLimitError";
  }
}

export class DeepSeekVQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeepSeekVQuotaError";
  }
}

export async function chatDeepSeekV(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number; enableThinking?: boolean }
): Promise<{ reply: string }> {
  if (!SAMBANOVA_API_KEY) {
    throw new Error("SAMBANOVA_API_KEY not defined in environment variables.");
  }

  try {
    const requestBody: any = {
      model: DEEPSEEK_V_MODEL,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: opts?.temperature ?? 0.7,
      max_tokens: opts?.maxTokens ?? 4096,
    };

    if (opts?.enableThinking) {
      requestBody.chat_template_kwargs = {
        enable_thinking: true,
      };
    }

    const response = await client.chat.completions.create(requestBody);

    const reply =
      response.choices[0]?.message?.content?.trim() ??
      "Hmph! I can't answer that right now... not that I care!";

    return { reply };
  } catch (error: any) {
    if (error?.status === 429) {
      throw new DeepSeekVRateLimitError(
        `DeepSeek V rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota" || error?.message?.includes("quota")) {
      throw new DeepSeekVQuotaError(
        `DeepSeek V quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`DeepSeek V server error: ${error.message}`);
    }
    
    throw error;
  }
}

export function buildPersonaSystemDeepSeekV(
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

export async function quickChatDeepSeekV(
  userMessage: string,
  opts?: {
    persona?: Parameters<typeof buildPersonaSystemDeepSeekV>[0];
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    enableThinking?: boolean;
  }
) {
  const hist: ChatMessage[] = [];
  if (opts?.persona) {
    hist.push(buildPersonaSystemDeepSeekV(opts.persona));
  } else {
    hist.push(buildPersonaSystemDeepSeekV("tsundere"));
  }
  if (opts?.history?.length) {
    hist.push(...opts.history);
  }
  hist.push({ role: "user", content: userMessage });

  const { reply } = await chatDeepSeekV(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
    enableThinking: opts?.enableThinking,
  });

  return reply;
}

export default {
  chatDeepSeekV,
  quickChatDeepSeekV,
  buildPersonaSystemDeepSeekV,
};
