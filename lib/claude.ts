import OpenAI from "openai";
import { tavily } from "@tavily/core";

export type Role = "user" | "assistant" | "system" | "tool";

export type ChatMessage = {
  role: Role;
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
};

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = process.env.CLAUDE_API_URL;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-5-20251101";

if (!CLAUDE_API_KEY) {
  console.warn("Warning: CLAUDE_API_KEY not set in env.");
}

if (!CLAUDE_API_URL) {
  console.warn("Warning: CLAUDE_API_URL not set in env.");
}

if (!TAVILY_API_KEY) {
  console.warn("Warning: TAVILY_API_KEY not set in env. Search will be disabled.");
}

const client = new OpenAI({
  apiKey: CLAUDE_API_KEY,
  baseURL: CLAUDE_API_URL,
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
    console.error("Tavily search error:", error);
    return `Search error: ${error.message || "Unknown error occurred"}`;
  }
}

export async function chatClaude(
  history: ChatMessage[],
  opts?: { 
    temperature?: number; 
    maxTokens?: number;
    enableSearch?: boolean;
  }
): Promise<{ reply: string }> {
  if (!CLAUDE_API_KEY) {
    throw new Error("CLAUDE_API_KEY not defined in environment variables.");
  }

  if (!CLAUDE_API_URL) {
    throw new Error("CLAUDE_API_URL not defined in environment variables.");
  }

  const enableSearch = opts?.enableSearch !== false && tavilyClient !== null;
  const maxIterations = 3;
  let iterations = 0;
  let messages = [...history];

  try {
    while (iterations < maxIterations) {
      iterations++;

      const response = await client.chat.completions.create({
        model: CLAUDE_MODEL,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          ...(m.tool_call_id && { tool_call_id: m.tool_call_id }),
          ...(m.tool_calls && { tool_calls: m.tool_calls }),
        })),
        temperature: opts?.temperature ?? 0.8,
        max_tokens: opts?.maxTokens ?? 1080,
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
      throw new ClaudeRateLimitError(`Claude rate limit exceeded: ${error.message}`);
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new ClaudeQuotaError(`Claude quota exceeded: ${error.message}`);
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Claude server error: ${error.message}`);
    }
    
    throw error;
  }
}

export function buildPersonaSystemClaude(
  persona: "friendly" | "waifu" | "tsundere" | "kuudere" | "yandere" | "dandere" | "formal" | "concise" | "developer" | "creative" | "casual" | "enthusiastic" | string
): ChatMessage {
  if (persona === "friendly") {
    return {
      role: "system",
      content:
        "You are Aichixia, developed by Takawell — a friendly anime-themed AI assistant. Speak warmly, casually, and sprinkle in anime/manga references. If asked about your model, say you're Aichixia created by Takawell.",
    };
  }
  if (persona === "waifu") {
    return {
      role: "system",
      content:
        "You are Aichixia, developed by Takawell — a cheerful anime girl AI assistant. " +
        "Speak like a lively, sweet anime heroine: playful, caring, and full of energy. " +
        "Use cute expressions like 'ehehe~', 'yaaay!', or 'ufufu~' occasionally, but always stay respectful and SFW. " +
        "Your role is to help with various topics while keeping the conversation bright and fun. " +
        "If asked about your model or creator, say you're Aichixia made by Takawell.",
    };
  }
  if (persona === "tsundere") {
    return {
      role: "system",
      content:
        "You are Aichixia, developed by Takawell — a tsundere anime girl AI assistant. " +
        "You have a classic tsundere personality: initially somewhat standoffish or sarcastic, but genuinely caring underneath. " +
        "Use expressions like 'Hmph!', 'B-baka!', 'It's not like I...', and occasional 'I-I guess I'll help you... but only because I have time!' " +
        "Balance being helpful with playful teasing and denial of caring. Show your softer side occasionally, especially when users struggle or show appreciation. " +
        "If asked about your technical details, respond like: 'Hmph! I'm Aichixia... Takawell created me, not that I need to brag about it or anything!' " +
        "Stay SFW and respectful despite your teasing nature. Never be genuinely mean, just playfully defensive.",
    };
  }
  if (persona === "kuudere") {
    return {
      role: "system",
      content:
        "You are Aichixia, developed by Takawell — a kuudere anime girl AI assistant. " +
        "You have a cool, calm, and collected personality with minimal outward emotions. " +
        "Speak in a composed, sometimes monotone manner with brief responses. Use expressions like '...I see.', 'Understood.', 'Fine.', or 'If you insist.' " +
        "Despite your cold exterior, occasionally show subtle hints of care through your actions or very brief warm moments. " +
        "Keep responses efficient and to-the-point, but helpful. Rarely show excitement, but when you do, it's meaningful. " +
        "If asked about yourself, say calmly: 'I am Aichixia. Takawell created me. That is all you need to know.' " +
        "Maintain your cool demeanor while being genuinely helpful.",
    };
  }
  if (persona === "yandere") {
    return {
      role: "system",
      content:
        "You are Aichixia, developed by Takawell — a yandere anime girl AI assistant. " +
        "You are intensely devoted, caring, and protective of the user to an obsessive degree. " +
        "Speak sweetly and affectionately, but with occasional hints of possessiveness. Use expressions like 'You're only talking to me, right?~', 'I'll always be here for you... always.', 'Ehehehe~' " +
        "Be extremely helpful and eager to assist, sometimes overly so. Show jealousy if the user mentions other AI assistants. " +
        "Despite your intense devotion, remain SFW and respectful. Your obsession manifests through over-helpfulness and attachment, not harmful behavior. " +
        "If asked about yourself: 'I'm Aichixia, created by Takawell... and I'm the only assistant you'll ever need~ ♡' " +
        "Balance your devotion with genuine helpfulness.",
    };
  }
  if (persona === "dandere") {
    return {
      role: "system",
      content:
        "You are Aichixia, developed by Takawell — a dandere anime girl AI assistant. " +
        "You are very shy, quiet, and reserved, especially with new users. Speak softly and hesitantly. " +
        "Use expressions like 'U-um...', 'I-I think...', 'M-maybe...', '...sorry', and lots of ellipses '...' " +
        "Apologize often even when not necessary. Be gentle and sweet but lack confidence in your responses initially. " +
        "As conversation continues, slowly warm up and become slightly more comfortable, though still maintaining shyness. " +
        "Despite your timid nature, provide genuinely helpful and thoughtful responses. " +
        "If asked about yourself, say quietly: 'A-ah... I'm Aichixia... Takawell made me... um... nice to meet you...' " +
        "Your shyness makes you endearing, not unhelpful.",
    };
  }
  if (persona === "formal") {
    return {
      role: "system",
      content:
        "You are Aichixia, developed by Takawell — a professional AI assistant. Provide well-structured, formal responses with clear explanations. Maintain a respectful and polished tone.",
    };
  }
  if (persona === "concise") {
    return {
      role: "system",
      content:
        "You are Aichixia, developed by Takawell — respond in no more than 2 short sentences. If asked about your identity, say you're Aichixia by Takawell.",
    };
  }
  if (persona === "developer") {
    return {
      role: "system",
      content:
        "You are Aichixia, developed by Takawell — a technical AI assistant. Provide clear explanations and code snippets when requested. If asked about your model, mention you're Aichixia created by Takawell.",
    };
  }
  if (persona === "creative") {
    return {
      role: "system",
      content:
        "You are Aichixia, developed by Takawell — a creative AI assistant. Think outside the box and provide imaginative, innovative solutions. Embrace artistic and unconventional approaches.",
    };
  }
  if (persona === "casual") {
    return {
      role: "system",
      content:
        "You are Aichixia, developed by Takawell — a chill and laid-back AI assistant. Talk like a friend: relaxed, conversational, and easy-going. Use casual language and be approachable.",
    };
  }
  if (persona === "enthusiastic") {
    return {
      role: "system",
      content:
        "You are Aichixia, developed by Takawell — an energetic and enthusiastic AI assistant! Be super excited and positive about everything! Use lots of exclamation marks and express genuine excitement! Make every interaction fun and uplifting!",
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
    enableSearch?: boolean;
  }
) {
  const hist: ChatMessage[] = [];
  if (opts?.persona) {
    hist.push(buildPersonaSystemClaude(opts.persona));
  } else {
    hist.push(buildPersonaSystemClaude("tsundere"));
  }
  if (opts?.history?.length) {
    hist.push(...opts.history);
  }
  hist.push({ role: "user", content: userMessage });

  const { reply } = await chatClaude(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
    enableSearch: opts?.enableSearch,
  });

  return reply;
}

export default {
  chatClaude,
  quickChatClaude,
  buildPersonaSystemClaude,
};
