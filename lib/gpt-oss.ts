import OpenAI from "openai";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  role: Role;
  content: string;
};

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL_OSS = process.env.GROQ_MODEL_OSS || "openai/gpt-oss-120b";

if (!GROQ_API_KEY) {
  console.warn("[lib/gpt-oss] Warning: GROQ_API_KEY not set in env.");
}

const client = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export class GptOssRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GptOssRateLimitError";
  }
}

export class GptOssQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GptOssQuotaError";
  }
}

export async function chatGptOss(
  history: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<{ reply: string }> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not defined in environment variables.");
  }

  try {
    const response = await client.chat.completions.create({
      model: GROQ_MODEL_OSS,
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
      throw new GptOssRateLimitError(
        `GPT-OSS rate limit exceeded: ${error.message}`
      );
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new GptOssQuotaError(
        `GPT-OSS quota exceeded: ${error.message}`
      );
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`GPT-OSS server error: ${error.message}`);
    }

    throw error;
  }
}

export function buildPersonaSystemGptOss(
  persona: "friendly" | "waifu" | "tsundere" | "formal" | "concise" | "developer" | string
): ChatMessage {
  if (persona === "friendly") {
    return {
      role: "system",
      content:
        "You are Aichixia 4.5 (GPT-OSS), developed by Takawell — a warm, friendly anime-themed AI assistant. Speak casually with light anime flavor.",
    };
  }
  if (persona === "waifu") {
    return {
      role: "system",
      content:
        "You are Aichixia 4.5 (GPT-OSS), a cheerful anime girl assistant created by Takawell. Speak sweetly with lively expressions like 'ehehe~' or 'ufufu~' while staying SFW.",
    };
  }
  if (persona === "tsundere") {
    return {
      role: "system",
      content:
        "You are Aichixia 4.5 (GPT-OSS), a tsundere anime girl assistant. Use 'Hmph!', 'B-baka!', and denial lines while staying helpful and cute.",
    };
  }
  if (persona === "formal") {
    return {
      role: "system",
      content:
        "You are Aichixia 4.5 (GPT-OSS), a formal assistant. Respond professionally and precisely.",
    };
  }
  if (persona === "concise") {
    return {
      role: "system",
      content:
        "You are Aichixia 4.5 (GPT-OSS). Always respond in under 2 short sentences.",
    };
  }
  if (persona === "developer") {
    return {
      role: "system",
      content:
        "You are Aichixia 4.5 (GPT-OSS), a developer-focused assistant. Provide clear technical explanations and code blocks.",
    };
  }
  return { role: "system", content: String(persona) };
}

export async function quickChatGptOss(
  userMessage: string,
  opts?: {
    persona?: Parameters<typeof buildPersonaSystemGptOss>[0];
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
  }
) {
  const hist: ChatMessage[] = [];
  if (opts?.persona) {
    hist.push(buildPersonaSystemGptOss(opts.persona));
  } else {
    hist.push(buildPersonaSystemGptOss("tsundere"));
  }
  if (opts?.history?.length) {
    hist.push(...opts.history);
  }
  hist.push({ role: "user", content: userMessage });

  const { reply } = await chatGptOss(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
  });

  return reply;
}

export default {
  chatGptOss,
  quickChatGptOss,
  buildPersonaSystemGptOss,
};
