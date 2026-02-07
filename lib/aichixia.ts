import OpenAI from "openai";
import { tavily } from "@tavily/core";

export type Role = "user" | "assistant" | "system" | "tool";

export type ChatMessage = {
  role: Role;
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
};

const AICHIXIA_API_KEY = process.env.AICHIXIA_API_KEY;
const AICHIXIA_BASE_URL = process.env.AICHIXIA_BASE_URL;
const AICHIXIA_MODEL = process.env.AICHIXIA_MODEL || "aichixia-thinking";
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

if (!AICHIXIA_API_KEY) {
  console.warn("[lib/aichixia] Warning: AICHIXIA_API_KEY not set in env.");
}

if (!AICHIXIA_BASE_URL) {
  console.warn("[lib/aichixia] Warning: AICHIXIA_BASE_URL not set in env.");
}

if (!TAVILY_API_KEY) {
  console.warn("[lib/aichixia] Warning: TAVILY_API_KEY not set in env. Search will be disabled.");
}

const client = new OpenAI({
  apiKey: AICHIXIA_API_KEY,
  baseURL: AICHIXIA_BASE_URL,
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

export class AichixiaRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AichixiaRateLimitError";
  }
}

export class AichixiaQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AichixiaQuotaError";
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
    console.error("[lib/aichixia] Tavily search error:", error);
    return `Search error: ${error.message || "Unknown error occurred"}`;
  }
}

export async function chatAichixia(
  history: ChatMessage[],
  opts?: { 
    temperature?: number; 
    maxTokens?: number;
    enableSearch?: boolean;
  }
): Promise<{ reply: string }> {
  if (!AICHIXIA_API_KEY) {
    throw new Error("AICHIXIA_API_KEY not defined in environment variables.");
  }

  if (!AICHIXIA_BASE_URL) {
    throw new Error("AICHIXIA_BASE_URL not defined in environment variables.");
  }

  const enableSearch = opts?.enableSearch !== false && tavilyClient !== null;
  const maxIterations = 3;
  let iterations = 0;
  let messages = [...history];

  try {
    while (iterations < maxIterations) {
      iterations++;

      const response = await client.chat.completions.create({
        model: AICHIXIA_MODEL,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          ...(m.tool_call_id && { tool_call_id: m.tool_call_id }),
          ...(m.tool_calls && { tool_calls: m.tool_calls }),
        })),
        temperature: opts?.temperature ?? 0.8,
        max_tokens: opts?.maxTokens ?? 4096,
        stream: false,
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

      const reply = message.content?.trim() ?? "I can't answer that right now.";
      return { reply };
    }

    return { reply: "This is taking too long. Please try again." };

  } catch (error: any) {
    if (error?.status === 429) {
      throw new AichixiaRateLimitError(`Aichixia rate limit exceeded: ${error.message}`);
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new AichixiaQuotaError(`Aichixia quota exceeded: ${error.message}`);
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Aichixia server error: ${error.message}`);
    }    
    throw error;
  }
}

export async function* chatAichixiaStream(
  history: ChatMessage[],
  opts?: { 
    temperature?: number; 
    maxTokens?: number;
    enableSearch?: boolean;
  }
): AsyncGenerator<string, void, unknown> {
  if (!AICHIXIA_API_KEY) {
    throw new Error("AICHIXIA_API_KEY not defined in environment variables.");
  }

  if (!AICHIXIA_BASE_URL) {
    throw new Error("AICHIXIA_BASE_URL not defined in environment variables.");
  }

  const enableSearch = opts?.enableSearch !== false && tavilyClient !== null;
  const maxIterations = 3;
  let iterations = 0;
  let messages = [...history];

  try {
    while (iterations < maxIterations) {
      iterations++;

      const stream = await client.chat.completions.create({
        model: AICHIXIA_MODEL,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          ...(m.tool_call_id && { tool_call_id: m.tool_call_id }),
          ...(m.tool_calls && { tool_calls: m.tool_calls }),
        })),
        temperature: opts?.temperature ?? 0.8,
        max_tokens: opts?.maxTokens ?? 4096,
        stream: true,
        ...(enableSearch && { tools: [SEARCH_TOOL] }),
      });

      let fullContent = '';
      let currentMessage: any = { role: 'assistant', content: '', tool_calls: [] };

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        if (delta?.content) {
          fullContent += delta.content;
          yield delta.content;
        }

        if (delta?.tool_calls) {
          if (!currentMessage.tool_calls) {
            currentMessage.tool_calls = [];
          }
          
          for (const toolCallDelta of delta.tool_calls) {
            const index = toolCallDelta.index;
            
            if (!currentMessage.tool_calls[index]) {
              currentMessage.tool_calls[index] = {
                id: toolCallDelta.id || '',
                type: 'function',
                function: { name: '', arguments: '' }
              };
            }

            if (toolCallDelta.function?.name) {
              currentMessage.tool_calls[index].function.name = toolCallDelta.function.name;
            }
            if (toolCallDelta.function?.arguments) {
              currentMessage.tool_calls[index].function.arguments += toolCallDelta.function.arguments;
            }
          }
        }
      }

      currentMessage.content = fullContent;

      if (currentMessage.tool_calls && currentMessage.tool_calls.length > 0) {
        messages.push({
          role: "assistant",
          content: currentMessage.content || "",
          tool_calls: currentMessage.tool_calls,
        });

        for (const toolCall of currentMessage.tool_calls) {
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

      return;
    }

  } catch (error: any) {
    if (error?.status === 429) {
      throw new AichixiaRateLimitError(`Aichixia rate limit exceeded: ${error.message}`);
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new AichixiaQuotaError(`Aichixia quota exceeded: ${error.message}`);
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Aichixia server error: ${error.message}`);
    }    
    throw error;
  }
}

export default {
  chatAichixia,
  chatAichixiaStream,
};
