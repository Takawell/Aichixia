import OpenAI from "openai";
import { tavily } from "@tavily/core";

export type Role = "user" | "assistant" | "system" | "tool";

export type ChatMessage = {
  role: Role;
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
};

const GPT_API_KEY = process.env.GPT_API_KEY;
const GPT_API_URL = process.env.GPT_API_URL;
const GPT_MODEL = process.env.GPT_MODEL || "gpt-5.2";
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

if (!GPT_API_KEY) {
  console.warn("Warning: GPT_API_KEY not set in env.");
}

if (!TAVILY_API_KEY) {
  console.warn("Warning: TAVILY_API_KEY not set in env. Search will be disabled.");
}

const client = new OpenAI({
  apiKey: GPT_API_KEY,
  ...(GPT_API_URL && { baseURL: GPT_API_URL }),
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
          description: "The search query to look up on the web",
        },
      },
      required: ["query"],
    },
  },
};

export class GPTRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GPTRateLimitError";
  }
}

export class GPTQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GPTQuotaError";
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
      searchDepth: "basic",
    });

    if (response.answer) {
      return `Search Answer: ${response.answer}\n\nSources:\n${response.results
        .map(
          (r: any, i: number) =>
            `${i + 1}. ${r.title} - ${r.url}\n${r.content.substring(0, 200)}...`
        )
        .join("\n\n")}`;
    }

    return response.results
      .map(
        (r: any, i: number) =>
          `${i + 1}. ${r.title}\n${r.content.substring(0, 300)}...\nURL: ${r.url}`
      )
      .join("\n\n");
  } catch (error: any) {
    console.error("Tavily search error:", error);
    return `Search error: ${error.message || "Unknown error occurred"}`;
  }
}

export async function chatGPT(
  history: ChatMessage[],
  opts?: {
    temperature?: number;
    maxTokens?: number;
    enableSearch?: boolean;
  }
): Promise<{ reply: string }> {
  if (!GPT_API_KEY) {
    throw new Error("GPT_API_KEY not defined in environment variables.");
  }

  const enableSearch = opts?.enableSearch !== false && tavilyClient !== null;
  const maxIterations = 3;
  let iterations = 0;
  let messages = [...history];

  try {
    while (iterations < maxIterations) {
      iterations++;

      const response = await client.chat.completions.create({
        model: GPT_MODEL,
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

      const reply = message.content?.trim() ?? "I'm unable to respond right now.";
      return { reply };
    }

    return { reply: "Request took too long. Please try again." };
  } catch (error: any) {
    if (error?.status === 429) {
      throw new GPTRateLimitError(`GPT rate limit exceeded: ${error.message}`);
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new GPTQuotaError(`GPT quota exceeded: ${error.message}`);
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`GPT server error: ${error.message}`);
    }

    throw error;
  }
}

export async function quickChatGPT(
  userMessage: string,
  opts?: {
    systemPrompt?: string;
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    enableSearch?: boolean;
  }
) {
  const hist: ChatMessage[] = [];

  if (opts?.systemPrompt) {
    hist.push({ role: "system", content: opts.systemPrompt });
  }

  if (opts?.history?.length) {
    hist.push(...opts.history);
  }

  hist.push({ role: "user", content: userMessage });

  const { reply } = await chatGPT(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
    enableSearch: opts?.enableSearch,
  });

  return reply;
}

export default {
  chatGPT,
  quickChatGPT,
};
