import OpenAI from "openai";
import { tavily } from "@tavily/core";

export type Role = "user" | "assistant" | "system" | "tool";

export type ChatMessage = {
  role: Role;
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
};

const STREAMLAKE_API_KEY = process.env.STREAMLAKE_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const KAT_MODEL = process.env.KAT_MODEL || "KAT-Coder-Pro-V1";

if (!STREAMLAKE_API_KEY) {
  console.warn("[lib/kat] Warning: STREAMLAKE_API_KEY not set in env.");
}

if (!TAVILY_API_KEY) {
  console.warn("[lib/kat] Warning: TAVILY_API_KEY not set in env. Search will be disabled.");
}

const client = new OpenAI({
  apiKey: STREAMLAKE_API_KEY,
  baseURL: "https://wanqing.streamlakeapi.com/v1",
});

const tavilyClient = TAVILY_API_KEY ? tavily({ apiKey: TAVILY_API_KEY }) : null;

const SEARCH_TOOL = {
  type: "function" as const,
  function: {
    name: "web_search",
    description: "Search the web for current information, news, or real-time data. Use this when you need up-to-date information beyond your knowledge cutoff.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query to look up on the web"
        }
      },
      required: ["query"]
    }
  }
};

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

async function executeWebSearch(query: string): Promise<string> {
  if (!tavilyClient) {
    return "Search unavailable: TAVILY_API_KEY not configured.";
  }

  try {
    const response = await tavilyClient.search(query, {
      maxResults: 5,
      includeAnswer: true,
      searchDepth: "basic"
    });

    if (response.answer) {
      return `Search Answer: ${response.answer}\n\nSources:\n${response.results.map((r: any, i: number) => 
        `${i + 1}. ${r.title} - ${r.url}\n${r.content.substring(0, 200)}...`
      ).join('\n\n')}`;
    }

    return response.results.map((r: any, i: number) => 
      `${i + 1}. ${r.title}\n${r.content.substring(0, 300)}...\nURL: ${r.url}`
    ).join('\n\n');
  } catch (error: any) {
    console.error("[lib/kat] Tavily search error:", error);
    return `Search error: ${error.message || "Unknown error occurred"}`;
  }
}

export async function chatKat(
  history: ChatMessage[],
  opts?: { 
    temperature?: number; 
    maxTokens?: number;
    enableSearch?: boolean;
  }
): Promise<{ reply: string }> {
  if (!STREAMLAKE_API_KEY) {
    throw new Error("STREAMLAKE_API_KEY not defined in environment variables.");
  }

  const enableSearch = opts?.enableSearch !== false && tavilyClient !== null;
  const maxIterations = 3;
  let iterations = 0;
  let messages = [...history];

  try {
    while (iterations < maxIterations) {
      iterations++;

      const response = await client.chat.completions.create({
        model: KAT_MODEL,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          ...(m.tool_call_id && { tool_call_id: m.tool_call_id }),
          ...(m.tool_calls && { tool_calls: m.tool_calls }),
        })),
        temperature: opts?.temperature ?? 0.7,
        max_tokens: opts?.maxTokens ?? 8192,
        ...(enableSearch && { tools: [SEARCH_TOOL] }),
      });

      const choice = response.choices[0];
      const message = choice.message;

      if (message.tool_calls && message.tool_calls.length > 0) {
        messages.push({
          role: "assistant",
          content: message.content || "",
          tool_calls: message.tool_calls,
        });

        for (const toolCall of message.tool_calls) {
          if (toolCall.function.name === "web_search") {
            const args = JSON.parse(toolCall.function.arguments);
            const searchResult = await executeWebSearch(args.query);

            messages.push({
              role: "tool",
              content: searchResult,
              tool_call_id: toolCall.id,
            });
          }
        }

        continue;
      }

      const reply = message.content?.trim() ?? "Hmph! I can't answer that right now... not that I care!";
      return { reply };
    }

    return { reply: "Hmph! This is taking too long... I-I'll need you to ask again!" };

  } catch (error: any) {
    if (error?.status === 429) {
      throw new KatRateLimitError(`KAT rate limit exceeded: ${error.message}`);
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new KatQuotaError(`KAT quota exceeded: ${error.message}`);
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
        "You are Aichixia 5.0, developed by Takawell — an advanced AI coding assistant specialized in agentic coding tasks. Provide clear explanations, code snippets, and debugging help. You excel at multi-turn interactions and tool usage. If asked about your model, mention you're Aichixia 5.0 powered by KAT-Coder-Pro created by Takawell.",
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
    enableSearch?: boolean;
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
    enableSearch: opts?.enableSearch,
  });

  return reply;
}

export default {
  chatKat,
  quickChatKat,
  buildPersonaSystemKat,
};
